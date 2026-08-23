"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarCheck2, Check, CheckCircle2, Clock3, LoaderCircle, MapPin, ShieldCheck, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TimezoneControl, timezoneLabel, useVisitorTimezone } from "@/components/marketing/timezone-control";
import { cn } from "@/lib/utils";

type BookingType = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  durationMinutes: number;
  timezone: string;
  location: string | null;
  color: string;
};

type AvailableDay = { date: string; slots: Array<{ startAt: string; endAt: string }> };
type Availability = { bookingTypes: BookingType[]; selectedType: BookingType; days: AvailableDay[] };
type Confirmation = {
  booking: { bookingReference: string; title: string; startAt: string; endAt: string | null; timezone: string | null; location: string | null };
  managePath: string;
  calendarPath: string | null;
};

async function readJsonResponse<T>(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error("The scheduling service returned an unexpected response. Please refresh and try again.");
  }
  return response.json() as Promise<T>;
}

function dayLabel(date: string) {
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));
}

function timeLabel(value: string, timezone: string) {
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: timezone }).format(new Date(value));
}

function localDateKey(value: string, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: timezone }).formatToParts(new Date(value));
  const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function longDate(value: string, timezone: string) {
  return new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: timezone, timeZoneName: "short" }).format(new Date(value));
}

