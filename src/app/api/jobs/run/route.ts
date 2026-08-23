import { timingSafeEqual } from "node:crypto";

import { getBackgroundJobHealth, processBackgroundJobs } from "@/lib/background-jobs";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

function authorized(request: Request) {
  const expected = (process.env.BACKGROUND_JOB_SECRET || process.env.CRON_SECRET || "").trim();
  if (!expected) return process.env.NODE_ENV !== "production";
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim() || "";
  const expectedBytes = Buffer.from(expected);
  const suppliedBytes = Buffer.from(supplied);
  return expectedBytes.length === suppliedBytes.length && timingSafeEqual(expectedBytes, suppliedBytes);
}

async function run(request: Request) {
  if (!authorized(request)) return Response.json({ error: "Unauthorized background worker request." }, { status: 401 });
  const url = new URL(request.url);
  const requestedLimit = Number(url.searchParams.get("limit") || 25);
  const limit = Number.isFinite(requestedLimit) ? Math.min(50, Math.max(1, requestedLimit)) : 25;
  const summary = await processBackgroundJobs({ limit, concurrency: 3 });
  const health = await getBackgroundJobHealth();
  return Response.json({ ok: true, summary, health }, { headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: Request) {
  return run(request);
}

export async function POST(request: Request) {
  return run(request);
}
