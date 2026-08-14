import "server-only";

import { createHash } from "node:crypto";
import { after } from "next/server";
import { z } from "zod";

import { notificationEmailTemplate, sendEmail, type EmailResult } from "@/lib/email";
import { db } from "@/lib/db";

const notificationEmailPayload = z.object({ notificationId: z.string().min(1).max(191) });
const workflowEmailPayload = z.object({
  to: z.email().max(320),
  recipientName: z.string().max(191).nullish(),
  title: z.string().min(1).max(300),
  message: z.string().min(1).max(10_000),
  actionLabel: z.string().max(120).optional(),
  actionUrl: z.string().max(2_000).nullish(),
  emailIdempotencyKey: z.string().min(1).max(256),
});

export type WorkflowEmailJob = z.infer<typeof workflowEmailPayload> & { organizationId?: string | null };

type RunOptions = {
  organizationId?: string;
  jobIds?: string[];
  limit?: number;
  concurrency?: number;
};

type RunSummary = {
  pruned: number;
  recovered: number;
  claimed: number;
  completed: number;
  retried: number;
  deferred: number;
  dead: number;
};

class PermanentJobError extends Error {}

function retentionDays() {
  const configured = Number(process.env.BACKGROUND_JOB_RETENTION_DAYS || 30);
  return Number.isFinite(configured) ? Math.min(365, Math.max(1, Math.floor(configured))) : 30;
}

function durableKey(prefix: string, value: string) {
  const candidate = `${prefix}:${value}`;
  return candidate.length <= 191 ? candidate : `${prefix}:${createHash("sha256").update(value).digest("hex")}`;
}

function scheduleRun(jobIds: string[]) {
  if (!jobIds.length) return;
  after(async () => {
    try {
      await processBackgroundJobs({ jobIds, limit: Math.min(12, jobIds.length), concurrency: 3 });
    } catch (error) {
      console.error("Immediate background job processing failed", error);
    }
  });
}

export async function queueNotificationEmailJobs(organizationId: string, notificationIds: string[], reset = false) {
  const uniqueIds = Array.from(new Set(notificationIds));
  const jobs = await Promise.all(uniqueIds.map((notificationId) => db.backgroundJob.upsert({
    where: { idempotencyKey: durableKey("notification-email", notificationId) },
    create: {
      organizationId,
      type: "notification-email",
      payload: JSON.stringify({ notificationId }),
      idempotencyKey: durableKey("notification-email", notificationId),
      priority: 10,
    },
    update: reset ? {
      status: "Pending",
      attempts: 0,
      runAt: new Date(),
      lockedAt: null,
      lockedBy: null,
      lastError: null,
      completedAt: null,
    } : {},
    select: { id: true },
  })));
  const jobIds = jobs.map((job) => job.id);
  scheduleRun(jobIds);
  return jobIds;
}

export async function queueWorkflowEmailJob(input: WorkflowEmailJob) {
  const parsed = workflowEmailPayload.parse(input);
  const idempotencyKey = durableKey("workflow-email", parsed.emailIdempotencyKey);
  const job = await db.backgroundJob.upsert({
    where: { idempotencyKey },
    create: {
      organizationId: input.organizationId || null,
      type: "workflow-email",
      payload: JSON.stringify(parsed),
      idempotencyKey,
      priority: 20,
    },
    update: {},
    select: { id: true },
  });
  scheduleRun([job.id]);
  return job.id;
}

async function deliverNotificationEmail(notificationId: string): Promise<EmailResult> {
  const notification = await db.notification.findUnique({
    where: { id: notificationId },
    select: {
      id: true,
      title: true,
      message: true,
      actionUrl: true,
      emailRequested: true,
      emailStatus: true,
      user: { select: { name: true, email: true } },
    },
  });
  if (!notification || !notification.emailRequested) return { status: "Sent" };
  if (notification.emailStatus === "Sent") return { status: "Sent" };

  const template = notificationEmailTemplate({
    recipientName: notification.user.name,
    title: notification.title,
    message: notification.message || notification.title,
    actionUrl: notification.actionUrl,
  });
  const result = await sendEmail({
    to: notification.user.email,
    subject: `[M&W Command] ${notification.title}`,
    html: template.html,
    text: template.text,
    idempotencyKey: `notification-${notification.id}`,
  });
  await db.notification.updateMany({
    where: { id: notification.id },
    data: {
      emailStatus: result.status,
      emailMessageId: result.messageId ?? null,
      emailError: result.error?.slice(0, 4_000) ?? null,
      emailedAt: result.status === "Sent" ? new Date() : null,
    },
  });
  return result;
}

