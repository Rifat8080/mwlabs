import { z } from "zod";

import { requireApiSession } from "@/lib/dal";
import { db } from "@/lib/db";

const preferenceSchema = z.object({
  inAppEnabled: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
  emailCrud: z.boolean().optional(),
  emailActivity: z.boolean().optional(),
  emailBookings: z.boolean().optional(),
  notifyOwnActions: z.boolean().optional(),
}).refine((value) => Object.keys(value).length > 0, "No preference changes supplied.");

const defaults = {
  inAppEnabled: true,
  emailEnabled: true,
  emailCrud: true,
  emailActivity: true,
  emailBookings: true,
  notifyOwnActions: true,
};

export async function GET(request: Request) {
  const session = await requireApiSession(request);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const preference = await db.notificationPreference.findUnique({
    where: { organizationId_userId: { organizationId: session.organizationId, userId: session.userId } },
    select: { inAppEnabled: true, emailEnabled: true, emailCrud: true, emailActivity: true, emailBookings: true, notifyOwnActions: true },
  });
  return Response.json({
    preference: preference ?? defaults,
    emailProviderConfigured: Boolean(process.env.RESEND_API_KEY && process.env.NOTIFICATION_EMAIL_FROM),
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request) {
  const session = await requireApiSession(request);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = preferenceSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid notification preferences." }, { status: 400 });
  const preference = await db.notificationPreference.upsert({
    where: { organizationId_userId: { organizationId: session.organizationId, userId: session.userId } },
    create: { organizationId: session.organizationId, userId: session.userId, ...defaults, ...parsed.data },
    update: parsed.data,
    select: { inAppEnabled: true, emailEnabled: true, emailCrud: true, emailActivity: true, emailBookings: true, notifyOwnActions: true },
  });
  return Response.json({ preference });
}
