import { z } from "zod";

import { getBackgroundJobHealth, processBackgroundJobs, retryDeadBackgroundJobs } from "@/lib/background-jobs";
import { hasTrustedMutationOrigin, requireApiSession } from "@/lib/dal";
import { db } from "@/lib/db";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const actionSchema = z.object({ action: z.enum(["run", "retry-dead"]) });

export async function GET(request: Request) {
  const session = await requireApiSession(request);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json(await getBackgroundJobHealth(session.organizationId), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!hasTrustedMutationOrigin(request)) return Response.json({ error: "Unauthorized request origin." }, { status: 403 });
  const session = await requireApiSession(request);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!["owner", "admin"].includes(session.role)) return Response.json({ error: "Only owners and administrators can manage background jobs." }, { status: 403 });
  const parsed = actionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid background job action." }, { status: 400 });

  let retried = 0;
  if (parsed.data.action === "retry-dead") {
    retried = await retryDeadBackgroundJobs(session.organizationId);
    await db.auditLog.create({
      data: {
        organizationId: session.organizationId,
        userId: session.userId,
        action: "background_jobs.retried",
        resource: "background_jobs",
        metadata: JSON.stringify({ retried }),
      },
    });
  }
  const summary = await processBackgroundJobs({ organizationId: session.organizationId, limit: 25, concurrency: 3 });
  const health = await getBackgroundJobHealth(session.organizationId);
  return Response.json({ retried, summary, health }, { headers: { "Cache-Control": "no-store" } });
}
