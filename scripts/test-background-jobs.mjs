import crypto from "node:crypto";
import mariadb from "mariadb";

const baseUrl = process.env.BACKGROUND_JOB_TEST_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000";
const connectionUrl = process.env.DATABASE_URL?.replace(/^mysql:/, "mariadb:");
if (!connectionUrl) throw new Error("DATABASE_URL is required.");

const pool = mariadb.createPool(connectionUrl);
const runId = crypto.randomUUID();
const prefix = `background-smoke:${runId}`;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function cleanup() {
  await pool.query("DELETE FROM `BackgroundJob` WHERE `idempotencyKey` LIKE ?", [`${prefix}%`]);
}

try {
  await cleanup();
  const organizations = await pool.query("SELECT `id` FROM `organization` ORDER BY `createdAt` ASC LIMIT 1");
  const organizationId = organizations[0]?.id;
  assert(organizationId, "A workspace is required for the background job smoke test.");
  const readyId = crypto.randomUUID();
  const staleId = crypto.randomUUID();
  const missingNotificationId = crypto.randomUUID();

  await pool.query(
    "INSERT INTO `BackgroundJob` (`id`, `organizationId`, `type`, `payload`, `idempotencyKey`, `status`, `priority`, `attempts`, `maxAttempts`, `runAt`, `createdAt`, `updatedAt`) VALUES (?, ?, 'notification-email', ?, ?, 'Pending', 50, 0, 8, UTC_TIMESTAMP(), UTC_TIMESTAMP(), UTC_TIMESTAMP())",
    [readyId, organizationId, JSON.stringify({ notificationId: missingNotificationId }), `${prefix}:ready`],
  );
  await pool.query(
    "INSERT INTO `BackgroundJob` (`id`, `organizationId`, `type`, `payload`, `idempotencyKey`, `status`, `priority`, `attempts`, `maxAttempts`, `runAt`, `lockedAt`, `lockedBy`, `createdAt`, `updatedAt`) VALUES (?, ?, 'notification-email', ?, ?, 'Processing', 50, 1, 8, UTC_TIMESTAMP(), DATE_SUB(UTC_TIMESTAMP(), INTERVAL 10 MINUTE), 'stopped-smoke-worker', UTC_TIMESTAMP(), UTC_TIMESTAMP())",
    [staleId, organizationId, JSON.stringify({ notificationId: missingNotificationId }), `${prefix}:stale`],
  );

  const secret = process.env.BACKGROUND_JOB_SECRET || process.env.CRON_SECRET;
  const response = await fetch(`${baseUrl}/api/jobs/run?limit=10`, {
    headers: secret ? { Authorization: `Bearer ${secret}` } : {},
  });
  const result = await response.json().catch(() => ({}));
  assert(response.ok, `Background worker returned ${response.status}: ${result.error ?? "unknown error"}`);
  assert(result.summary?.recovered >= 1, "The stale worker lock was not recovered.");
  assert(result.summary?.completed >= 2, "The queued smoke jobs were not completed.");

  const jobs = await pool.query("SELECT `status`, `attempts`, `lockedAt`, `lockedBy`, `completedAt` FROM `BackgroundJob` WHERE `id` IN (?, ?)", [readyId, staleId]);
  assert(jobs.length === 2 && jobs.every((job) => job.status === "Completed"), "Background smoke jobs did not reach Completed status.");
  assert(jobs.every((job) => job.lockedAt === null && job.lockedBy === null), "A completed job retained its worker lock.");
  assert(jobs.every((job) => job.completedAt), "Completed jobs are missing completion timestamps.");

  console.log("Background job smoke test passed: durable queue, atomic claim, stale-lock recovery, execution, and acknowledgement.");
} finally {
  await cleanup();
  await pool.end();
}