async function executeJob(job: { type: string; payload: string }): Promise<EmailResult> {
  let payload: unknown;
  try {
    payload = JSON.parse(job.payload);
  } catch {
    throw new PermanentJobError("Job payload is not valid JSON.");
  }

  if (job.type === "notification-email") {
    const parsed = notificationEmailPayload.safeParse(payload);
    if (!parsed.success) throw new PermanentJobError("Notification email payload is invalid.");
    return deliverNotificationEmail(parsed.data.notificationId);
  }
  if (job.type === "workflow-email") {
    const parsed = workflowEmailPayload.safeParse(payload);
    if (!parsed.success) throw new PermanentJobError("Workflow email payload is invalid.");
    const template = notificationEmailTemplate({
      recipientName: parsed.data.recipientName,
      title: parsed.data.title,
      message: parsed.data.message,
      actionLabel: parsed.data.actionLabel,
      actionUrl: parsed.data.actionUrl,
    });
    return sendEmail({
      to: parsed.data.to,
      subject: parsed.data.title,
      html: template.html,
      text: template.text,
      idempotencyKey: parsed.data.emailIdempotencyKey,
    });
  }
  throw new PermanentJobError(`Unsupported background job type: ${job.type}`);
}

async function recoverStaleJobs() {
  const staleBefore = new Date(Date.now() - 5 * 60_000);
  const stale = await db.backgroundJob.findMany({
    where: { status: "Processing", lockedAt: { lte: staleBefore } },
    select: { id: true, attempts: true, maxAttempts: true },
    take: 100,
  });
  let recovered = 0;
  for (const job of stale) {
    const dead = job.attempts >= job.maxAttempts;
    const result = await db.backgroundJob.updateMany({
      where: { id: job.id, status: "Processing", lockedAt: { lte: staleBefore } },
      data: {
        status: dead ? "Dead" : "Pending",
        runAt: dead ? undefined : new Date(),
        lockedAt: null,
        lockedBy: null,
        completedAt: dead ? new Date() : null,
        lastError: "Recovered after a worker stopped before acknowledging the job.",
      },
    });
    recovered += result.count;
  }
  return recovered;
}

async function pruneCompletedJobs() {
  const completedBefore = new Date(Date.now() - retentionDays() * 24 * 60 * 60_000);
  const result = await db.backgroundJob.deleteMany({
    where: { status: "Completed", completedAt: { lte: completedBefore } },
  });
  return result.count;
}

