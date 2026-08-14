"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Activity, Check, CircleAlert, ExternalLink, LoaderCircle, Play, RefreshCcw, Save, ServerCog, Settings2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SettingsData = {
  organization: { id: string; name: string; slug: string; createdAt: string; updatedAt: string | null };
  currentRole: string;
  roles: Array<{ role: string; count: number }>;
  providers: Array<{ key: string; label: string; ready: boolean; detail: string }>;
  security: Array<{ label: string; ready: boolean; detail: string }>;
  backgroundJobs: {
    healthy: boolean;
    pending: number;
    processing: number;
    dead: number;
    completed24h: number;
    backlogged: number;
    stuck: number;
    oldestPendingAt: string | null;
    lastCompletedAt: string | null;
    recent: Array<{ id: string; type: string; status: string; attempts: number; maxAttempts: number; runAt: string; lastError: string | null; completedAt: string | null; createdAt: string }>;
  };
  auditLogs: Array<{ id: string; action: string; resource: string; resourceId: string | null; createdAt: string; actor: string }>;
};

export function SettingsWorkspace() {
  const [data, setData] = useState<SettingsData | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [jobAction, setJobAction] = useState<"run" | "retry-dead" | null>(null);

  useEffect(() => {
    let active = true;
    void fetch("/api/settings").then(async (response) => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not load workspace settings.");
      return result as SettingsData;
    }).then((result) => { if (active) { setData(result); setName(result.organization.name); } }).catch((error: unknown) => {
      if (active) toast.error("Settings unavailable", { description: error instanceof Error ? error.message : "Refresh and try again." });
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const readyChecks = useMemo(() => data ? [...data.providers, ...data.security].filter((item) => item.ready).length : 0, [data]);
  const totalChecks = (data?.providers.length ?? 0) + (data?.security.length ?? 0);
  const canEdit = Boolean(data && ["owner", "admin"].includes(data.currentRole));

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not save settings.");
      setData(result as SettingsData);
      setName(result.organization.name);
      window.dispatchEvent(new Event("mwlabs:notifications-changed"));
      toast.success("Workspace settings saved");
    } catch (error) {
      toast.error("Settings were not saved", { description: error instanceof Error ? error.message : "Try again." });
    } finally { setSaving(false); }
  }

  async function manageJobs(action: "run" | "retry-dead") {
    setJobAction(action);
    try {
      const response = await fetch("/api/jobs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Background jobs could not be changed.");
      const settingsResponse = await fetch("/api/settings", { cache: "no-store" });
      const settings = await settingsResponse.json();
      if (settingsResponse.ok) setData(settings as SettingsData);
      toast.success(action === "retry-dead" ? `${result.retried} failed job${result.retried === 1 ? "" : "s"} requeued` : `${result.summary.completed} job${result.summary.completed === 1 ? "" : "s"} completed`);
    } catch (error) {
      toast.error("Background job action failed", { description: error instanceof Error ? error.message : "Try again." });
    } finally {
      setJobAction(null);
    }
  }

  if (loading) return <div className="grid min-h-[calc(100svh-4.25rem)] place-items-center"><LoaderCircle className="size-6 animate-spin text-blue-600" /></div>;
  if (!data) return <div className="p-8 text-sm text-muted-foreground">Workspace settings could not be loaded.</div>;

  return (
    <div className="admin-page">
      <div className="max-w-3xl"><p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-muted-foreground">Operational readiness</p><h1 className="admin-page-title">Workspace settings</h1><p className="admin-page-description">Manage the agency identity and see exactly which production services, access controls, and workflows are ready.</p></div>

      <div className="admin-metrics mt-7">{[{ label: "Readiness checks", value: `${readyChecks}/${totalChecks}`, detail: totalChecks === readyChecks ? "All configured" : `${totalChecks - readyChecks} need attention` }, { label: "Workspace roles", value: data.roles.length, detail: data.roles.map((role) => `${role.count} ${role.role}`).join(" · ") }, { label: "Audit activity", value: data.auditLogs.length, detail: "Latest recorded changes" }, { label: "Workspace created", value: new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(new Date(data.organization.createdAt)), detail: data.organization.slug }].map((metric) => <div key={metric.label} className="admin-metric-card"><p className="text-xs text-muted-foreground">{metric.label}</p><p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">{metric.value}</p><p className="mt-3 truncate text-[11px] text-muted-foreground">{metric.detail}</p></div>)}</div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[0.78fr_1.22fr]">
        <section className="admin-card rounded-2xl p-4 sm:p-6"><div className="flex items-center gap-2"><Settings2 className="size-4 text-blue-600" /><h2 className="text-sm font-semibold">Workspace identity</h2></div><form onSubmit={save} className="mt-5 space-y-4"><div className="space-y-2"><Label htmlFor="workspace-name">Agency name</Label><Input id="workspace-name" value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={160} disabled={!canEdit} required /></div><div className="space-y-2"><Label>Workspace slug</Label><Input value={data.organization.slug} disabled /><p className="text-[10px] text-muted-foreground">The stable workspace identifier is protected from accidental changes.</p></div>{canEdit && <Button type="submit" className="w-full sm:w-auto" disabled={saving || name.trim() === data.organization.name}>{saving ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}Save identity</Button>}</form><div className="mt-7 border-t pt-5"><p className="text-xs font-semibold">Personal delivery preferences</p><p className="mt-2 text-[11px] leading-5 text-muted-foreground">Email and in-app delivery are controlled per member.</p><Button nativeButton={false} render={<Link href="/app/inbox" />} variant="outline" size="sm" className="mt-3 w-full sm:w-auto">Notification preferences <ExternalLink className="size-3.5" /></Button></div></section>

        <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between"><div><h2 className="text-sm font-semibold">Service status</h2><p className="mt-1 text-[11px] text-muted-foreground">No secrets are displayed—only whether each dependency is configured.</p></div><Badge variant="outline" className={totalChecks === readyChecks ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"}>{totalChecks === readyChecks ? "Production ready" : "Action needed"}</Badge></div><div className="mt-5 grid gap-2 sm:grid-cols-2">{data.providers.map((provider) => <div key={provider.key} className="flex gap-3 rounded-xl border bg-muted/15 p-3.5"><span className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full ${provider.ready ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"}`}>{provider.ready ? <Check className="size-3.5" /> : <CircleAlert className="size-3.5" />}</span><div><p className="text-xs font-semibold">{provider.label}</p><p className="mt-1 text-[10px] leading-4 text-muted-foreground">{provider.detail}</p></div></div>)}</div><div className="mt-6 border-t pt-5"><div className="flex items-center gap-2"><ShieldCheck className="size-4 text-blue-600" /><h3 className="text-xs font-semibold">Security checks</h3></div><div className="mt-3 space-y-2">{data.security.map((check) => <div key={check.label} className="flex items-center gap-3 rounded-lg bg-muted/25 px-3 py-2.5"><span className={`size-2 rounded-full ${check.ready ? "bg-emerald-500" : "bg-orange-500"}`} /><div className="flex-1"><p className="text-[11px] font-semibold">{check.label}</p><p className="mt-0.5 text-[9px] text-muted-foreground">{check.detail}</p></div></div>)}</div></div></section>
      </div>

      <section className="admin-card mt-5 overflow-hidden rounded-2xl">
        <div className="flex flex-col gap-4 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-center gap-3"><span className={`grid size-10 place-items-center rounded-xl ${data.backgroundJobs.healthy ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"}`}><ServerCog className="size-4" /></span><div><h2 className="text-sm font-semibold">Background job health</h2><p className="mt-1 text-[11px] text-muted-foreground">Durable email delivery with retries, locking, and recovery.</p></div></div>
          <div className="admin-actions"><Button variant="outline" size="sm" disabled={!canEdit || Boolean(jobAction)} onClick={() => void manageJobs("run")}>{jobAction === "run" ? <LoaderCircle className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}Run now</Button><Button variant="outline" size="sm" disabled={!canEdit || !data.backgroundJobs.dead || Boolean(jobAction)} onClick={() => void manageJobs("retry-dead")}>{jobAction === "retry-dead" ? <LoaderCircle className="size-3.5 animate-spin" /> : <RefreshCcw className="size-3.5" />}Retry failed</Button></div>
        </div>
        <div className="grid gap-px bg-border min-[480px]:grid-cols-2 lg:grid-cols-6">{[
          { label: "Completed 24h", value: data.backgroundJobs.completed24h, tone: "text-emerald-700" },
          { label: "Queued", value: data.backgroundJobs.pending, tone: "text-blue-700" },
          { label: "Processing", value: data.backgroundJobs.processing, tone: "text-violet-700" },
          { label: "Delayed", value: data.backgroundJobs.backlogged, tone: data.backgroundJobs.backlogged ? "text-orange-700" : "text-foreground" },
          { label: "Stuck", value: data.backgroundJobs.stuck, tone: data.backgroundJobs.stuck ? "text-orange-700" : "text-foreground" },
          { label: "Failed", value: data.backgroundJobs.dead, tone: data.backgroundJobs.dead ? "text-rose-700" : "text-foreground" },
        ].map((item) => <div key={item.label} className="bg-white px-4 py-4"><p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{item.label}</p><p className={`mt-2 text-2xl font-semibold ${item.tone}`}>{item.value}</p></div>)}</div>
        <div className="px-4 py-4 sm:px-5"><div className="flex items-center gap-2"><Activity className="size-3.5 text-blue-600" /><h3 className="text-xs font-semibold">Recent execution</h3>{data.backgroundJobs.lastCompletedAt && <span className="ml-auto text-[9px] text-muted-foreground">Last completed {new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(data.backgroundJobs.lastCompletedAt))}</span>}</div><div className="mt-3 divide-y rounded-xl border">{data.backgroundJobs.recent.slice(0, 6).map((job) => <div key={job.id} className="grid gap-2 px-3 py-3 text-[11px] sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center"><div className="min-w-0"><p className="truncate font-semibold capitalize">{job.type.replaceAll("-", " ")}</p>{job.lastError && <p className="mt-1 truncate text-[9px] text-rose-600" title={job.lastError}>{job.lastError}</p>}</div><Badge variant="outline" className={job.status === "Completed" ? "bg-emerald-50 text-emerald-700" : job.status === "Dead" ? "bg-rose-50 text-rose-700" : job.status === "Processing" ? "bg-violet-50 text-violet-700" : "bg-blue-50 text-blue-700"}>{job.status}</Badge><span className="text-muted-foreground sm:text-right">Attempt {job.attempts}/{job.maxAttempts}</span></div>)}{!data.backgroundJobs.recent.length && <p className="px-4 py-8 text-center text-xs text-muted-foreground">No background jobs have been queued yet.</p>}</div></div>
      </section>

      <section className="admin-card mt-5 overflow-hidden rounded-2xl"><div className="border-b px-4 py-4 sm:px-5"><h2 className="text-sm font-semibold">Recent audit trail</h2><p className="mt-1 text-[11px] text-muted-foreground">Immutable operational actions recorded for this workspace.</p></div><div className="divide-y">{data.auditLogs.map((log) => <div key={log.id} className="grid gap-2 px-4 py-4 text-[11px] min-[480px]:grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[150px_1fr_130px] sm:items-center sm:px-5"><span className="font-semibold">{log.actor}</span><span className="text-muted-foreground">{log.action} · {log.resource}</span><time className="text-muted-foreground min-[480px]:text-right">{new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(log.createdAt))}</time></div>)}{!data.auditLogs.length && <p className="px-5 py-10 text-center text-xs text-muted-foreground">No audit events yet.</p>}</div></section>
    </div>
  );
}
