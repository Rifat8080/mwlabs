"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarCheck2, Check, Clock3, Copy, ExternalLink, LoaderCircle, Plus, Settings2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type BookingType = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  durationMinutes: number;
  slotIntervalMinutes: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  minimumNoticeHours: number;
  maximumAdvanceDays: number;
  timezone: string;
  location: string | null;
  color: string;
  active: boolean;
};
type Rule = { weekday: number; startMinute: number; endMinute: number; enabled: boolean };
type SettingsResponse = { bookingTypes: BookingType[]; availability: Rule[] };

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const blankType: Omit<BookingType, "id"> = {
  title: "",
  slug: "",
  description: "",
  durationMinutes: 30,
  slotIntervalMinutes: 30,
  bufferBeforeMinutes: 15,
  bufferAfterMinutes: 15,
  minimumNoticeHours: 12,
  maximumAdvanceDays: 60,
  timezone: "Asia/Dhaka",
  location: "Google Meet link shared after confirmation",
  color: "#2563eb",
  active: true,
};

function minuteToTime(minute: number) {
  return `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
}

function timeToMinute(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

export function SchedulingWorkspace() {
  const [settings, setSettings] = useState<SettingsResponse | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState<BookingType | (Omit<BookingType, "id"> & { id?: undefined })>(blankType);
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const creating = !form.id;

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/scheduling/settings");
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Scheduling settings could not be loaded.");
      const next = result as SettingsResponse;
      setSettings(next);
      setRules(next.availability);
      const selected = next.bookingTypes.find((item) => item.id === selectedId) ?? next.bookingTypes[0];
      if (selected) { setSelectedId(selected.id); setForm(selected); }
    } catch (error) {
      toast.error("Scheduling unavailable", { description: error instanceof Error ? error.message : "Refresh and try again." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    fetch("/api/scheduling/settings")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Scheduling settings could not be loaded.");
        return result as SettingsResponse;
      })
      .then((next) => {
        if (!active) return;
        setSettings(next);
        setRules(next.availability);
        const selected = next.bookingTypes[0];
        if (selected) { setSelectedId(selected.id); setForm(selected); }
      })
      .catch((error) => {
        if (active) toast.error("Scheduling unavailable", { description: error instanceof Error ? error.message : "Refresh and try again." });
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const activeCount = useMemo(() => settings?.bookingTypes.filter((item) => item.active).length ?? 0, [settings]);

  function selectType(type: BookingType) {
    setSelectedId(type.id);
    setForm(type);
  }

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function saveType(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const { id, ...data } = form;
      const response = await fetch("/api/scheduling/settings", {
        method: id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(id ? { id, data } : { data }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Meeting type could not be saved.");
      toast.success(id ? "Meeting type updated" : "Meeting type created");
      if (result.bookingType?.id) setSelectedId(result.bookingType.id);
      await load();
    } catch (error) {
      toast.error("Could not save meeting type", { description: error instanceof Error ? error.message : "Try again." });
    } finally {
      setSaving(false);
    }
  }

  async function saveAvailability() {
    setSaving(true);
    try {
      const response = await fetch("/api/scheduling/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ availability: rules }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Availability could not be saved.");
      toast.success("Weekly availability saved");
    } catch (error) {
      toast.error("Could not save availability", { description: error instanceof Error ? error.message : "Try again." });
    } finally {
      setSaving(false);
    }
  }

  async function deleteType() {
    if (!form.id || !window.confirm(`Delete “${form.title}”? Existing calendar events will be retained.`)) return;
    setSaving(true);
    try {
      const response = await fetch("/api/scheduling/settings", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: form.id }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Meeting type could not be deleted.");
      setSelectedId("");
      toast.success("Meeting type deleted");
      await load();
    } catch (error) {
      toast.error("Could not delete meeting type", { description: error instanceof Error ? error.message : "Try again." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="grid min-h-[60svh] place-items-center"><div className="text-center"><LoaderCircle className="mx-auto size-6 animate-spin text-blue-600" /><p className="mt-3 text-xs font-semibold text-muted-foreground">Loading your scheduling system…</p></div></div>;

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl"><div className="flex items-center gap-2"><p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-muted-foreground">Native scheduling</p><Badge variant="outline" className="rounded-full bg-emerald-50 text-[8px] font-semibold text-emerald-700">CRM owned</Badge></div><h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">Scheduling &amp; availability</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Manage bookable meetings, working hours, buffers, notice periods, and public booking links without an external scheduling provider.</p></div>
        <div className="flex gap-2"><Button variant="outline" onClick={() => { void navigator.clipboard.writeText(`${window.location.origin}/book`); toast.success("Booking link copied"); }}><Copy className="size-4" /> Copy booking link</Button><Button nativeButton={false} render={<Link href="/book" target="_blank" />}><ExternalLink className="size-4" /> Open booking page</Button></div>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        {[{ label: "Active meeting types", value: String(activeCount), detail: "Shown on the public scheduler" }, { label: "Booking horizon", value: `${Math.max(...(settings?.bookingTypes.map((item) => item.maximumAdvanceDays) ?? [60]))} days`, detail: "Furthest available date" }, { label: "System", value: "First-party", detail: "CRM, calendar, leads and portal connected" }].map((metric) => <div key={metric.label} className="rounded-2xl border bg-white p-5 shadow-sm"><p className="text-xs font-medium text-muted-foreground">{metric.label}</p><p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">{metric.value}</p><p className="mt-2 text-[11px] text-muted-foreground">{metric.detail}</p></div>)}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[0.72fr_1.28fr]">
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between"><div><h2 className="text-sm font-semibold">Meeting types</h2><p className="mt-1 text-[11px] text-muted-foreground">What visitors can book.</p></div><Button size="sm" onClick={() => { setSelectedId(""); setForm(blankType); }}><Plus className="size-3.5" /> New</Button></div>
          <div className="mt-4 space-y-2">{settings?.bookingTypes.map((type) => <button key={type.id} onClick={() => selectType(type)} className={cn("w-full rounded-xl border p-4 text-left transition", form.id === type.id ? "border-blue-300 bg-blue-50 shadow-sm" : "hover:bg-muted/40")}><div className="flex items-start justify-between gap-3"><span className="flex items-center gap-3"><span className="size-3 rounded-full" style={{ backgroundColor: type.color }} /><span><span className="block text-sm font-semibold">{type.title}</span><span className="mt-1 block text-[10px] text-muted-foreground">/book?type={type.slug}</span></span></span><Badge variant="outline" className={cn("text-[8px]", type.active ? "text-emerald-700" : "text-muted-foreground")}>{type.active ? "Active" : "Hidden"}</Badge></div><div className="mt-3 flex gap-4 text-[10px] text-muted-foreground"><span className="flex items-center gap-1"><Clock3 className="size-3" /> {type.durationMinutes} min</span><span>{type.minimumNoticeHours}h notice</span><span>{type.maximumAdvanceDays}d horizon</span></div></button>)}</div>
        </section>

        <form onSubmit={saveType} className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between"><div><h2 className="text-sm font-semibold">{creating ? "Create meeting type" : "Meeting type settings"}</h2><p className="mt-1 text-[11px] text-muted-foreground">Control duration, booking rules and public presentation.</p></div><Settings2 className="size-4 text-muted-foreground" /></div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(event) => update("title", event.target.value)} required /></div>
            <div className="space-y-2"><Label>Booking URL slug</Label><Input value={form.slug} onChange={(event) => update("slug", event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} required placeholder="discovery" /></div>
            <div className="space-y-2 sm:col-span-2"><Label>Description</Label><Textarea value={form.description ?? ""} onChange={(event) => update("description", event.target.value)} rows={3} /></div>
            {[{ key: "durationMinutes", label: "Duration (minutes)", min: 10 }, { key: "slotIntervalMinutes", label: "Slot interval", min: 5 }, { key: "bufferBeforeMinutes", label: "Buffer before", min: 0 }, { key: "bufferAfterMinutes", label: "Buffer after", min: 0 }, { key: "minimumNoticeHours", label: "Minimum notice (hours)", min: 0 }, { key: "maximumAdvanceDays", label: "Booking horizon (days)", min: 1 }].map((field) => <div key={field.key} className="space-y-2"><Label>{field.label}</Label><Input type="number" min={field.min} value={String(form[field.key as keyof typeof form])} onChange={(event) => update(field.key as keyof typeof form, Number(event.target.value) as never)} required /></div>)}
            <div className="space-y-2"><Label>Host timezone</Label><Input value={form.timezone} onChange={(event) => update("timezone", event.target.value)} required placeholder="Asia/Dhaka" /></div>
            <div className="space-y-2"><Label>Accent color</Label><div className="flex gap-2"><input type="color" value={form.color} onChange={(event) => update("color", event.target.value)} className="h-9 w-12 rounded-lg border p-1" /><Input value={form.color} onChange={(event) => update("color", event.target.value)} required /></div></div>
            <div className="space-y-2 sm:col-span-2"><Label>Location or meeting instructions</Label><Input value={form.location ?? ""} onChange={(event) => update("location", event.target.value)} /></div>
            <label className="flex items-center justify-between rounded-xl border p-3 sm:col-span-2"><span><span className="block text-sm font-semibold">Accept public bookings</span><span className="block text-[10px] text-muted-foreground">Hidden types remain attached to historical meetings.</span></span><Switch checked={form.active} onCheckedChange={(checked) => update("active", checked)} /></label>
          </div>
          <div className="mt-5 flex justify-between gap-2">{form.id ? <Button type="button" variant="ghost" onClick={() => void deleteType()} disabled={saving} className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"><Trash2 className="size-4" /> Delete</Button> : <span />}<Button type="submit" disabled={saving}>{saving ? <LoaderCircle className="size-4 animate-spin" /> : <Check className="size-4" />} {creating ? "Create meeting type" : "Save meeting type"}</Button></div>
        </form>
      </div>

      <section className="mt-5 rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-sm font-semibold">Weekly availability</h2><p className="mt-1 text-[11px] text-muted-foreground">Recurring hours used by every active meeting type. Times follow each type’s host timezone.</p></div><Button onClick={() => void saveAvailability()} disabled={saving}><CalendarCheck2 className="size-4" /> Save availability</Button></div>
        <div className="mt-5 divide-y rounded-xl border">{rules.map((rule, index) => <div key={rule.weekday} className="grid items-center gap-3 p-3 sm:grid-cols-[1fr_1fr_1fr_auto]"><label className="flex items-center gap-3 text-sm font-semibold"><Switch checked={rule.enabled} onCheckedChange={(checked) => setRules((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, enabled: checked } : item))} /> {weekdays[rule.weekday]}</label><Input type="time" value={minuteToTime(rule.startMinute)} disabled={!rule.enabled} onChange={(event) => setRules((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, startMinute: timeToMinute(event.target.value) } : item))} /><Input type="time" value={minuteToTime(rule.endMinute)} disabled={!rule.enabled} onChange={(event) => setRules((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, endMinute: timeToMinute(event.target.value) } : item))} /><span className="text-[10px] font-medium text-muted-foreground">{rule.enabled ? `${(rule.endMinute - rule.startMinute) / 60}h` : "Unavailable"}</span></div>)}</div>
      </section>
    </div>
  );
}
