import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { BookingManager } from "@/components/marketing/booking-manager";
import { db } from "@/lib/db";
import { readBookingManageToken, schedulingOrganizationSlug } from "@/lib/scheduling";

export const metadata: Metadata = {
  title: "Manage your meeting",
  description: "Reschedule or cancel your M&W Labs meeting.",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function ManageBookingPage({ searchParams }: PageProps<"/book/manage">) {
  const query = await searchParams;
  const token = typeof query.booking === "string" ? query.booking : "";
  const bookingId = readBookingManageToken(query.booking);
  if (!bookingId) notFound();

  const booking = await db.calendarEvent.findFirst({
    where: { id: bookingId, organization: { slug: schedulingOrganizationSlug } },
    select: {
      title: true,
      bookingReference: true,
      startAt: true,
      endAt: true,
      status: true,
      timezone: true,
      location: true,
      bookingType: { select: { id: true, slug: true, durationMinutes: true } },
    },
  });
  if (!booking?.bookingType) notFound();
  const bookingType = booking.bookingType;

  return (
    <div className="relative isolate min-h-[80svh] overflow-hidden bg-[#f7faff] pb-20 pt-14 sm:pt-20 lg:pb-28 lg:pt-24">
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_12%_18%,rgba(37,99,235,0.12),transparent_28rem),radial-gradient(circle_at_88%_24%,rgba(34,211,238,0.14),transparent_30rem)]" />
      <div className="marketing-grid pointer-events-none absolute inset-0 -z-10 opacity-40" />
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <Link href="/" className="mb-8 inline-flex items-center text-xs font-black text-blue-700 transition hover:text-blue-900"><ArrowLeft className="mr-2 size-4" /> Back to M&amp;W Labs</Link>
        <BookingManager
          token={token}
          booking={{ ...booking, bookingType, startAt: booking.startAt.toISOString(), endAt: booking.endAt?.toISOString() ?? null }}
        />
      </div>
    </div>
  );
}
