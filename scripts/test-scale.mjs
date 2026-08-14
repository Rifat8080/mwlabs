import crypto from "node:crypto";
import mariadb from "mariadb";

const baseUrl = process.env.SCALE_TEST_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000";
const connectionUrl = process.env.DATABASE_URL?.replace(/^mysql:/, "mariadb:");
if (!connectionUrl) throw new Error("DATABASE_URL is required.");

const runId = crypto.randomUUID();
const email = `scale-smoke-${runId}@example.com`;
const password = `Sc1!${crypto.randomBytes(16).toString("hex")}`;
const organizationId = crypto.randomUUID();
const pool = mariadb.createPool(connectionUrl);
let userId = null;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function request(path, init = {}, cookie = "") {
  return fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Origin: baseUrl,
      ...(cookie ? { Cookie: cookie } : {}),
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
}

async function cleanup() {
  await pool.query("DELETE FROM organization WHERE id = ?", [organizationId]);
  if (userId) await pool.query("DELETE FROM user WHERE id = ?", [userId]);
  await pool.query("DELETE FROM user WHERE email = ?", [email]);
}

try {
  await cleanup();
  const signup = await request("/api/auth/sign-up/email", {
    method: "POST",
    body: JSON.stringify({ name: "Scale Smoke Owner", email, password }),
  });
  const signupBody = await signup.json();
  assert(signup.ok && signupBody.user?.id, `Scale sign-up failed (${signup.status}).`);
  userId = signupBody.user.id;
  const cookies = typeof signup.headers.getSetCookie === "function" ? signup.headers.getSetCookie() : [signup.headers.get("set-cookie")].filter(Boolean);
  const cookie = cookies.map((value) => value.split(";", 1)[0]).join("; ");
  assert(cookie, "Scale test session cookie was not created.");

  await pool.query(
    "INSERT INTO organization (id, name, slug, createdAt, updatedAt) VALUES (?, ?, ?, UTC_TIMESTAMP(3), UTC_TIMESTAMP(3))",
    [organizationId, "Scale Smoke Workspace", `scale-smoke-${runId}`],
  );
  await pool.query(
    "INSERT INTO member (id, organizationId, userId, role, createdAt) VALUES (?, ?, ?, 'owner', UTC_TIMESTAMP(3))",
    [crypto.randomUUID(), organizationId, userId],
  );

  const rows = Array.from({ length: 2_000 }, (_, index) => [
    crypto.randomUUID(),
    organizationId,
    "scale.smoke",
    `Scale Smoke ${runId} item ${String(index).padStart(4, "0")}`,
    "Synthetic high-volume verification record.",
  ]);
  for (let offset = 0; offset < rows.length; offset += 250) {
    await pool.batch(
      "INSERT INTO Activity (id, organizationId, type, title, body, occurredAt) VALUES (?, ?, ?, ?, ?, UTC_TIMESTAMP(3))",
      rows.slice(offset, offset + 250),
    );
  }

  const firstStarted = performance.now();
  const first = await request("/api/crud/activities?limit=50", {}, cookie);
  const firstText = await first.text();
  const firstBody = JSON.parse(firstText);
  const firstMs = performance.now() - firstStarted;
  assert(first.ok, `Paginated scale query failed (${first.status}).`);
  assert(firstBody.records?.length === 50, `Expected 50 records, received ${firstBody.records?.length ?? 0}.`);
  assert(firstBody.page?.total === 2_000 && firstBody.page?.hasMore && firstBody.page?.nextCursor, "Pagination metadata is incomplete.");
  assert(Buffer.byteLength(firstText) < 512 * 1024, "A single page response is unexpectedly larger than 512 KB.");

  const second = await request(`/api/crud/activities?limit=50&cursor=${encodeURIComponent(firstBody.page.nextCursor)}`, {}, cookie);
  const secondBody = await second.json();
  assert(second.ok && secondBody.records?.length === 50, "The next cursor page did not load.");
  const firstIds = new Set(firstBody.records.map((record) => record.id));
  assert(secondBody.records.every((record) => !firstIds.has(record.id)), "Cursor pages contain duplicate records.");

  const search = await request(`/api/crud/activities?limit=50&q=${encodeURIComponent(`${runId} item 0199`)}`, {}, cookie);
  const searchBody = await search.json();
  assert(search.ok && searchBody.page?.total === 1 && searchBody.records?.length === 1, "Server-side search did not narrow the large dataset.");

  const bulkRecords = Array.from({ length: 25 }, (_, index) => ({
    type: "scale.bulk",
    title: `Scale API ${runId} item ${index}`,
    body: "Bounded bulk API verification record.",
  }));
  const bulkStarted = performance.now();
  const bulk = await request("/api/crud/activities", { method: "POST", body: JSON.stringify({ records: bulkRecords }) }, cookie);
  const bulkBody = await bulk.json();
  const bulkMs = performance.now() - bulkStarted;
  assert(bulk.ok && bulkBody.records?.length === 25 && bulkBody.failures?.length === 0, `Bulk create failed (${bulk.status}).`);

  const [stored] = await pool.query("SELECT COUNT(*) count FROM Activity WHERE organizationId = ?", [organizationId]);
  assert(Number(stored.count) === 2_025, `Expected 2,025 stored rows, received ${stored.count}.`);

  console.log(`Scale smoke passed: 2,000-row cursor query ${firstMs.toFixed(0)}ms, 25-row audited bulk create ${bulkMs.toFixed(0)}ms, bounded response ${Buffer.byteLength(firstText)} bytes.`);
} finally {
  await cleanup();
  await pool.end();
}
