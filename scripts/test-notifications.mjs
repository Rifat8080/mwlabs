import crypto from "node:crypto";
import mariadb from "mariadb";

const baseUrl = process.env.NOTIFICATION_TEST_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000";
const email = "notification-smoke-test@example.com";
const password = `Nt1!${crypto.randomBytes(16).toString("hex")}`;
const connectionUrl = process.env.DATABASE_URL?.replace(/^mysql:/, "mariadb:");

if (!connectionUrl) throw new Error("DATABASE_URL is required.");

const pool = mariadb.createPool(connectionUrl);
let userId = null;
let activityId = null;
let organizationId = null;

async function clean() {
  const notificationIds = new Set();
  const matching = await pool.query("SELECT id FROM Notification WHERE resource = ? AND message LIKE ?", ["activities", "%Notification Smoke Test%"]);
  for (const notification of matching) notificationIds.add(notification.id);
  if (activityId) {
    const related = await pool.query("SELECT id FROM Notification WHERE resourceId = ?", [activityId]);
    for (const notification of related) notificationIds.add(notification.id);
  }
  if (notificationIds.size) {
    const keys = Array.from(notificationIds, (id) => `notification-email:${id}`);
    await pool.query("DELETE FROM BackgroundJob WHERE idempotencyKey IN (?)", [keys]);
  }
  await pool.query("DELETE FROM Notification WHERE resource = ? AND message LIKE ?", ["activities", "%Notification Smoke Test%"]);
  if (activityId) {
    await pool.query("DELETE FROM Notification WHERE resourceId = ?", [activityId]);
    await pool.query("DELETE FROM AuditLog WHERE resourceId = ?", [activityId]);
    await pool.query("DELETE FROM Activity WHERE id = ?", [activityId]);
  }
  const users = await pool.query("SELECT id FROM user WHERE email = ?", [email]);
  for (const user of users) {
    await pool.query("DELETE FROM AuditLog WHERE userId = ?", [user.id]);
    await pool.query("DELETE FROM user WHERE id = ?", [user.id]);
  }
}

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

try {
  await clean();
  const signup = await request("/api/auth/sign-up/email", {
    method: "POST",
    body: JSON.stringify({ name: "Notification Smoke Test", email, password }),
  });
  const signupBody = await signup.json();
  assert(signup.ok && signupBody.user?.id, `Sign-up failed with ${signup.status}.`);
  userId = signupBody.user.id;
  const cookies = typeof signup.headers.getSetCookie === "function"
    ? signup.headers.getSetCookie()
    : [signup.headers.get("set-cookie")].filter(Boolean);
  const cookie = cookies.map((value) => value.split(";", 1)[0]).join("; ");
  assert(cookie, "The test session cookie was not created.");

  const organizations = await pool.query("SELECT id FROM organization WHERE slug = ? LIMIT 1", ["mw-labs"]);
  assert(organizations[0]?.id, "The mw-labs organization is not configured.");
  organizationId = organizations[0].id;
  await pool.query("INSERT INTO member (id, organizationId, userId, role, createdAt) VALUES (?, ?, ?, ?, NOW(3))", [crypto.randomUUID(), organizationId, userId, "owner"]);

  const created = await request("/api/crud/activities", {
    method: "POST",
    body: JSON.stringify({ data: { type: "test.notification", title: "Notification smoke activity", body: "Temporary verification record." } }),
  }, cookie);
  const createdBody = await created.json();
  assert(created.status === 201 && createdBody.record?.id, `Activity create failed with ${created.status}.`);
  activityId = createdBody.record.id;

  let notification = null;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const inbox = await request("/api/notifications?limit=10", {}, cookie);
    const inboxBody = await inbox.json();
    notification = inboxBody.notifications?.find((item) => item.resourceId === activityId && item.type === "activities.created") ?? null;
    if (notification && notification.emailStatus !== "Pending") break;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  assert(notification, "The CRUD notification was not created.");
  assert(["Deferred", "Sent", "Failed"].includes(notification.emailStatus), `Unexpected email status: ${notification.emailStatus}.`);

  const inboxPage = await request("/app/inbox", {}, cookie);
  const inboxHtml = await inboxPage.text();
  assert(inboxPage.ok && inboxHtml.includes("Notification inbox"), "The authenticated notification inbox did not render.");

  const read = await request("/api/notifications", { method: "PATCH", body: JSON.stringify({ action: "read", id: notification.id }) }, cookie);
  assert(read.ok, "The notification could not be marked read.");

  const preference = await request("/api/notifications/preferences", { method: "PATCH", body: JSON.stringify({ emailCrud: false }) }, cookie);
  const preferenceBody = await preference.json();
  assert(preference.ok && preferenceBody.preference?.emailCrud === false, "Notification preferences were not saved.");

  const deleted = await request("/api/crud/activities", { method: "DELETE", body: JSON.stringify({ id: activityId }) }, cookie);
  assert(deleted.ok, "The temporary activity could not be deleted through CRUD.");

  console.log("Notification smoke test passed: CRUD event, inbox, email fallback, read state, preferences, and delete flow.");
} finally {
  await clean();
  await pool.end();
}