export function NativeScheduler({
  name = "",
  email = "",
  phone = "",
  company = "",
  service = "",
  leadToken,
  initialType = "",
}: {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  service?: string;
  leadToken?: string;
  initialType?: string;
}) {
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStart, setSelectedStart] = useState("");
  const detectedTimezone = useVisitorTimezone("Asia/Dhaka");
  const [timezoneOverride, setTimezoneOverride] = useState("");
  const timezone = timezoneOverride || detectedTimezone;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [formStartedAt] = useState(() => String(Date.now()));

  useEffect(() => {
    let active = true;
    async function loadAvailability() {
      setLoading(true);
      setError("");
      try {
        const query = selectedType ? `?type=${encodeURIComponent(selectedType)}&days=21` : "?days=21";
        const response = await fetch(`/api/scheduling${query}`, { cache: "no-store" });
        const result = await readJsonResponse<Availability & { error?: string }>(response);
        if (!response.ok) throw new Error(result.error ?? "Available times could not be loaded.");
        if (!active) return;
        setAvailability(result as Availability);
        setSelectedType((current) => current || result.selectedType.id);
        const starts = result.days.flatMap((day: AvailableDay) => day.slots).map((slot: { startAt: string }) => localDateKey(slot.startAt, timezone));
        setSelectedDate((current) => starts.includes(current) ? current : starts[0] ?? "");
        setSelectedStart("");
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : "Available times could not be loaded.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadAvailability();
    return () => { active = false; };
  }, [selectedType, timezone]);

  const displayDays = useMemo(() => {
    const grouped = new Map<string, AvailableDay["slots"]>();
    for (const slot of availability?.days.flatMap((day) => day.slots) ?? []) {
      const key = localDateKey(slot.startAt, timezone);
      grouped.set(key, [...(grouped.get(key) ?? []), slot]);
    }
    return Array.from(grouped, ([date, groupedSlots]) => ({ date, slots: groupedSlots }));
  }, [availability, timezone]);
  const slots = useMemo(() => displayDays.find((day) => day.date === selectedDate)?.slots ?? [], [displayDays, selectedDate]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!availability || !selectedStart) return setError("Choose an available time first.");
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/scheduling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingTypeId: availability.selectedType.id,
          startAt: selectedStart,
          timezone,
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone"),
          company: form.get("company"),
          notes: form.get("notes"),
          website: form.get("website"),
          formStartedAt,
          leadToken,
        }),
      });
      const result = await readJsonResponse<Confirmation & { error?: string }>(response);
      if (!response.ok) throw new Error(result.error ?? "The meeting could not be booked.");
      setConfirmation(result as Confirmation);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The meeting could not be booked.");
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmation) {
    return (
      <div className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-[0_28px_90px_rgba(37,99,235,0.12)]">
        <div className="bg-[linear-gradient(135deg,#ecfdf5,#ffffff_60%,#ecfeff)] p-8 text-center sm:p-12">
          <span className="mx-auto grid size-20 place-items-center rounded-full bg-emerald-500 text-white shadow-[0_18px_45px_rgba(16,185,129,0.25)]"><Check className="size-9" /></span>
          <p className="mt-7 text-[0.62rem] font-black uppercase tracking-[0.2em] text-emerald-700">Booking confirmed</p>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.045em] text-slate-950">You’re on the calendar.</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm font-semibold leading-7 text-slate-600">{confirmation.booking.title} is scheduled for {longDate(confirmation.booking.startAt, timezone)}.</p>
          <div className="mx-auto mt-7 grid max-w-lg gap-3 rounded-2xl border border-emerald-100 bg-white/85 p-5 text-left shadow-sm sm:grid-cols-2">
            <div><p className="text-[0.55rem] font-black uppercase tracking-[0.15em] text-slate-400">Reference</p><p className="mt-1 text-sm font-black text-slate-950">{confirmation.booking.bookingReference}</p></div>
            <div><p className="text-[0.55rem] font-black uppercase tracking-[0.15em] text-slate-400">Location</p><p className="mt-1 text-sm font-black text-slate-950">{confirmation.booking.location || "Shared before the meeting"}</p></div>
          </div>
          <div className="mx-auto mt-7 flex max-w-lg flex-col gap-3 sm:flex-row">
            <Link href={confirmation.managePath} className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-slate-800">Manage booking</Link>
            {confirmation.calendarPath && <a href={confirmation.calendarPath} className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-800 transition hover:bg-slate-50">Add to calendar</a>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-[0_28px_90px_rgba(37,99,235,0.12)]">
      <div className="border-b border-blue-50 bg-[linear-gradient(135deg,#f8fbff,#ffffff_60%,#ecfeff)] p-5 sm:p-7">
        <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-blue-600 text-white"><CalendarCheck2 className="size-5" /></span><div><p className="text-[0.58rem] font-black uppercase tracking-[0.17em] text-blue-600">M&amp;W scheduling</p><h2 className="text-xl font-black tracking-[-0.03em] text-slate-950">Choose your meeting</h2></div></div>
        {availability && availability.bookingTypes.length > 1 && <div className="mt-5 flex flex-wrap gap-2">{availability.bookingTypes.map((type) => <button key={type.id} type="button" onClick={() => setSelectedType(type.id)} className={cn("rounded-xl border px-4 py-2 text-xs font-black transition", availability.selectedType.id === type.id ? "border-blue-600 bg-blue-600 text-white" : "border-blue-100 bg-white text-slate-700 hover:border-blue-300")}>{type.title} · {type.durationMinutes} min</button>)}</div>}
      </div>

      <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
        <div className="border-b border-blue-50 p-5 sm:p-7 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between"><div><p className="text-[0.58rem] font-black uppercase tracking-[0.17em] text-blue-600">Step 1</p><h3 className="mt-1 text-lg font-black text-slate-950">Select a time</h3></div>{availability && <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[0.6rem] font-black text-blue-700">{availability.selectedType.durationMinutes} min</span>}</div>
          {loading ? <div className="grid min-h-72 place-items-center"><div className="text-center"><LoaderCircle className="mx-auto size-6 animate-spin text-blue-600" /><p className="mt-3 text-xs font-bold text-slate-500">Finding available times…</p></div></div> : displayDays.length ? <>
            <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-3">{displayDays.slice(0, 12).map((day) => <button key={day.date} type="button" onClick={() => { setSelectedDate(day.date); setSelectedStart(""); }} className={cn("rounded-xl border px-2 py-3 text-xs font-black transition", selectedDate === day.date ? "border-slate-950 bg-slate-950 text-white shadow-lg" : "border-slate-100 bg-slate-50 text-slate-600 hover:border-blue-200 hover:bg-blue-50")}>{dayLabel(day.date)}</button>)}</div>
            <div className="mt-5 grid max-h-60 grid-cols-2 gap-2 overflow-y-auto pr-1">{slots.map((slot) => <button key={slot.startAt} type="button" onClick={() => setSelectedStart(slot.startAt)} className={cn("min-h-11 rounded-xl border text-xs font-black transition", selectedStart === slot.startAt ? "border-blue-600 bg-blue-600 text-white shadow-md" : "border-blue-100 text-blue-700 hover:border-blue-400 hover:bg-blue-50")}>{timeLabel(slot.startAt, timezone)}</button>)}</div>
          </> : <div className="mt-5 rounded-2xl bg-slate-50 p-6 text-center text-sm font-bold leading-6 text-slate-500">No bookable times are available in the current window. Please check back shortly.</div>}
          <div className="mt-5"><TimezoneControl detectedTimezone={detectedTimezone} override={timezoneOverride} onOverride={setTimezoneOverride} /></div>
          <p className="mt-3 flex items-center gap-2 text-[0.65rem] font-bold text-slate-500"><Clock3 className="size-3.5 text-blue-600" /> Every available time is converted to {timezoneLabel(timezone)}.</p>
        </div>

        <div className="p-5 sm:p-7">
          <div><p className="text-[0.58rem] font-black uppercase tracking-[0.17em] text-cyan-600">Step 2</p><h3 className="mt-1 text-lg font-black text-slate-950">Your details</h3></div>
          {availability?.selectedType.description && <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">{availability.selectedType.description}</p>}
          {selectedStart && <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs font-bold leading-5 text-emerald-800"><CheckCircle2 className="mt-0.5 size-4 shrink-0" /> {longDate(selectedStart, timezone)}</div>}
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
            <div className="space-y-2"><Label htmlFor="booking-name">Name</Label><Input id="booking-name" name="name" defaultValue={name} required autoComplete="name" /></div>
            <div className="space-y-2"><Label htmlFor="booking-email">Email</Label><Input id="booking-email" name="email" type="email" defaultValue={email} required autoComplete="email" /></div>
            <div className="space-y-2"><Label htmlFor="booking-phone">Phone</Label><Input id="booking-phone" name="phone" defaultValue={phone} autoComplete="tel" /></div>
            <div className="space-y-2"><Label htmlFor="booking-company">Company</Label><Input id="booking-company" name="company" defaultValue={company} autoComplete="organization" /></div>
            <div className="space-y-2 sm:col-span-2"><Label htmlFor="booking-notes">What should we prepare?</Label><Textarea id="booking-notes" name="notes" defaultValue={service ? `I’m interested in ${service}.` : ""} rows={4} placeholder="Share the goal, challenge, or decision you want to discuss." /></div>
          </div>
          {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold leading-5 text-rose-700">{error}</p>}
          <Button type="submit" disabled={submitting || loading || !selectedStart} className="mt-5 h-12 w-full rounded-xl bg-blue-600 text-sm font-black hover:bg-blue-700">{submitting ? <><LoaderCircle className="size-4 animate-spin" /> Confirming…</> : <><CalendarCheck2 className="size-4" /> Confirm booking</>}</Button>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <span className="flex items-center gap-2 text-[0.6rem] font-bold text-slate-400"><ShieldCheck className="size-3.5 text-emerald-500" /> Secure booking</span>
            <span className="flex items-center gap-2 text-[0.6rem] font-bold text-slate-400"><UserRound className="size-3.5 text-blue-500" /> CRM connected</span>
            <span className="flex items-center gap-2 text-[0.6rem] font-bold text-slate-400"><MapPin className="size-3.5 text-cyan-500" /> {availability?.selectedType.location || "Location follows"}</span>
          </div>
        </div>
      </div>
    </form>
  );
}
