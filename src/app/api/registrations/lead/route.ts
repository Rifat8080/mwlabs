import { z } from "zod";

import { auth } from "@/lib/auth";
import { hasTrustedMutationOrigin } from "@/lib/dal";
import { db } from "@/lib/db";
import { registerLeadProfile } from "@/lib/lead-registration";

const registrationProfileSchema = z.object({
  name: z.string().trim().min(2).max(120),
  company: z.string().trim().min(2).max(160),
  phone: z.string().trim().max(40).optional().default(""),
  serviceInterest: z.string().trim().min(2).max(120),
  budgetRange: z.string().trim().min(2).max(80),
  projectBrief: z.string().trim().min(10).max(4_000),
});

export async function POST(request: Request) {
  if (!hasTrustedMutationOrigin(request)) {
    return Response.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = registrationProfileSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return Response.json(
      { error: "Please complete every required project detail." },
      { status: 400 },
    );
  }

  const membership = await db.member.findFirst({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (membership) {
    return Response.json(
      { error: "Agency team accounts cannot be registered as prospects." },
      { status: 409 },
    );
  }

  await db.user.update({
    where: { id: session.user.id },
    data: {
      name: parsed.data.name,
      company: parsed.data.company,
      phone: parsed.data.phone || null,
      serviceInterest: parsed.data.serviceInterest,
      budgetRange: parsed.data.budgetRange,
      projectBrief: parsed.data.projectBrief,
    },
  });

  const lead = await registerLeadProfile({
    userId: session.user.id,
    name: parsed.data.name,
    email: session.user.email,
    company: parsed.data.company,
    phone: parsed.data.phone,
    serviceInterest: parsed.data.serviceInterest,
    budgetRange: parsed.data.budgetRange,
    projectBrief: parsed.data.projectBrief,
    ipAddress:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip"),
  });

  if (!lead) {
    return Response.json(
      { error: "The M&W lead workspace has not been configured yet." },
      { status: 503 },
    );
  }

  return Response.json({ registered: true, leadId: lead.id }, { status: 200 });
}
