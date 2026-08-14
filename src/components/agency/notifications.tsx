"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Archive,
  Bell,
  BellRing,
  CalendarCheck2,
  CheckCheck,
  CircleDot,
  LoaderCircle,
  Mail,
  MailCheck,
  RefreshCcw,
  Settings2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type NotificationItem = {
  id: string;
  category: "crud" | "activity" | "booking" | "system";
  type: string;
  title: string;
  message: string | null;
  actionUrl: string | null;
  resource: string | null;
  resourceId: string | null;
  emailRequested: boolean;
  emailStatus: string;
  emailedAt: string | null;
  readAt: string | null;
  createdAt: string;
  actor: { name: string; image: string | null } | null;
};

type Preference = {
  inAppEnabled: boolean;
  emailEnabled: boolean;
  emailCrud: boolean;
  emailActivity: boolean;
  emailBookings: boolean;
  notifyOwnActions: boolean;
};

const categoryStyles = {
  crud: { icon: CircleDot, className: "bg-blue-50 text-blue-600", label: "Workspace" },
  activity: { icon: Sparkles, className: "bg-violet-50 text-violet-600", label: "Activity" },
  booking: { icon: CalendarCheck2, className: "bg-cyan-50 text-cyan-700", label: "Booking" },
  system: { icon: BellRing, className: "bg-amber-50 text-amber-700", label: "System" },
};

function relativeTime(value: string) {
  const delta = new Date(value).getTime() - Date.now();
  const minutes = Math.round(delta / 60_000);
  if (Math.abs(minutes) < 1) return "now";
  if (Math.abs(minutes) < 60) return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(hours, "hour");
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 14) return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(days, "day");
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

async function changeNotification(payload: Record<string, string>) {
  const response = await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.error ?? "The notification could not be changed.");
  window.dispatchEvent(new Event("mwlabs:notifications-changed"));
  return result;
}

