import { z } from "zod";

import { hasTrustedMutationOrigin } from "@/lib/dal";
import { db } from "@/lib/db";
import { notifyOrganization, queueWorkflowEmail } from "@/lib/notifications";
import { availableDays, bookingSlotKey, hasCalendarConflict, isValidTimezone, readBookingManageToken } from "@/lib/scheduling";

const changeSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("cancel"), booking: z.string().max(2_000), reason: z.string().trim().max(2_000).optional().default("") }),
  z.object({ action: z.literal("reschedule"), booking: z.string().max(2_000), startAt: z.string().datetime(), timezone: z.string().trim().min(1).max(100) }),
]);

export async function PATCH(request: Request) {
  if (!hasTrustedMutationOrigin(request)) return Response.json({ error: "Unauthorized request origin." }, { status: 403 });
  const parsed = changeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid booking change." }, { status: 400 });
  const bookingId = readBookingManageToken(parsed.data.booking);
  if (!bookingId) return Response.json({ error: "This booking management link is invalid or expired." }, { status: 401 });

  try {
    const existing = await db.calendarEvent.findUnique({
      where: { id: bookingId },
      include: { bookingType: true, lead: { select: { id: true, nextActivityAt: true } } },
    });
    if (!existing || !existing.bookingType) return Response.json({ error: "Booking not found." }, { status: 404 });
    if (existing.status !== "Scheduled") return Response.json({ error: "Only scheduled meetings can be changed." }, { status: 409 });

    if (parsed.data.action === "cancel") {
      const reason = parsed.data.reason;
      await db.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT id FROM organization WHERE id = ${existing.organizationId} FOR UPDATE`;
        const live = await tx.calendarEvent.findUnique({ where: { id: existing.id }, select: { status: true } });
        if (live?.status !== "Scheduled") throw new Error("This meeting has already been changed.");
        const canceled = await tx.calendarEvent.update({
          where: { id: existing.id },
          data: { status: "Canceled", slotKey: null, cancellationReason: reason || null },
          select: { id: true },
        });
        if (existing.lead?.nextActivityAt && Math.abs(existing.lead.nextActivityAt.getTime() - existing.startAt.getTime()) < 60_000) {
          const next = await tx.calendarEvent.findFirst({
            where: { leadId: existing.lead.id, id: { not: existing.id }, status: "Scheduled", startAt: { gt: new Date() } },
            orderBy: { startAt: "asc" },
            select: { startAt: true },
          });
          await tx.lead.update({ where: { id: existing.lead.id }, data: { nextActivityAt: next?.startAt ?? null } });
        }
        await Promise.all([
          tx.activity.create({
            data: { organizationId: existing.organizationId, leadId: existing.leadId, type: "meeting.canceled", title: `${existing.title} canceled`, body: reason || "Canceled through the self-service booking page." },
          }),
          tx.auditLog.create({
            data: { organizationId: existing.organizationId, action: "scheduler.booking.canceled", resource: "calendar_event", resourceId: canceled.id },
          }),
        ]);
      });
      await notifyOrganization({
        organizationId: existing.organizationId,
        category: "booking",
        type: "booking.canceled",
        title: "Meeting canceled",
        message: `${existing.inviteeName || "An invitee"} canceled ${existing.title}.${reason ? ` Reason: ${reason}` : ""}`,
        actionUrl: "/app/calendar",
        resource: "calendar-events",
        resourceId: existing.id,
      });
      if (existing.inviteeEmail) {
        await queueWorkflowEmail({
          organizationId: existing.organizationId,
          to: existing.inviteeEmail,
          recipientName: existing.inviteeName,
          title: `Canceled: ${existing.title}`,
          message: "Your meeting has been canceled and the time has been released. You can create a fresh booking whenever you are ready.",
          actionLabel: "Book a new meeting",
          actionUrl: "/book",
          idempotencyKey: `booking-canceled-${existing.id}`,
        });
      }
      return Response.json({ changed: true, status: "Canceled" });
    }

    const reschedule = parsed.data;
    if (!isValidTimezone(reschedule.timezone)) return Response.json({ error: "Select a valid timezone." }, { status: 400 });
    const requestedStart = new Date(reschedule.startAt);
    const availability = await availableDays({
      organizationId: existing.organizationId,
      bookingType: existing.bookingType,
      days: existing.bookingType.maximumAdvanceDays + 1,
      excludeEventId: existing.id,
    });
    const slot = availability.flatMap((day) => day.slots).find((item) => item.startAt === requestedStart.toISOString());
    if (!slot) return Response.json({ error: "That time is no longer available. Please choose another slot." }, { status: 409 });

    await db.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM organization WHERE id = ${existing.organizationId} FOR UPDATE`;
      const live = await tx.calendarEvent.findUnique({ where: { id: existing.id }, select: { status: true } });
      if (live?.status !== "Scheduled") throw new Error("This meeting has already been changed.");
      const requestedEnd = new Date(slot.endAt);
      const nearbyEvents = await tx.calendarEvent.findMany({
        where: {
          organizationId: existing.organizationId,
          status: "Scheduled",
          id: { not: existing.id },
          startAt: { lt: new Date(requestedEnd.getTime() + 24 * 60 * 60 * 1_000) },
          OR: [
            { endAt: { gt: new Date(requestedStart.getTime() - 24 * 60 * 60 * 1_000) } },
            { endAt: null, startAt: { gt: new Date(requestedStart.getTime() - 24 * 60 * 60 * 1_000) } },
          ],
        },
        select: { startAt: true, endAt: true, bookingType: { select: { durationMinutes: true, bufferBeforeMinutes: true, bufferAfterMinutes: true } } },
      });
      if (hasCalendarConflict({ events: nearbyEvents, startAt: requestedStart, endAt: requestedEnd, bufferBeforeMinutes: existing.bookingType!.bufferBeforeMinutes, bufferAfterMinutes: existing.bookingType!.bufferAfterMinutes })) {
        throw new Error("That time was just booked. Please choose another available time.");
      }
      await tx.calendarEvent.update({
        where: { id: existing.id },
        data: {
          startAt: requestedStart,
          endAt: requestedEnd,
          timezone: reschedule.timezone,
          slotKey: bookingSlotKey(existing.organizationId, requestedStart),
          rescheduled: true,
          cancellationReason: null,
        },
      });
      if (existing.leadId && existing.lead?.nextActivityAt && Math.abs(existing.lead.nextActivityAt.getTime() - existing.startAt.getTime()) < 60_000) {
        const next = await tx.calendarEvent.findFirst({
          where: { leadId: existing.leadId, status: "Scheduled", startAt: { gt: new Date() } },
          orderBy: { startAt: "asc" },
          select: { startAt: true },
        });
        await tx.lead.update({ where: { id: existing.leadId }, data: { nextActivityAt: next?.startAt ?? requestedStart } });
      }
      await Promise.all([
        tx.activity.create({
          data: { organizationId: existing.organizationId, leadId: existing.leadId, type: "meeting.rescheduled", title: `${existing.title} rescheduled`, body: `Moved from ${existing.startAt.toISOString()} to ${requestedStart.toISOString()} through the self-service booking page.` },
        }),
        tx.auditLog.create({
          data: { organizationId: existing.organizationId, action: "scheduler.booking.rescheduled", resource: "calendar_event", resourceId: existing.id },
        }),
      ]);
    });

    const meetingTime = new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: reschedule.timezone,
      timeZoneName: "short",
    }).format(requestedStart);
    await notifyOrganization({
      organizationId: existing.organizationId,
      category: "booking",
      type: "booking.rescheduled",
      title: "Meeting rescheduled",
      message: `${existing.inviteeName || "An invitee"} moved ${existing.title} to ${meetingTime}.`,
      actionUrl: "/app/calendar",
      resource: "calendar-events",
      resourceId: existing.id,
    });
    if (existing.inviteeEmail) {
      await queueWorkflowEmail({
        organizationId: existing.organizationId,
        to: existing.inviteeEmail,
        recipientName: existing.inviteeName,
        title: `Rescheduled: ${existing.title}`,
        message: `Your new meeting time is ${meetingTime}.${existing.location ? ` Location: ${existing.location}.` : ""}`,
        actionLabel: "Manage your booking",
        actionUrl: `/book/manage?booking=${encodeURIComponent(reschedule.booking)}`,
        idempotencyKey: `booking-rescheduled-${existing.id}-${requestedStart.toISOString()}`,
      });
    }

    return Response.json({ changed: true, status: "Scheduled" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The booking could not be changed.";
    const conflict = /unique|duplicate|slotKey|time was just booked/i.test(message);
    return Response.json({ error: conflict ? "That time was just booked. Please choose another slot." : "The booking could not be changed." }, { status: conflict ? 409 : 400 });
  }
}
