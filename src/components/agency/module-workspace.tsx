"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { Check, Edit3, Filter, LoaderCircle, MoreHorizontal, Plus, Search, Sparkles, Trash2, Upload } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { type CrudField, type CrudUiConfig, crudModuleConfigs } from "@/lib/crud-config";
import type { ModuleConfig } from "@/lib/module-config";
import { cn } from "@/lib/utils";

type CrudRecord = Record<string, unknown> & { id: string };
type RelationOption = { id: string; label: string };
type RelationOptions = Record<string, RelationOption[]>;

function recordLabel(resource: string, record: CrudRecord) {
  const value = record.company ?? record.name ?? record.title ?? record.number ?? record.description ?? record.email ?? record.id;
  const qualifier = resource === "leads" && record.name ? ` — ${record.name}` : "";
  return `${String(value)}${qualifier}`;
}

function inputDate(value: unknown) {
  if (!value) return "";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function formatCell(value: unknown, format?: "currency" | "date" | "percent" | "boolean", currency = "GBP") {
  if (value === null || value === undefined || value === "") return "—";
  if (format === "currency") return new Intl.NumberFormat("en-GB", { style: "currency", currency, maximumFractionDigits: 0 }).format(Number(value));
  if (format === "date") {
    const date = new Date(String(value));
    return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
  }
  if (format === "percent") return `${Number(value)}%`;
  if (format === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function FieldControl({ field, initial, relations }: { field: CrudField; initial?: CrudRecord; relations: RelationOptions }) {
  const id = `${field.key}-${initial?.id ?? "new"}`;
  const initialValue = initial?.[field.key];

  if (field.type === "textarea") {
    return <Textarea id={id} name={field.key} defaultValue={initialValue ? String(initialValue) : ""} required={field.required} placeholder={field.placeholder} className="min-h-24 resize-y" />;
  }

  if (field.type === "select" || field.type === "relation") {
    const relationOptions = field.relationResource ? relations[field.relationResource] ?? [] : [];
    const options = field.type === "relation" ? relationOptions.map((option) => ({ value: option.id, label: option.label })) : (field.options ?? []).map((option) => ({ value: option, label: option }));
    return (
      <select id={id} name={field.key} required={field.required} defaultValue={initialValue ? String(initialValue) : field.required ? options[0]?.value ?? "" : ""} className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition focus:border-ring focus:ring-[3px] focus:ring-ring/20">
        {!field.required && <option value="">None</option>}
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label htmlFor={id} className="flex h-9 cursor-pointer items-center gap-3 rounded-lg border border-input px-3 text-sm">
        <input id={id} name={field.key} type="checkbox" defaultChecked={initialValue === undefined ? true : Boolean(initialValue)} className="size-4 accent-blue-600" />
        <span>Active</span>
      </label>
    );
  }

  return (
    <Input
      id={id}
      name={field.key}
      type={field.type === "date" ? "date" : field.type}
      defaultValue={field.type === "date" ? inputDate(initialValue) : initialValue === null || initialValue === undefined ? "" : String(initialValue)}
      required={field.required}
      placeholder={field.placeholder}
      min={field.min}
      max={field.max}
      step={field.step}
    />
  );
}

function RecordDialog({ crud, initial, relations, onSaved, trigger }: { crud: CrudUiConfig; initial?: CrudRecord; relations: RelationOptions; onSaved: (record: CrudRecord) => void; trigger: React.ReactElement }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const formId = useId();
  const editing = Boolean(initial);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const form = new FormData(event.currentTarget);
    const data: Record<string, unknown> = {};
    for (const field of crud.fields) {
      const value = form.get(field.key);
      if (field.type === "checkbox") data[field.key] = value === "on";
      else if (field.type === "number" && value !== "") data[field.key] = Number(value);
      else data[field.key] = value ?? "";
    }

    try {
      const response = await fetch(`/api/crud/${crud.resource}`, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: initial?.id, data }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? `Unable to save ${crud.singular}`);
      onSaved(result.record as CrudRecord);
      setOpen(false);
      toast.success(editing ? `${crud.singular} updated` : `${crud.singular} created`);
    } catch (error) {
      toast.error(`Could not save ${crud.singular}`, { description: error instanceof Error ? error.message : "Try again." });
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? `Edit ${crud.singular}` : `Create ${crud.singular}`}</DialogTitle>
          <DialogDescription>{editing ? "Update the record and keep the workspace source of truth current." : "Add a live record to this agency workspace."}</DialogDescription>
        </DialogHeader>
        <form id={formId} onSubmit={submit} className="grid gap-4 py-2 sm:grid-cols-2">
          {crud.fields.map((field) => (
            <div key={field.key} className={cn("space-y-2", field.type === "textarea" && "sm:col-span-2")}>
              <Label htmlFor={`${field.key}-${initial?.id ?? "new"}`}>{field.label}{field.required && <span className="ml-1 text-destructive">*</span>}</Label>
              <FieldControl field={field} initial={initial} relations={relations} />
            </div>
          ))}
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" form={formId} disabled={pending}>{pending ? <><LoaderCircle className="size-4 animate-spin" /> Saving…</> : <><Check className="size-4" /> {editing ? "Save changes" : `Create ${crud.singular}`}</>}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ModuleWorkspace({ moduleKey, config }: { moduleKey: string; config: ModuleConfig }) {
  const crud = crudModuleConfigs[moduleKey];
  const [query, setQuery] = useState("");
  const [records, setRecords] = useState<CrudRecord[]>([]);
  const [relations, setRelations] = useState<RelationOptions>({});
  const [loading, setLoading] = useState(Boolean(crud));

  useEffect(() => {
    if (!crud) return;
    let active = true;
    const resources = Array.from(new Set(crud.fields.map((field) => field.relationResource).filter((resource): resource is string => Boolean(resource))));

    async function load() {
      setLoading(true);
      try {
        const [recordResponse, ...relationResponses] = await Promise.all([
          fetch(`/api/crud/${crud!.resource}`),
          ...resources.map((resource) => fetch(`/api/crud/${resource}`)),
        ]);
        if (!recordResponse.ok) throw new Error("Could not load this workspace.");
        const recordResult = await recordResponse.json();
        const relationResults = await Promise.all(relationResponses.map(async (response) => response.ok ? response.json() : { records: [] }));
        if (!active) return;
        setRecords(recordResult.records as CrudRecord[]);
        setRelations(Object.fromEntries(resources.map((resource, index) => [resource, (relationResults[index].records as CrudRecord[]).map((record) => ({ id: record.id, label: recordLabel(resource, record) }))])));
      } catch (error) {
        if (active) toast.error("Live records unavailable", { description: error instanceof Error ? error.message : "Refresh and try again." });
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => { active = false; };
  }, [crud]);

  const filteredRecords = useMemo(() => records.filter((record) => Object.values(record).join(" ").toLowerCase().includes(query.toLowerCase())), [query, records]);
  const filteredRows = useMemo(() => config.rows.filter((row) => Object.values(row).join(" ").toLowerCase().includes(query.toLowerCase())), [config.rows, query]);

  function saveRecord(record: CrudRecord) {
    setRecords((current) => current.some((item) => item.id === record.id) ? current.map((item) => item.id === record.id ? record : item) : [record, ...current]);
  }

  async function deleteRecord(record: CrudRecord) {
    if (!crud || !window.confirm(`Delete this ${crud.singular}? This action cannot be undone.`)) return;
    try {
      const response = await fetch(`/api/crud/${crud.resource}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: record.id }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Unable to delete record");
      setRecords((current) => current.filter((item) => item.id !== record.id));
      toast.success(`${crud.singular} deleted`);
    } catch (error) {
      toast.error(`Could not delete ${crud.singular}`, { description: error instanceof Error ? error.message : "Try again." });
    }
  }

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2"><p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-muted-foreground">{config.eyebrow}</p>{crud && <Badge variant="outline" className="rounded-full bg-emerald-50 text-[8px] font-semibold text-emerald-700">Live CRUD</Badge>}</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">{config.title}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{config.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-9 bg-white" onClick={() => toast.success("Import template ready", { description: "Map your CSV columns before creating records." })}><Upload className="size-4" /> Import</Button>
          {crud ? <RecordDialog crud={crud} relations={relations} onSaved={saveRecord} trigger={<Button className="h-9"><Plus className="size-4" /> Create {crud.singular}</Button>} /> : <Button className="h-9" onClick={() => toast.success(`${config.action} flow opened`)}><Plus className="size-4" /> {config.action}</Button>}
        </div>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {config.metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl border bg-white p-5 shadow-[0_12px_30px_rgba(35,42,50,0.035)]">
            <p className="text-xs font-medium text-muted-foreground">{metric.label}</p><p className="mt-3 text-2xl font-semibold tracking-[-0.045em]">{metric.value}</p><p className={cn("mt-3 text-[11px] text-muted-foreground", metric.tone === "positive" && "text-emerald-700", metric.tone === "warning" && "text-orange-700")}>{metric.detail}</p>
          </div>
        ))}
      </div>

      <section className="mt-5 overflow-hidden rounded-2xl border bg-white shadow-[0_12px_30px_rgba(35,42,50,0.035)]">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs"><Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search this workspace…" className="h-8.5 bg-muted/45 pl-9 text-xs" /></div>
          <div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={() => toast.info("Type in search to filter all record fields.")}><Filter className="size-3.5" /> Filter</Button><Button variant="ghost" size="icon-sm"><MoreHorizontal /></Button></div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {(crud?.columns ?? config.columns.map((label) => ({ key: label, label }))).map((column) => <TableHead key={column.key} className="h-10 whitespace-nowrap bg-muted/25 px-4 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{column.label}</TableHead>)}
                {crud && <TableHead className="sticky right-0 h-10 w-24 bg-muted/80 px-4 text-right text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && <TableRow><TableCell colSpan={(crud?.columns.length ?? config.columns.length) + 1} className="h-32 text-center"><LoaderCircle className="mx-auto size-5 animate-spin text-blue-600" /><p className="mt-2 text-xs text-muted-foreground">Loading live records…</p></TableCell></TableRow>}
              {!loading && crud && filteredRecords.map((record) => (
                <TableRow key={record.id} className="h-14 hover:bg-muted/25">
                  {crud.columns.map((column, cellIndex) => {
                    const value = formatCell(record[column.key], column.format, typeof record.currency === "string" ? record.currency : "GBP");
                    return <TableCell key={column.key} className={cn("max-w-72 truncate whitespace-nowrap px-4 text-xs text-muted-foreground", cellIndex === 0 && "font-semibold text-foreground")}>{["status", "stage", "priority"].includes(column.key) ? <Badge variant="outline" className="rounded-full bg-muted/45 text-[9px] font-semibold">{value}</Badge> : value}</TableCell>;
                  })}
                  <TableCell className="sticky right-0 bg-white px-3"><div className="flex justify-end gap-1"><RecordDialog crud={crud} initial={record} relations={relations} onSaved={saveRecord} trigger={<Button variant="ghost" size="icon-sm" aria-label={`Edit ${crud.singular}`}><Edit3 className="size-3.5" /></Button>} /><Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:bg-rose-50 hover:text-rose-600" onClick={() => void deleteRecord(record)} aria-label={`Delete ${crud.singular}`}><Trash2 className="size-3.5" /></Button></div></TableCell>
                </TableRow>
              ))}
              {!loading && crud && filteredRecords.length === 0 && <TableRow><TableCell colSpan={crud.columns.length + 1} className="h-32 text-center text-xs text-muted-foreground">No records found. Create the first {crud.singular} to get started.</TableCell></TableRow>}
              {!crud && filteredRows.map((row, index) => (
                <TableRow key={`${Object.values(row)[0]}-${index}`} className="h-14 hover:bg-muted/25">{config.columns.map((column, cellIndex) => <TableCell key={column} className={cn("whitespace-nowrap px-4 text-xs text-muted-foreground", cellIndex === 0 && "font-semibold text-foreground")}>{column === "Status" || column === "Stage" || column === "Priority" ? <Badge variant="outline" className="rounded-full bg-muted/45 text-[9px] font-semibold">{row[column]}</Badge> : row[column]}</TableCell>)}</TableRow>
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
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-accent"><Sparkles className="size-3.5" />M&amp;W signal</div><p className="mt-4 text-sm leading-6 text-white/70">{config.insight}</p><Button variant="ghost" className="mt-4 h-8 bg-white/6 text-[11px] text-white hover:bg-white/10 hover:text-white">Ask a follow-up</Button>
        </section>
      </div>
    </div>
  );
}
