import { z } from "zod";

import { db } from "@/lib/db";

const enquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().max(191),
  phone: z.string().trim().max(40).optional().default(""),
  company: z.string().trim().max(160).optional().default(""),
  service: z.string().trim().max(120).optional().default("General enquiry"),
  message: z.string().trim().min(10).max(4_000),
  website: z.string().max(0).optional().default(""),
});

const visitors = new Map<string, { count: number; resetAt: number }>();

function trustedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const allowed = new Set([new URL(request.url).origin]);
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("host");
  const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProtocol || new URL(request.url).protocol.replace(":", "");
  if (host) allowed.add(`${protocol}://${host}`);
  if (process.env.BETTER_AUTH_URL) {
    try {
      allowed.add(new URL(process.env.BETTER_AUTH_URL).origin);
    } catch {
      return false;
    }
  }
  return allowed.has(origin);
}

function withinRateLimit(request: Request) {
  const key = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
  const now = Date.now();
  const current = visitors.get(key);
  if (!current || current.resetAt < now) {
    visitors.set(key, { count: 1, resetAt: now + 60 * 60 * 1_000 });
    return true;
  }
  if (current.count >= 5) return false;
  current.count += 1;
  return true;
}

export async function POST(request: Request) {
  if (!trustedOrigin(request)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  if (!withinRateLimit(request)) return Response.json({ error: "Too many enquiries. Please try again later." }, { status: 429 });

  const parsed = enquirySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Please check the enquiry details." }, { status: 400 });
  if (parsed.data.website) return Response.json({ received: true }, { status: 202 });

  const organization = await db.organization.findUnique({ where: { slug: "mw-labs" }, select: { id: true } });
  if (!organization) return Response.json({ error: "The enquiry workspace is not configured yet." }, { status: 503 });

  const lead = await db.lead.create({
    data: {
      organizationId: organization.id,
      name: parsed.data.name,
      company: parsed.data.company || "Individual enquiry",
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      source: "Website landing page",
      stage: "New",
      score: 55,
      probability: 10,
      notes: `Service: ${parsed.data.service}\n\n${parsed.data.message}`,
    },
    select: { id: true },
  });

  await db.$transaction([
    db.activity.create({
      data: {
        organizationId: organization.id,
        leadId: lead.id,
        type: "enquiry.received",
        title: "Landing-page enquiry received",
        body: parsed.data.message,
      },
    }),
    db.auditLog.create({
      data: {
        organizationId: organization.id,
        action: "public_enquiry.created",
        resource: "lead",
        resourceId: lead.id,
        ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip"),
        metadata: JSON.stringify({ service: parsed.data.service, source: "landing-page" }),
      },
    }),
  ]);

  return Response.json({ received: true }, { status: 201 });
}
