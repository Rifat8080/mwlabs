import "server-only";

import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

import { db } from "@/lib/db";

export const schedulingOrganizationSlug = "mw-labs";
const leadTokenLifetimeSeconds = 7 * 24 * 60 * 60;
const bookingTokenLifetimeSeconds = 365 * 24 * 60 * 60;

type SignedClaim = {
  subject: string;
  kind: "lead" | "booking";
  expiresAt: number;
};

export type PublicBookingType = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  durationMinutes: number;
  timezone: string;
  location: string | null;
  color: string;
};

export type AvailableDay = {
  date: string;
  slots: Array<{ startAt: string; endAt: string }>;
};

type ConflictEvent = {
  startAt: Date;
  endAt: Date | null;
  bookingType: { durationMinutes: number; bufferBeforeMinutes: number; bufferAfterMinutes: number } | null;
};

function signature(value: string) {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) return null;
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function sameSecret(left: string, right: string) {
  const leftDigest = createHash("sha256").update(left).digest();
  const rightDigest = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftDigest, rightDigest);
}

function createSignedToken(subject: string, kind: SignedClaim["kind"], lifetimeSeconds: number) {
  const claim: SignedClaim = {
    subject,
    kind,
    expiresAt: Math.floor(Date.now() / 1_000) + lifetimeSeconds,
  };
  const payload = Buffer.from(JSON.stringify(claim)).toString("base64url");
  const signed = signature(payload);
  return signed ? `${payload}.${signed}` : null;
}

function readSignedToken(token: string | string[] | undefined, kind: SignedClaim["kind"]) {
  if (!token || Array.isArray(token)) return null;
  const [payload, suppliedSignature, ...extra] = token.split(".");
  if (!payload || !suppliedSignature || extra.length) return null;
  const expectedSignature = signature(payload);
  if (!expectedSignature || !sameSecret(suppliedSignature, expectedSignature)) return null;

  try {
    const claim = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<SignedClaim>;
    if (claim.kind !== kind || typeof claim.subject !== "string" || !claim.subject || typeof claim.expiresAt !== "number") return null;
    if (claim.expiresAt < Math.floor(Date.now() / 1_000)) return null;
    return claim.subject;
  } catch {
    return null;
  }
}

export function createLeadBookingPath(leadId: string) {
  const token = createSignedToken(leadId, "lead", leadTokenLifetimeSeconds);
  return token ? `/book?lead=${encodeURIComponent(token)}` : "/book";
}

export function readLeadBookingToken(token?: string | string[]) {
  return readSignedToken(token, "lead");
}

export function createBookingManagePath(bookingId: string) {
  const token = createSignedToken(bookingId, "booking", bookingTokenLifetimeSeconds);
  return token ? `/book/manage?booking=${encodeURIComponent(token)}` : "/book";
}

export function readBookingManageToken(token?: string | string[]) {
  return readSignedToken(token, "booking");
}

