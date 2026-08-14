import { z } from "zod";

import { getBackgroundJobHealth } from "@/lib/background-jobs";
import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/dal";
import { notifyOrganization } from "@/lib/notifications";

const settingsSchema = z.object({ name: z.string().trim().min(2).max(160) });

async function readSettings(organizationId: string, currentRole: string) {
  const [organization, members, auditLogs, bookingTypes, contentCount, backgroundJobs] = await Promise.all([
    db.organization.findUniqueOrThrow({ where: { id: organizationId }, select: { id: true, name: true, slug: true, createdAt: true, updatedAt: true } }),
    db.member.findMany({ where: { organizationId }, select: { role: true } }),
    db.auditLog.findMany({ where: { organizationId }, orderBy: { createdAt: "desc" }, take: 12, select: { id: true, action: true, resource: true, resourceId: true, createdAt: true, user: { select: { name: true } } } }),
    db.bookingType.count({ where: { organizationId, active: true } }),
    Promise.all([
      db.blogPost.count({ where: { organizationId } }),
      db.workPost.count({ where: { organizationId } }),
      db.seoPage.count({ where: { organizationId } }),
    ]),
    getBackgroundJobHealth(organizationId),
  ]);

  const canonicalUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.BETTER_AUTH_URL || "";
  return {
    organization: { ...organization, createdAt: organization.createdAt.toISOString(), updatedAt: organization.updatedAt?.toISOString() ?? null },
    currentRole,
    roles: Object.entries(members.reduce<Record<string, number>>((counts, member) => ({ ...counts, [member.role]: (counts[member.role] ?? 0) + 1 }), {})).map(([role, count]) => ({ role, count })),
    providers: [
      { key: "database", label: "Database", ready: true, detail: "Connected and responding" },
      { key: "email", label: "Transactional email", ready: Boolean(process.env.RESEND_API_KEY && process.env.NOTIFICATION_EMAIL_FROM), detail: process.env.RESEND_API_KEY && process.env.NOTIFICATION_EMAIL_FROM ? "Resend sender configured" : "Add RESEND_API_KEY and NOTIFICATION_EMAIL_FROM" },
      { key: "ai", label: "M&W Intelligence", ready: Boolean(process.env.GEMINI_API_KEY), detail: process.env.GEMINI_API_KEY ? "Gemini provider configured" : "Local deterministic briefing mode" },
      { key: "google", label: "Google sign-in", ready: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET), detail: process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? "OAuth configured" : "Email/password sign-in remains available" },
      { key: "scheduling", label: "Native scheduling", ready: bookingTypes > 0, detail: `${bookingTypes} active meeting type${bookingTypes === 1 ? "" : "s"}` },
      { key: "content", label: "Content publishing", ready: true, detail: `${contentCount.reduce((sum, count) => sum + count, 0)} managed entries` },
      { key: "jobs", label: "Background worker", ready: backgroundJobs.healthy, detail: backgroundJobs.healthy ? `${backgroundJobs.completed24h} completed in 24h · ${backgroundJobs.pending} queued` : `${backgroundJobs.dead} failed · ${backgroundJobs.backlogged} delayed · ${backgroundJobs.stuck} stuck` },
    ],
    security: [
      { label: "Owner bootstrap closed", ready: process.env.ALLOW_INITIAL_SIGNUP !== "true", detail: process.env.ALLOW_INITIAL_SIGNUP === "true" ? "Set ALLOW_INITIAL_SIGNUP=false after creating the owner" : "Public owner workspace creation is disabled" },
      { label: "Authentication secret", ready: Boolean(process.env.BETTER_AUTH_SECRET && process.env.BETTER_AUTH_SECRET.length >= 32), detail: "A high-entropy server secret is required" },
      { label: "Canonical HTTPS URL", ready: process.env.NODE_ENV !== "production" || canonicalUrl.startsWith("https://"), detail: process.env.NODE_ENV === "production" ? canonicalUrl || "Not configured" : "Required when deployed to production" },
      { label: "Role-scoped access", ready: members.some((member) => member.role === "owner"), detail: `${members.length} workspace membership${members.length === 1 ? "" : "s"}` },
      { label: "Worker authentication", ready: process.env.NODE_ENV !== "production" || Boolean(process.env.BACKGROUND_JOB_SECRET || process.env.CRON_SECRET), detail: process.env.NODE_ENV !== "production" || process.env.BACKGROUND_JOB_SECRET || process.env.CRON_SECRET ? "Background worker endpoint is protected" : "Add BACKGROUND_JOB_SECRET before deployment" },
    ],
    backgroundJobs,
    auditLogs: auditLogs.map((log) => ({ ...log, createdAt: log.createdAt.toISOString(), actor: log.user?.name ?? "System" })),
  };
}

export async function GET(request: Request) {
  const session = await requireApiSession(request);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json(await readSettings(session.organizationId, session.role));
}

export async function PATCH(request: Request) {
  const session = await requireApiSession(request);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!['owner', 'admin'].includes(session.role)) return Response.json({ error: "Only owners and administrators can change workspace settings." }, { status: 403 });
  const parsed = settingsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid workspace name." }, { status: 400 });

  await db.$transaction([
    db.organization.update({ where: { id: session.organizationId }, data: { name: parsed.data.name } }),
    db.auditLog.create({ data: { organizationId: session.organizationId, userId: session.userId, action: "workspace.settings.updated", resource: "organization", resourceId: session.organizationId, metadata: JSON.stringify({ fields: ["name"] }) } }),
  ]);
  await notifyOrganization({ organizationId: session.organizationId, actorId: session.userId, category: "system", type: "workspace.settings.updated", title: "Workspace settings updated", message: `The workspace name is now ${parsed.data.name}.`, actionUrl: "/app/settings", resource: "organization", resourceId: session.organizationId });
  return Response.json(await readSettings(session.organizationId, session.role));
}
