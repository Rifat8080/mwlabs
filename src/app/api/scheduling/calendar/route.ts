import { db } from "@/lib/db";
import { readBookingManageToken } from "@/lib/scheduling";

function escapeIcs(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("\n", "\\n").replaceAll(",", "\\,").replaceAll(";", "\\;");
}

function icsDate(date: Date) {
  return date.toISOString().replaceAll("-", "").replaceAll(":", "").replace(/\.\d{3}Z$/, "Z");
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get("booking") ?? undefined;
  const bookingId = readBookingManageToken(token);
  if (!bookingId) return new Response("Invalid calendar link.", { status: 401 });
  const booking = await db.calendarEvent.findUnique({
    where: { id: bookingId },
    select: { bookingReference: true, title: true, inviteeEmail: true, startAt: true, endAt: true, location: true, status: true },
  });
  if (!booking || booking.status !== "Scheduled") return new Response("This meeting is no longer scheduled.", { status: 404 });

  const manageUrl = new URL("/book/manage", requestUrl.origin);
  manageUrl.searchParams.set("booking", token!);
  const endAt = booking.endAt ?? new Date(booking.startAt.getTime() + 30 * 60 * 1_000);
  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//M&W Labs//M&W Scheduling//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${escapeIcs(booking.bookingReference ?? bookingId)}@mwlabs.digital`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(booking.startAt)}`,
    `DTEND:${icsDate(endAt)}`,
    `SUMMARY:${escapeIcs(booking.title)}`,
    booking.location ? `LOCATION:${escapeIcs(booking.location)}` : null,
    booking.inviteeEmail ? `ATTENDEE;RSVP=TRUE:mailto:${escapeIcs(booking.inviteeEmail)}` : null,
    `DESCRIPTION:${escapeIcs(`Manage this meeting: ${manageUrl.toString()}`)}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].filter((line): line is string => Boolean(line)).join("\r\n");

  return new Response(calendar, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="mw-labs-${booking.bookingReference ?? "meeting"}.ics"`,
      "Cache-Control": "private, no-store",
    },
  });
}