export function createBookingReference() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `MW-${date}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export function bookingSlotKey(organizationId: string, startAt: Date) {
  return `${organizationId}:${startAt.toISOString()}`;
}

export function hasCalendarConflict({
  events,
  startAt,
  endAt,
  bufferBeforeMinutes,
  bufferAfterMinutes,
}: {
  events: ConflictEvent[];
  startAt: Date;
  endAt: Date;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
}) {
  const candidateStart = startAt.getTime() - bufferBeforeMinutes * 60 * 1_000;
  const candidateEnd = endAt.getTime() + bufferAfterMinutes * 60 * 1_000;
  return events.some((event) => {
    const existingDuration = event.bookingType?.durationMinutes ?? 30;
    const existingStart = event.startAt.getTime() - (event.bookingType?.bufferBeforeMinutes ?? 0) * 60 * 1_000;
    const existingEnd = (event.endAt?.getTime() ?? event.startAt.getTime() + existingDuration * 60 * 1_000)
      + (event.bookingType?.bufferAfterMinutes ?? 0) * 60 * 1_000;
    return existingStart < candidateEnd && existingEnd > candidateStart;
  });
}

export function isValidTimezone(timezone: string) {
  try {
    new Intl.DateTimeFormat("en", { timeZone: timezone }).format();
    return true;
  } catch {
    return false;
  }
}

export async function ensureSchedulingDefaults(organizationId: string) {
  await db.$transaction([
    db.bookingType.upsert({
      where: { organizationId_slug: { organizationId, slug: "discovery" } },
      create: {
        organizationId,
        title: "Discovery call",
        slug: "discovery",
        description: "A focused 30-minute conversation about goals, constraints, timing, and the best next step.",
        durationMinutes: 30,
        slotIntervalMinutes: 30,
        bufferBeforeMinutes: 15,
        bufferAfterMinutes: 15,
        minimumNoticeHours: 12,
        maximumAdvanceDays: 60,
        timezone: "Asia/Dhaka",
        location: "Google Meet link shared after confirmation",
        color: "#2563eb",
      },
      update: {},
    }),
    db.availabilityRule.createMany({
      data: [1, 2, 3, 4, 5].map((weekday) => ({
        organizationId,
        weekday,
        startMinute: 9 * 60,
        endMinute: 17 * 60,
        enabled: true,
      })),
      skipDuplicates: true,
    }),
  ]);
}

function zonedParts(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  return Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, Number(part.value)])) as Record<string, number>;
}

export function dateInTimezone(date: Date, timezone: string) {
  const parts = zonedParts(date, timezone);
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

function addDays(date: string, amount: number) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + amount)).toISOString().slice(0, 10);
}

function weekdayForDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function zonedDateTimeToUtc(date: string, minuteOfDay: number, timezone: string) {
  const [year, month, day] = date.split("-").map(Number);
  const hour = Math.floor(minuteOfDay / 60);
  const minute = minuteOfDay % 60;
  const intended = Date.UTC(year, month - 1, day, hour, minute, 0, 0);
  let candidate = intended;

  for (let iteration = 0; iteration < 2; iteration += 1) {
    const actual = zonedParts(new Date(candidate), timezone);
    const represented = Date.UTC(actual.year, actual.month - 1, actual.day, actual.hour, actual.minute, actual.second);
    candidate -= represented - intended;
  }

  return new Date(candidate);
}

export async function availableDays({
  organizationId,
  bookingType,
  from,
  days = 14,
  excludeEventId,
}: {
  organizationId: string;
  bookingType: {
    durationMinutes: number;
    slotIntervalMinutes: number;
    bufferBeforeMinutes: number;
    bufferAfterMinutes: number;
    minimumNoticeHours: number;
    maximumAdvanceDays: number;
    timezone: string;
  };
  from?: string;
  days?: number;
  excludeEventId?: string;
}): Promise<AvailableDay[]> {
  const safeDays = Number.isFinite(days) ? Math.max(1, Math.min(Math.floor(days), 31)) : 14;
  const now = new Date();
  const today = dateInTimezone(now, bookingType.timezone);
  const firstDate = from && /^\d{4}-\d{2}-\d{2}$/.test(from) && from > today ? from : today;
  const lastAllowedDate = addDays(today, bookingType.maximumAdvanceDays);
  const lastDate = addDays(firstDate, safeDays - 1);
  const rangeStart = zonedDateTimeToUtc(firstDate, 0, bookingType.timezone);
  const rangeEnd = zonedDateTimeToUtc(addDays(lastDate, 1), 0, bookingType.timezone);

  const [rules, events] = await Promise.all([
    db.availabilityRule.findMany({ where: { organizationId, enabled: true } }),
    db.calendarEvent.findMany({
      where: {
        organizationId,
        status: "Scheduled",
        id: excludeEventId ? { not: excludeEventId } : undefined,
        startAt: { lt: rangeEnd },
        OR: [{ endAt: { gt: rangeStart } }, { endAt: null, startAt: { gte: rangeStart } }],
      },
      select: {
        startAt: true,
        endAt: true,
        bookingType: { select: { durationMinutes: true, bufferBeforeMinutes: true, bufferAfterMinutes: true } },
      },
    }),
  ]);

  const ruleByDay = new Map(rules.map((rule) => [rule.weekday, rule]));
  const minimumStart = now.getTime() + bookingType.minimumNoticeHours * 60 * 60 * 1_000;
  const result: AvailableDay[] = [];

  for (let dayOffset = 0; dayOffset < safeDays; dayOffset += 1) {
    const date = addDays(firstDate, dayOffset);
    if (date > lastAllowedDate) break;
    const rule = ruleByDay.get(weekdayForDate(date));
    if (!rule) continue;

    const slots: AvailableDay["slots"] = [];
    for (let minute = rule.startMinute; minute + bookingType.durationMinutes <= rule.endMinute; minute += bookingType.slotIntervalMinutes) {
      const startAt = zonedDateTimeToUtc(date, minute, bookingType.timezone);
      const endAt = new Date(startAt.getTime() + bookingType.durationMinutes * 60 * 1_000);
      if (startAt.getTime() < minimumStart) continue;

      const conflicting = hasCalendarConflict({
        events,
        startAt,
        endAt,
        bufferBeforeMinutes: bookingType.bufferBeforeMinutes,
        bufferAfterMinutes: bookingType.bufferAfterMinutes,
      });

      if (!conflicting) slots.push({ startAt: startAt.toISOString(), endAt: endAt.toISOString() });
    }

    if (slots.length) result.push({ date, slots });
  }

  return result;
}

export function publicBookingType(type: PublicBookingType): PublicBookingType {
  return {
    id: type.id,
    title: type.title,
    slug: type.slug,
    description: type.description,
    durationMinutes: type.durationMinutes,
    timezone: type.timezone,
    location: type.location,
    color: type.color,
  };
}