function NotificationRow({ item, compact = false, onChanged }: { item: NotificationItem; compact?: boolean; onChanged: () => void }) {
  const category = categoryStyles[item.category] ?? categoryStyles.system;
  const Icon = category.icon;

  async function mutate(action: "read" | "unread" | "archive" | "retry-email") {
    try {
      await changeNotification({ action, id: item.id });
      onChanged();
    } catch (error) {
      toast.error("Notification update failed", { description: error instanceof Error ? error.message : "Try again." });
    }
  }

  const body = (
    <div className={cn("group relative flex gap-3 rounded-xl border p-3.5 transition", !item.readAt ? "border-blue-100 bg-blue-50/45 shadow-sm" : "border-transparent bg-muted/25 hover:border-border hover:bg-white", compact && "rounded-none border-x-0 border-t-0 p-4")}>
      <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", category.className)}><Icon className="size-4" /></span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2"><p className="min-w-0 flex-1 text-xs font-semibold leading-5 text-foreground">{item.title}</p>{!item.readAt && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-blue-600" />}</div>
        {item.message && <p className="mt-1 text-[11px] leading-5 text-muted-foreground">{item.message}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[9px] font-medium text-muted-foreground">
          <span>{category.label}</span><span>·</span><time dateTime={item.createdAt}>{relativeTime(item.createdAt)}</time>
          {!compact && item.emailRequested && <><span>·</span><span className={cn(item.emailStatus === "Sent" && "text-emerald-700", ["Failed", "Deferred"].includes(item.emailStatus) && "text-amber-700")}>Email {item.emailStatus.toLowerCase()}</span></>}
        </div>
        {!compact && <div className="mt-3 flex flex-wrap gap-1.5">
          {item.actionUrl && <Button nativeButton={false} render={<Link href={item.actionUrl} onClick={() => { if (!item.readAt) void mutate("read"); }} />} size="xs" variant="outline">Open record</Button>}
          <Button size="xs" variant="ghost" onClick={() => void mutate(item.readAt ? "unread" : "read")}>{item.readAt ? "Mark unread" : "Mark read"}</Button>
          <Button size="xs" variant="ghost" onClick={() => void mutate("archive")}><Archive className="size-3" /> Archive</Button>
          {item.emailRequested && ["Failed", "Deferred"].includes(item.emailStatus) && <Button size="xs" variant="ghost" onClick={() => void mutate("retry-email")}><RefreshCcw className="size-3" /> Retry email</Button>}
        </div>}
      </div>
    </div>
  );

  if (compact && item.actionUrl) return <Link href={item.actionUrl} onClick={() => { if (!item.readAt) void mutate("read"); }}>{body}</Link>;
  return body;
}

function useNotifications(limit: number) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/notifications?limit=${limit}`, { cache: "no-store" });
      const result = await response.json().catch(() => ({}));
      if (response.status === 401) {
        setItems([]);
        setUnreadCount(0);
        return;
      }
      if (!response.ok) throw new Error(result.error ?? "Notifications could not be loaded.");
      setItems(result.notifications as NotificationItem[]);
      setUnreadCount(Number(result.unreadCount) || 0);
    } catch (error) {
      if (process.env.NODE_ENV === "development") console.warn(error);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    const initialTimer = window.setTimeout(() => void load(), 0);
    const timer = window.setInterval(() => void load(), 30_000);
    const refresh = () => void load();
    window.addEventListener("mwlabs:notifications-changed", refresh);
    return () => { window.clearTimeout(initialTimer); window.clearInterval(timer); window.removeEventListener("mwlabs:notifications-changed", refresh); };
  }, [load]);

  return { items, unreadCount, loading, load };
}

export function NotificationsBell({ onCountChange }: { onCountChange?: (count: number) => void }) {
  const [open, setOpen] = useState(false);
  const { items, unreadCount, loading, load } = useNotifications(12);

  useEffect(() => onCountChange?.(unreadCount), [onCountChange, unreadCount]);

  async function readAll() {
    try {
      await changeNotification({ action: "read-all" });
      await load();
    } catch (error) {
      toast.error("Could not mark notifications read", { description: error instanceof Error ? error.message : "Try again." });
    }
  }

  return (
    <Sheet open={open} onOpenChange={(next) => { setOpen(next); if (next) void load(); }}>
      <SheetTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "relative size-10 overflow-visible rounded-full border shadow-sm transition-all duration-200",
              unreadCount > 0
                ? "border-orange-200 bg-orange-50 text-orange-700 hover:border-orange-300 hover:bg-orange-100 hover:text-orange-800"
                : "border-blue-100 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700",
            )}
            aria-label={unreadCount ? `${unreadCount} unread notifications` : "Notifications"}
          />
        }
      >
        {unreadCount > 0 ? <BellRing className="size-[18px]" aria-hidden="true" /> : <Bell className="size-[18px]" aria-hidden="true" />}
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full border-2 border-white bg-orange-500 px-1 text-[8px] font-bold leading-none text-white shadow-[0_3px_8px_rgba(249,115,22,0.35)]">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </SheetTrigger>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="border-b px-5 py-5">
          <div className="flex items-center justify-between gap-4 pr-9"><div><SheetTitle>Notifications</SheetTitle><SheetDescription className="mt-1 text-xs">Live CRM, booking, and activity updates.</SheetDescription></div>{unreadCount > 0 && <Button variant="ghost" size="sm" onClick={() => void readAll()}><CheckCheck className="size-4" /> Read all</Button>}</div>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1">
          {loading ? <div className="grid h-48 place-items-center"><LoaderCircle className="size-5 animate-spin text-blue-600" /></div> : items.length ? items.map((item) => <NotificationRow key={item.id} item={item} compact onChanged={() => void load()} />) : <div className="grid h-64 place-items-center px-8 text-center"><div><span className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-50 text-emerald-600"><MailCheck className="size-5" /></span><p className="mt-4 text-sm font-semibold">You’re all caught up</p><p className="mt-2 text-xs leading-5 text-muted-foreground">New CRM and scheduling activity will appear here.</p></div></div>}
        </ScrollArea>
        <div className="border-t p-4"><Button nativeButton={false} render={<Link href="/app/inbox" onClick={() => setOpen(false)} />} variant="outline" className="w-full">Open notification inbox</Button></div>
      </SheetContent>
    </Sheet>
  );
}

const preferenceRows: Array<{ key: keyof Preference; title: string; description: string }> = [
  { key: "inAppEnabled", title: "In-app notifications", description: "Show operational updates in the bell and inbox." },
  { key: "emailEnabled", title: "Email delivery", description: "Master switch for notification emails." },
  { key: "emailCrud", title: "CRUD emails", description: "Created, updated, and deleted CRM records." },
  { key: "emailActivity", title: "Activity emails", description: "Enquiries, registrations, and important workflow activity." },
  { key: "emailBookings", title: "Booking emails", description: "New meetings, reschedules, and cancellations." },
  { key: "notifyOwnActions", title: "My own actions", description: "Notify me about changes I make as well as teammate changes." },
];

export function NotificationsWorkspace() {
  const { items, unreadCount, loading, load } = useNotifications(100);
  const [category, setCategory] = useState<"all" | NotificationItem["category"]>("all");
  const [preference, setPreference] = useState<Preference | null>(null);
  const [providerConfigured, setProviderConfigured] = useState(false);
  const [savingPreference, setSavingPreference] = useState<keyof Preference | null>(null);

  useEffect(() => {
    fetch("/api/notifications/preferences", { cache: "no-store" })
      .then(async (response) => { const result = await response.json(); if (!response.ok) throw new Error(result.error); return result; })
      .then((result) => { setPreference(result.preference as Preference); setProviderConfigured(Boolean(result.emailProviderConfigured)); })
      .catch((error) => toast.error("Preferences unavailable", { description: error instanceof Error ? error.message : "Refresh and try again." }));
  }, []);

  const visibleItems = useMemo(() => category === "all" ? items : items.filter((item) => item.category === category), [category, items]);

  async function updatePreference(key: keyof Preference, checked: boolean) {
    if (!preference) return;
    const previous = preference;
    setPreference({ ...preference, [key]: checked });
    setSavingPreference(key);
    try {
      const response = await fetch("/api/notifications/preferences", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [key]: checked }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Preference could not be saved.");
      setPreference(result.preference as Preference);
      toast.success("Notification preference saved");
    } catch (error) {
      setPreference(previous);
      toast.error("Preference not saved", { description: error instanceof Error ? error.message : "Try again." });
    } finally {
      setSavingPreference(null);
    }
  }

  async function bulk(action: "read-all" | "archive-read") {
    try {
      await changeNotification({ action });
      await load();
      toast.success(action === "read-all" ? "All notifications marked read" : "Read notifications archived");
    } catch (error) {
      toast.error("Inbox update failed", { description: error instanceof Error ? error.message : "Try again." });
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div><div className="flex flex-wrap items-center gap-2"><p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-muted-foreground">Attention center</p><Badge variant="outline" className="rounded-full bg-blue-50 text-[9px] text-blue-700">{unreadCount} unread</Badge></div><h1 className="admin-page-title">Notification inbox</h1><p className="admin-page-description">Every important CRM change, activity signal, and booking update—with delivery status and personal controls.</p></div>
        <div className="admin-actions"><Button variant="outline" onClick={() => void bulk("archive-read")}><Archive className="size-4" /> Archive read</Button><Button onClick={() => void bulk("read-all")} disabled={!unreadCount}><CheckCheck className="size-4" /> Mark all read</Button></div>
      </div>

      <div className="mt-7 grid gap-5 xl:grid-cols-[1fr_360px]">
        <section className="admin-card overflow-hidden rounded-2xl">
          <div className="admin-scrollbar flex gap-2 overflow-x-auto border-b p-3 sm:flex-wrap sm:p-4">{(["all", "crud", "activity", "booking", "system"] as const).map((value) => <button key={value} onClick={() => setCategory(value)} className={cn("min-h-9 shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-semibold capitalize transition", category === value ? "border-slate-950 bg-slate-950 text-white" : "border-border bg-white text-muted-foreground hover:border-blue-200 hover:text-blue-700")}>{value === "crud" ? "Workspace" : value}</button>)}</div>
          <div className="p-2 sm:p-3">
            {loading ? <div className="grid h-64 place-items-center"><LoaderCircle className="size-6 animate-spin text-blue-600" /></div> : visibleItems.length ? <div className="space-y-2">{visibleItems.map((item) => <NotificationRow key={item.id} item={item} onChanged={() => void load()} />)}</div> : <div className="grid h-64 place-items-center text-center"><div><BellRing className="mx-auto size-8 text-slate-300" /><p className="mt-3 text-sm font-semibold">No notifications in this view</p><p className="mt-1 text-xs text-muted-foreground">Activity will appear here automatically.</p></div></div>}
          </div>
        </section>

        <aside className="admin-card h-fit rounded-2xl p-4 sm:p-5 xl:sticky xl:top-24">
          <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-slate-950 text-white"><Settings2 className="size-4" /></span><div><h2 className="text-sm font-semibold">Delivery preferences</h2><p className="mt-0.5 text-[10px] text-muted-foreground">Saved per workspace and user</p></div></div>
          {!providerConfigured && <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] leading-5 text-amber-800"><div className="flex items-center gap-2 font-semibold"><Mail className="size-3.5" /> Email provider not configured</div><p className="mt-1">In-app alerts are live. Email attempts stay deferred until the Resend environment variables are added.</p></div>}
          <div className="mt-5 divide-y rounded-xl border">
            {preference ? preferenceRows.map((row) => {
              const emailChild = row.key.startsWith("email") && row.key !== "emailEnabled";
              return <label key={row.key} className={cn("flex items-start gap-3 p-3.5", emailChild && !preference.emailEnabled && "opacity-45")}><span className="min-w-0 flex-1"><span className="block text-xs font-semibold">{row.title}</span><span className="mt-1 block text-[10px] leading-4 text-muted-foreground">{row.description}</span></span><Switch checked={preference[row.key]} disabled={savingPreference === row.key || (emailChild && !preference.emailEnabled)} onCheckedChange={(checked) => void updatePreference(row.key, checked)} /></label>;
            }) : <div className="grid h-44 place-items-center"><LoaderCircle className="size-5 animate-spin text-blue-600" /></div>}
          </div>
        </aside>
      </div>
    </div>
  );
}
