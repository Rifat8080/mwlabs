"use client";

import { useMemo, useState } from "react";
import { Filter, MoreHorizontal, Plus, Search, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ModuleConfig } from "@/lib/module-config";
import { cn } from "@/lib/utils";

function LeadDialog({ onCreated }: { onCreated: (row: Record<string, string>) => void }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Unable to create lead");
      onCreated({
        Opportunity: result.lead.company,
        Stage: result.lead.stage,
        Value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(result.lead.value),
        Score: String(result.lead.score),
        Owner: result.lead.ownerName ?? "Unassigned",
        "Next step": "Qualify lead",
      });
      setOpen(false);
      toast.success("Lead added to pipeline");
    } catch (error) {
      toast.error("Could not add lead", { description: error instanceof Error ? error.message : "Try again." });
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="h-9" />}><Plus className="size-4" /> Add lead</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Add a lead</DialogTitle><DialogDescription>Capture the commercial signal now; qualify it with your team next.</DialogDescription></DialogHeader>
        <form onSubmit={submit} id="lead-form" className="grid gap-4 py-2 sm:grid-cols-2">
          <div className="space-y-2"><Label htmlFor="lead-name">Contact name</Label><Input id="lead-name" name="name" required placeholder="Elena Rossi" /></div>
          <div className="space-y-2"><Label htmlFor="lead-company">Company</Label><Input id="lead-company" name="company" required placeholder="Vela Systems" /></div>
          <div className="space-y-2 sm:col-span-2"><Label htmlFor="lead-email">Email</Label><Input id="lead-email" name="email" type="email" required placeholder="elena@vela.io" /></div>
          <div className="space-y-2"><Label htmlFor="lead-value">Estimated value</Label><Input id="lead-value" name="value" type="number" min="0" step="100" defaultValue="10000" required /></div>
          <div className="space-y-2"><Label htmlFor="lead-source">Source</Label><Input id="lead-source" name="source" defaultValue="Website" required /></div>
        </form>
        <DialogFooter><Button type="submit" form="lead-form" disabled={pending}>{pending ? "Adding…" : "Add to pipeline"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ModuleWorkspace({ moduleKey, config }: { moduleKey: string; config: ModuleConfig }) {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState(config.rows);
  const filteredRows = useMemo(
    () => rows.filter((row) => Object.values(row).join(" ").toLowerCase().includes(query.toLowerCase())),
    [query, rows],
  );

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-muted-foreground">{config.eyebrow}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">{config.title}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{config.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-9 bg-white" onClick={() => toast.success("Import template ready", { description: "Map your CSV columns before creating records." })}><Upload className="size-4" /> Import</Button>
          {moduleKey === "leads" ? <LeadDialog onCreated={(row) => setRows((current) => [row, ...current])} /> : <Button className="h-9" onClick={() => toast.success(`${config.action} flow opened`, { description: "The workflow is ready for your data." })}><Plus className="size-4" /> {config.action}</Button>}
        </div>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {config.metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl border bg-white p-5 shadow-[0_12px_30px_rgba(35,42,50,0.035)]">
            <p className="text-xs font-medium text-muted-foreground">{metric.label}</p>
            <p className="mt-3 text-2xl font-semibold tracking-[-0.045em]">{metric.value}</p>
            <p className={cn("mt-3 text-[11px] text-muted-foreground", metric.tone === "positive" && "text-emerald-700", metric.tone === "warning" && "text-orange-700")}>{metric.detail}</p>
          </div>
        ))}
      </div>

      <section className="mt-5 overflow-hidden rounded-2xl border bg-white shadow-[0_12px_30px_rgba(35,42,50,0.035)]">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs"><Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search this workspace…" className="h-8.5 bg-muted/45 pl-9 text-xs" /></div>
          <div className="flex items-center gap-2"><Button variant="outline" size="sm"><Filter className="size-3.5" /> Filter</Button><Button variant="ghost" size="icon-sm"><MoreHorizontal /></Button></div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow>{config.columns.map((column) => <TableHead key={column} className="h-10 whitespace-nowrap bg-muted/25 px-4 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{column}</TableHead>)}</TableRow></TableHeader>
            <TableBody>
              {filteredRows.map((row, index) => (
                <TableRow key={`${Object.values(row)[0]}-${index}`} className="h-14 hover:bg-muted/25">
                  {config.columns.map((column, cellIndex) => (
                    <TableCell key={column} className={cn("whitespace-nowrap px-4 text-xs text-muted-foreground", cellIndex === 0 && "font-semibold text-foreground")}>
                      {column === "Status" || column === "Stage" || column === "Priority" ? <Badge variant="outline" className="rounded-full bg-muted/45 text-[9px] font-semibold">{row[column]}</Badge> : row[column]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.72fr]">
        <section className="rounded-2xl border bg-white p-5 shadow-[0_12px_30px_rgba(35,42,50,0.035)]">
          <div className="flex items-center justify-between"><div><h2 className="text-sm font-semibold">Operating workflow</h2><p className="mt-1 text-[11px] text-muted-foreground">The complete lifecycle, visible to everyone responsible.</p></div><Badge variant="outline" className="text-[9px]">Configured</Badge></div>
          <div className="mt-5 grid gap-2 sm:grid-cols-3 xl:grid-cols-6">{config.workflow.map((step, index) => <div key={step} className="relative rounded-xl bg-muted/45 p-3"><span className="font-mono text-[9px] text-muted-foreground">0{index + 1}</span><p className="mt-4 text-[11px] font-semibold leading-4">{step}</p>{index < config.workflow.length - 1 && <span className="absolute -right-2 top-1/2 z-10 hidden h-px w-2 bg-border xl:block" />}</div>)}</div>
        </section>
        <section className="relative overflow-hidden rounded-2xl bg-brand-navy p-5 text-white shadow-[0_18px_45px_rgba(21,93,252,0.16)]">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-accent"><Sparkles className="size-3.5" />M&amp;W signal</div>
          <p className="mt-4 text-sm leading-6 text-white/70">{config.insight}</p>
          <Button variant="ghost" className="mt-4 h-8 bg-white/6 text-[11px] text-white hover:bg-white/10 hover:text-white">Ask a follow-up</Button>
        </section>
      </div>
    </div>
  );
}