export async function processBackgroundJobs(options: RunOptions = {}): Promise<RunSummary> {
  const limit = Math.min(50, Math.max(1, options.limit ?? 12));
  const concurrency = Math.min(5, Math.max(1, options.concurrency ?? 3));
  const workerId = `worker-${process.pid}-${crypto.randomUUID().slice(0, 8)}`;
  const recovered = await recoverStaleJobs();
  // Recovery schedules stale jobs at the current time, so capture the claim
  // boundary afterwards and make them eligible in this same worker pass.
  const now = new Date();
  const summary: RunSummary = { pruned: await pruneCompletedJobs(), recovered, claimed: 0, completed: 0, retried: 0, deferred: 0, dead: 0 };
  const candidates = await db.backgroundJob.findMany({
    where: {
      status: "Pending",
      runAt: { lte: now },
      ...(options.organizationId ? { organizationId: options.organizationId } : {}),
      ...(options.jobIds?.length ? { id: { in: options.jobIds } } : {}),
    },
    orderBy: [{ priority: "desc" }, { runAt: "asc" }, { createdAt: "asc" }],
    take: limit * 2,
    select: { id: true },
  });

  const claimedIds: string[] = [];
  for (const candidate of candidates) {
    if (claimedIds.length >= limit) break;
    const result = await db.backgroundJob.updateMany({
      where: { id: candidate.id, status: "Pending", runAt: { lte: now } },
      data: { status: "Processing", lockedAt: now, lockedBy: workerId, attempts: { increment: 1 } },
    });
    if (result.count) claimedIds.push(candidate.id);
  }
  const claimed = claimedIds.length ? await db.backgroundJob.findMany({
    where: { id: { in: claimedIds }, status: "Processing", lockedBy: workerId },
    select: { id: true, type: true, payload: true, attempts: true, maxAttempts: true },
  }) : [];
  summary.claimed = claimed.length;

  let cursor = 0;
  async function work() {
    while (cursor < claimed.length) {
      const job = claimed[cursor++];
      try {
        const result = await executeJob(job);
        if (result.status === "Sent") {
          await db.backgroundJob.updateMany({
            where: { id: job.id, status: "Processing", lockedBy: workerId },
            data: { status: "Completed", completedAt: new Date(), lockedAt: null, lockedBy: null, lastError: null },
          });
          summary.completed += 1;
          continue;
        }
        if (result.status === "Deferred") {
          await db.backgroundJob.updateMany({
            where: { id: job.id, status: "Processing", lockedBy: workerId },
            data: {
              status: "Pending",
              attempts: { decrement: 1 },
              runAt: new Date(Date.now() + 6 * 60 * 60_000),
              lockedAt: null,
              lockedBy: null,
              lastError: result.error?.slice(0, 4_000) || "Email delivery is deferred.",
            },
          });
          summary.deferred += 1;
          continue;
        }
        throw new Error(result.error || "Background email delivery failed.");
      } catch (error) {
        const permanent = error instanceof PermanentJobError;
        const dead = permanent || job.attempts >= job.maxAttempts;
        const delaySeconds = Math.min(3_600, 15 * 2 ** Math.max(0, job.attempts - 1)) + Math.floor(Math.random() * 6);
        await db.backgroundJob.updateMany({
          where: { id: job.id, status: "Processing", lockedBy: workerId },
          data: {
            status: dead ? "Dead" : "Pending",
            runAt: dead ? undefined : new Date(Date.now() + delaySeconds * 1_000),
            lockedAt: null,
            lockedBy: null,
            completedAt: dead ? new Date() : null,
            lastError: (error instanceof Error ? error.message : "Background job failed.").slice(0, 4_000),
          },
        });
        if (dead) summary.dead += 1;
        else summary.retried += 1;
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, claimed.length) }, () => work()));
  return summary;
}

export async function retryDeadBackgroundJobs(organizationId: string) {
  const result = await db.backgroundJob.updateMany({
    where: { organizationId, status: "Dead" },
    data: { status: "Pending", attempts: 0, runAt: new Date(), lockedAt: null, lockedBy: null, lastError: null, completedAt: null },
  });
  return result.count;
}

export async function getBackgroundJobHealth(organizationId?: string) {
  const scope = organizationId ? { organizationId } : {};
  const backlogBefore = new Date(Date.now() - 15 * 60_000);
  const staleBefore = new Date(Date.now() - 5 * 60_000);
  const since = new Date(Date.now() - 24 * 60 * 60_000);
  const [pending, processing, dead, completed24h, backlogged, stuck, oldestPending, lastCompleted, recent] = await Promise.all([
    db.backgroundJob.count({ where: { ...scope, status: "Pending" } }),
    db.backgroundJob.count({ where: { ...scope, status: "Processing" } }),
    db.backgroundJob.count({ where: { ...scope, status: "Dead" } }),
    db.backgroundJob.count({ where: { ...scope, status: "Completed", completedAt: { gte: since } } }),
    db.backgroundJob.count({ where: { ...scope, status: "Pending", runAt: { lte: backlogBefore } } }),
    db.backgroundJob.count({ where: { ...scope, status: "Processing", lockedAt: { lte: staleBefore } } }),
    db.backgroundJob.findFirst({ where: { ...scope, status: "Pending" }, orderBy: { createdAt: "asc" }, select: { createdAt: true } }),
    db.backgroundJob.findFirst({ where: { ...scope, status: "Completed" }, orderBy: { completedAt: "desc" }, select: { completedAt: true } }),
    db.backgroundJob.findMany({
      where: scope,
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, type: true, status: true, attempts: true, maxAttempts: true, runAt: true, lastError: true, completedAt: true, createdAt: true },
    }),
  ]);
  return {
    healthy: dead === 0 && backlogged === 0 && stuck === 0,
    pending,
    processing,
    dead,
    completed24h,
    backlogged,
    stuck,
    oldestPendingAt: oldestPending?.createdAt.toISOString() ?? null,
    lastCompletedAt: lastCompleted?.completedAt?.toISOString() ?? null,
    recent: recent.map((job) => ({ ...job, runAt: job.runAt.toISOString(), completedAt: job.completedAt?.toISOString() ?? null, createdAt: job.createdAt.toISOString() })),
  };
}
