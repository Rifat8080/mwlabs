import { z } from "zod";

import { requireApiSession } from "@/lib/dal";
import { db } from "@/lib/db";
import { isValidTimezone } from "@/lib/scheduling";

const optionalText = (max: number) => z.preprocess((value) => value === "" ? null : value, z.string().trim().max(max).nullable().optional());
const bookingTypeData = z.object({
  title: z.string().trim().min(2).max(191),
  slug: z.string().trim().toLowerCase().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: optionalText(4_000),
  durationMinutes: z.coerce.number().int().min(10).max(240),
  slotIntervalMinutes: z.coerce.number().int().min(5).max(240),
  bufferBeforeMinutes: z.coerce.number().int().min(0).max(240),
  bufferAfterMinutes: z.coerce.number().int().min(0).max(240),
  minimumNoticeHours: z.coerce.number().int().min(0).max(720),
  maximumAdvanceDays: z.coerce.number().int().min(1).max(365),
  timezone: z.string().trim().min(1).max(100).refine(isValidTimezone, "Use a valid IANA timezone"),
  location: optionalText(2_000),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  active: z.boolean(),
});
const ruleSchema = z.object({
  weekday: z.coerce.number().int().min(0).max(6),
  startMinute: z.coerce.number().int().min(0).max(1439),
  endMinute: z.coerce.number().int().min(1).max(1440),
  enabled: z.boolean(),
}).refine((rule) => !rule.enabled || rule.endMinute > rule.startMinute, { message: "Availability must end after it starts." });
const createSchema = z.object({ data: bookingTypeData });
const updateSchema = z.object({ id: z.string().min(1).max(191).optional(), data: bookingTypeData.partial().optional(), availability: z.array(ruleSchema).length(7).optional() });
const deleteSchema = z.object({ id: z.string().min(1).max(191) });

function canManage(role: string) {
  return ["owner", "admin"].includes(role);
}

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Scheduling settings could not be saved.";
  const conflict = /unique|duplicate/i.test(message);
  return Response.json({ error: conflict ? "That scheduling URL slug is already in use." : /prisma|database/i.test(message) ? "The database could not save these settings." : message }, { status: conflict ? 409 : 400 });
}

export async function GET(request: Request) {
  const session = await requireApiSession(request);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const [bookingTypes, availability] = await Promise.all([
    db.bookingType.findMany({ where: { organizationId: session.organizationId }, orderBy: { createdAt: "asc" } }),
    db.availabilityRule.findMany({ where: { organizationId: session.organizationId }, orderBy: { weekday: "asc" } }),
  ]);
  const ruleMap = new Map(availability.map((rule) => [rule.weekday, rule]));
  const completeAvailability = Array.from({ length: 7 }, (_, weekday) => ruleMap.get(weekday) ?? {
    id: `new-${weekday}`,
    organizationId: session.organizationId,
    weekday,
    startMinute: 9 * 60,
    endMinute: 17 * 60,
    enabled: false,
  });
  return Response.json({ bookingTypes, availability: completeAvailability });
}

export async function POST(request: Request) {
  const session = await requireApiSession(request);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManage(session.role)) return Response.json({ error: "Only owners and administrators can change scheduling settings." }, { status: 403 });
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid meeting type." }, { status: 400 });
  try {
    const bookingType = await db.bookingType.create({ data: { organizationId: session.organizationId, ...parsed.data.data } });
    await db.auditLog.create({ data: { organizationId: session.organizationId, userId: session.userId, action: "scheduler.type.created", resource: "booking_type", resourceId: bookingType.id } });
    return Response.json({ bookingType }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request) {
  const session = await requireApiSession(request);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManage(session.role)) return Response.json({ error: "Only owners and administrators can change scheduling settings." }, { status: 403 });
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || (!parsed.data.data && !parsed.data.availability)) return Response.json({ error: parsed.success ? "No changes supplied." : parsed.error.issues[0]?.message }, { status: 400 });

  try {
    const existing = parsed.data.id
      ? await db.bookingType.findFirst({ where: { id: parsed.data.id, organizationId: session.organizationId }, select: { id: true } })
      : null;
    if (parsed.data.data && !existing) return Response.json({ error: "Meeting type not found." }, { status: 404 });
    const result = await db.$transaction(async (tx) => {
      const bookingType = parsed.data.data && existing
        ? await tx.bookingType.update({ where: { id: existing.id }, data: parsed.data.data })
        : null;
      if (parsed.data.availability) {
        await Promise.all(parsed.data.availability.map((rule) => tx.availabilityRule.upsert({
          where: { organizationId_weekday: { organizationId: session.organizationId, weekday: rule.weekday } },
          create: { organizationId: session.organizationId, ...rule },
          update: rule,
        })));
      }
      await tx.auditLog.create({
        data: { organizationId: session.organizationId, userId: session.userId, action: "scheduler.settings.updated", resource: "scheduling", resourceId: bookingType?.id ?? session.organizationId },
      });
      return bookingType;
    });
    return Response.json({ bookingType: result, saved: true });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request) {
  const session = await requireApiSession(request);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManage(session.role)) return Response.json({ error: "Only owners and administrators can change scheduling settings." }, { status: 403 });
  const parsed = deleteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid meeting type." }, { status: 400 });
  const existing = await db.bookingType.findFirst({ where: { id: parsed.data.id, organizationId: session.organizationId }, select: { id: true } });
  if (!existing) return Response.json({ error: "Meeting type not found." }, { status: 404 });
  const count = await db.bookingType.count({ where: { organizationId: session.organizationId } });
  if (count <= 1) return Response.json({ error: "Keep at least one meeting type. You can deactivate it instead." }, { status: 409 });
  await db.$transaction([
    db.bookingType.delete({ where: { id: existing.id } }),
    db.auditLog.create({ data: { organizationId: session.organizationId, userId: session.userId, action: "scheduler.type.deleted", resource: "booking_type", resourceId: existing.id } }),
  ]);
  return Response.json({ deleted: true });
}
