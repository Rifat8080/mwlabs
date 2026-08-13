"use client";

import { useSyncExternalStore } from "react";
import { Globe2 } from "lucide-react";

const subscribeTimezone = () => () => undefined;
const emptyTimezones: string[] = [];
let cachedTimezones: string[] | undefined;

function browserTimezone(fallback: string) {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || fallback;
}

function supportedTimezones() {
  if (cachedTimezones) return cachedTimezones;
  cachedTimezones = typeof Intl.supportedValuesOf === "function"
    ? Intl.supportedValuesOf("timeZone")
    : ["UTC", "Asia/Dhaka", "Asia/Dubai", "Asia/Kolkata", "Europe/London", "Europe/Paris", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "Australia/Sydney"];
  return cachedTimezones;
}

export function useVisitorTimezone(fallback = "UTC") {
  return useSyncExternalStore(
    subscribeTimezone,
    () => browserTimezone(fallback),
    () => fallback,
  );
}

export function timezoneLabel(timezone: string) {
  let offset = "";
  try {
    offset = new Intl.DateTimeFormat("en-GB", { timeZone: timezone, timeZoneName: "shortOffset" })
      .formatToParts(new Date())
      .find((part) => part.type === "timeZoneName")?.value ?? "";
  } catch {
    return timezone.replaceAll("_", " ");
  }
  return `${timezone.replaceAll("_", " ")}${offset ? ` (${offset})` : ""}`;
}

export function TimezoneControl({
  detectedTimezone,
  override,
  onOverride,
}: {
  detectedTimezone: string;
  override: string;
  onOverride: (timezone: string) => void;
}) {
  const timezones = useSyncExternalStore(subscribeTimezone, supportedTimezones, () => emptyTimezones);
  const selectedTimezone = override || detectedTimezone;
  const options = timezones.includes(selectedTimezone) ? timezones : [selectedTimezone, ...timezones];

  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-[0.6rem] font-black uppercase tracking-[0.15em] text-slate-500">
        <Globe2 className="size-3.5 text-blue-600" /> Your timezone
      </span>
      <select
        value={override}
        onChange={(event) => onOverride(event.target.value)}
        aria-label="Timezone used to display meeting times"
        className="h-10 w-full rounded-xl border border-blue-100 bg-white px-3 text-xs font-bold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
      >
        <option value="">Automatic · {timezoneLabel(detectedTimezone)}</option>
        {options.map((timezone) => <option key={timezone} value={timezone}>{timezoneLabel(timezone)}</option>)}
      </select>
    </label>
  );
}

export function LocalMeetingTime({ value, fallbackTimezone = "UTC" }: { value: string; fallbackTimezone?: string }) {
  const timezone = useVisitorTimezone(fallbackTimezone);
  return (
    <time dateTime={value} title={timezoneLabel(timezone)}>
      {new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: timezone,
        timeZoneName: "short",
      }).format(new Date(value))}
    </time>
  );
}
