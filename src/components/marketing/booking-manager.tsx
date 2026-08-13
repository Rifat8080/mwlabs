"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarClock, CheckCircle2, RotateCcw, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TimezoneControl, useVisitorTimezone } from "@/components/marketing/timezone-control";
import { cn } from "@/lib/utils";

type Booking = { title: string; bookingReference: string | null; startAt: string; endAt: string | null; status: string; timezone: string | null; location: string | null; bookingType: { id: string; slug: string; durationMinutes: number } };
type Day = { date: string; slots: Array<{ startAt: string; endAt: string }> };

function label(value: string, timezone: string) {
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: timezone }).format(new Date(value));
}

export function BookingManager({ booking, token }: { booking: Booking; token: string }) {
  const [days, setDays] = useState<Day[]>([]);
  const [selected, setSelected] = useState("");
  const detectedTimezone = useVisitorTimezone(booking.timezone || "Asia/Dhaka");
  const [timezoneOverride, setTimezoneOverride] = useState("");
  const timezone = timezoneOverride || detectedTimezone;
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState(booking.status);
  const [startAt, setStartAt] = useState(booking.startAt);

  useEffect(() => {
    if (booking.status !== "Scheduled") return;
    fetch(`/api/scheduling?type=${encodeURIComponent(booking.bookingType.id)}&days=21&booking=${encodeURIComponent(token)}`, { cache: "no-store" })
      .then(async (response) => { const result = await response.json(); if (!response.ok) throw new Error(result.error); return result; })
      .then((result) => setDays(result.days))
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Available times could not be loaded."));
  }, [booking.bookingType.id, booking.status, booking.timezone, token]);

  const slots = useMemo(() => days.flatMap((day) => day.slots), [days]);

  async function change(payload: Record<string, unknown>) {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/scheduling/manage", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ booking: token, ...payload }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "The booking could not be changed.");
      if (payload.action === "cancel") setStatus("Canceled");
      else if (typeof payload.startAt === "string") { setStartAt(payload.startAt); setSelected(""); }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The booking could not be changed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-[0_28px_90px_rgba(37,99,235,0.12)]">
      <div className="bg-slate-950 p-7 text-white sm:p-9">
        <div className="flex items-center justify-between gap-4"><span className="grid size-13 place-items-center rounded-2xl bg-cyan-400 text-slate-950"><CalendarClock className="size-6" /></span><span className={cn("rounded-full px-3 py-1.5 text-[0.58rem] font-black uppercase tracking-[0.16em]", status === "Scheduled" ? "bg-emerald-400/15 text-emerald-300" : "bg-rose-400/15 text-rose-300")}>{status}</span></div>
        <h1 className="mt-7 text-4xl font-black tracking-[-0.045em]">{booking.title}</h1>
        <p className="mt-3 text-sm font-semibold leading-7 text-slate-300">{label(startAt, timezone)} · {booking.bookingType.durationMinutes} minutes</p>
        <p className="mt-1 text-xs font-bold text-slate-500">Reference {booking.bookingReference} · {booking.location || "Location shared separately"}</p>
      </div>

      {status === "Scheduled" ? <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section><p className="text-[0.58rem] font-black uppercase tracking-[0.18em] text-blue-600">Reschedule</p><h2 className="mt-2 text-2xl font-black tracking-[-0.035em] text-slate-950">Choose a different time</h2><div className="mt-4"><TimezoneControl detectedTimezone={detectedTimezone} override={timezoneOverride} onOverride={setTimezoneOverride} /></div><div className="mt-5 grid max-h-80 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">{slots.map((slot) => <button key={slot.startAt} onClick={() => setSelected(slot.startAt)} className={cn("rounded-xl border px-3 py-3 text-xs font-black transition", selected === slot.startAt ? "border-blue-600 bg-blue-600 text-white" : "border-blue-100 text-blue-700 hover:bg-blue-50")}>{label(slot.startAt, timezone)}</button>)}</div><Button disabled={!selected || pending} onClick={() => void change({ action: "reschedule", startAt: selected, timezone })} className="mt-5 h-11 w-full rounded-xl"><RotateCcw className="size-4" /> {pending ? "Saving…" : "Confirm new time"}</Button></section>
        <section className="rounded-2xl border border-rose-100 bg-rose-50/60 p-5"><p className="text-[0.58rem] font-black uppercase tracking-[0.18em] text-rose-600">Cancel</p><h2 className="mt-2 text-xl font-black text-slate-950">Can’t make it?</h2><p className="mt-2 text-xs font-semibold leading-5 text-slate-500">Cancel the appointment to immediately release this time for someone else.</p><div className="mt-4 space-y-2"><Label htmlFor="cancel-reason">Reason (optional)</Label><Textarea id="cancel-reason" rows={4} placeholder="Help us understand what changed." /></div><Button variant="outline" disabled={pending} onClick={() => { const reason = (document.getElementById("cancel-reason") as HTMLTextAreaElement | null)?.value ?? ""; void change({ action: "cancel", reason }); }} className="mt-4 h-11 w-full border-rose-200 bg-white text-rose-700 hover:bg-rose-100"><XCircle className="size-4" /> Cancel meeting</Button></section>
        {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700 lg:col-span-2">{error}</p>}
      </div> : <div className="p-8 text-center sm:p-12"><CheckCircle2 className="mx-auto size-12 text-slate-300" /><h2 className="mt-5 text-2xl font-black text-slate-950">This meeting has been canceled.</h2><p className="mt-3 text-sm font-semibold text-slate-500">The time is available again. You can create a fresh booking whenever you’re ready.</p><Link href="/book" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-black text-white">Book a new time</Link></div>}
    </div>
  );
}
