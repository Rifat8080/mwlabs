import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BrainCircuit,
  CalendarClock,
  Check,
  CircleAlert,
  CircleDollarSign,
  MoreHorizontal,
  Plus,
  Sparkles,
  TrendingUp,
  UsersRound,
  WalletCards,
} from "lucide-react";

import { RevenueChart } from "@/components/agency/revenue-chart";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type DashboardData = {
  metrics: {
    weightedPipeline: number;
    paidRevenue: number;
    receivables: number;
    grossMargin: number;
    activeClients: number;
    activeProjects: number;
  };
  pipelineByStage: { stage: string; count: number; value: number }[];
  projects: {
    id: string;
    name: string;
    code: string;
    status: string;
    progress: number;
    budget: number;
    spent: number;
    dueDate: string | null;
    client: { company: string };
  }[];
  tasks: {
    id: string;
    title: string;
    priority: string;
    status: string;
    dueDate: string | null;
    project: { code: string } | null;
  }[];
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function MetricCard({
  label,
  value,
  detail,
  trend,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  trend: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-[0_12px_30px_rgba(35,42,50,0.035)]">
      <div className="flex items-start justify-between">
        <div><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold tracking-[-0.045em]">{value}</p></div>
        <span className="grid size-8 place-items-center rounded-lg bg-muted"><Icon className="size-4 text-muted-foreground" /></span>
      </div>
      <div className="mt-4 flex items-center justify-between text-[11px]"><span className="text-muted-foreground">{detail}</span><span className="flex items-center gap-1 font-semibold text-emerald-700"><TrendingUp className="size-3" />{trend}</span></div>
    </div>
  );
}

export function Dashboard({ data, firstName }: { data: DashboardData; firstName: string }) {
  const { metrics } = data;

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground"><span className="size-1.5 rounded-full bg-emerald-500" />Thursday, 06 August</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">Good morning, {firstName}.</h1>
          <p className="mt-2 text-sm text-muted-foreground">Here&apos;s the shape of the agency and where your attention has the most leverage.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-9 bg-white"><CalendarClock className="size-4" /> This week</Button>
          <Button render={<Link href="/app/leads" />} className="h-9"><Plus className="size-4" /> New lead</Button>
        </div>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Weighted pipeline" value={money.format(metrics.weightedPipeline)} detail={`${data.pipelineByStage.reduce((sum, item) => sum + item.count, 0)} open opportunities`} trend="12.4%" icon={WalletCards} />
        <MetricCard label="Revenue collected" value={money.format(metrics.paidRevenue)} detail="Current operating period" trend="8.1%" icon={CircleDollarSign} />
        <MetricCard label="Gross margin" value={`${metrics.grossMargin.toFixed(1)}%`} detail="Target 55%" trend="2.8%" icon={TrendingUp} />
        <MetricCard label="Active relationships" value={`${metrics.activeClients}`} detail={`${metrics.activeProjects} projects in flight`} trend="4.0%" icon={UsersRound} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.55fr_0.85fr]">
        <section className="rounded-2xl border bg-white p-5 shadow-[0_12px_30px_rgba(35,42,50,0.035)] sm:p-6">
          <div className="flex items-start justify-between">
            <div><p className="text-sm font-semibold">Revenue pulse</p><p className="mt-1 text-xs text-muted-foreground">Collected revenue vs operating target</p></div>
            <Button variant="ghost" size="icon-sm"><MoreHorizontal /></Button>
          </div>
          <div className="mt-4"><RevenueChart /></div>
          <div className="mt-1 flex flex-wrap gap-5 border-t pt-4 text-[11px] text-muted-foreground"><span className="flex items-center gap-2"><span className="size-2 rounded-full bg-foreground" />Actual revenue</span><span className="flex items-center gap-2"><span className="size-2 rounded-full bg-muted-foreground/35" />Target</span><span className="ml-auto font-semibold text-foreground">Receivables {money.format(metrics.receivables)}</span></div>
        </section>

        <section className="relative overflow-hidden rounded-2xl bg-brand-navy p-6 text-white shadow-[0_18px_45px_rgba(21,93,252,0.18)]">
          <div className="absolute -right-16 -top-16 size-52 rounded-full border border-accent/20"><div className="absolute inset-9 rounded-full border border-white/8" /></div>
          <div className="relative">
            <div className="flex items-center justify-between"><span className="grid size-9 place-items-center rounded-xl bg-accent text-accent-foreground"><BrainCircuit className="size-4" /></span><Badge className="border-0 bg-white/8 text-[9px] uppercase tracking-[0.13em] text-white/50">Live brief</Badge></div>
            <h2 className="mt-6 text-xl font-semibold tracking-[-0.03em]">Three signals worth your attention.</h2>
            <div className="mt-5 space-y-3">
              <Link href="/app/leads" className="flex gap-3 rounded-xl border border-white/8 bg-white/[0.035] p-3.5 transition hover:bg-white/8"><span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg bg-accent/15 text-accent"><Sparkles className="size-3" /></span><div><p className="text-xs font-semibold">Proposal momentum</p><p className="mt-1 text-[11px] leading-5 text-white/45">Follow up with Vela today to protect a $28k opportunity.</p></div></Link>
              <Link href="/app/projects" className="flex gap-3 rounded-xl border border-white/8 bg-white/[0.035] p-3.5 transition hover:bg-white/8"><span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg bg-orange-400/12 text-orange-300"><CircleAlert className="size-3" /></span><div><p className="text-xs font-semibold">Margin watch</p><p className="mt-1 text-[11px] leading-5 text-white/45">Halcyon is at 88% budget with four tasks still open.</p></div></Link>
              <Link href="/app/finance" className="flex gap-3 rounded-xl border border-white/8 bg-white/[0.035] p-3.5 transition hover:bg-white/8"><span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg bg-sky-400/12 text-sky-300"><CircleDollarSign className="size-3" /></span><div><p className="text-xs font-semibold">Cash visibility</p><p className="mt-1 text-[11px] leading-5 text-white/45">{money.format(metrics.receivables)} is due within the next payment window.</p></div></Link>
            </div>
            <Button render={<Link href="/app/ai" />} className="mt-5 h-9 w-full bg-accent text-xs text-accent-foreground hover:bg-accent/90">Open command brief <ArrowRight className="size-3.5" /></Button>
          </div>
        </section>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border bg-white shadow-[0_12px_30px_rgba(35,42,50,0.035)]">
          <div className="flex items-center justify-between border-b px-5 py-4"><div><h2 className="text-sm font-semibold">Projects in motion</h2><p className="mt-0.5 text-[11px] text-muted-foreground">Budget, progress, and next deadline</p></div><Button render={<Link href="/app/projects" />} variant="ghost" className="text-xs">View all <ArrowUpRight className="size-3.5" /></Button></div>
          <div className="divide-y">
            {data.projects.map((project, index) => {
              const burn = project.budget ? (project.spent / project.budget) * 100 : 0;
              return (
                <div key={project.id} className="grid gap-4 px-5 py-4 sm:grid-cols-[1fr_120px_100px] sm:items-center">
                  <div className="flex items-center gap-3"><Avatar className="size-9 rounded-xl"><AvatarFallback className={cn("rounded-xl text-[10px] font-semibold", ["bg-blue-100 text-blue-800", "bg-cyan-100 text-cyan-800", "bg-brand-navy text-blue-50"][index % 3])}>{project.client.company.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar><div><p className="text-sm font-semibold">{project.name}</p><p className="mt-0.5 text-[10px] text-muted-foreground">{project.client.company} · {project.code}</p></div></div>
                  <div><div className="mb-1.5 flex justify-between text-[10px]"><span className="text-muted-foreground">Progress</span><span className="font-semibold">{project.progress}%</span></div><Progress value={project.progress} /></div>
                  <div className="text-left sm:text-right"><p className={cn("text-xs font-semibold", burn > 85 && "text-orange-700")}>{burn.toFixed(0)}% burn</p><p className="mt-1 text-[10px] text-muted-foreground">{money.format(project.spent)} spent</p></div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border bg-white shadow-[0_12px_30px_rgba(35,42,50,0.035)]">
          <div className="flex items-center justify-between border-b px-5 py-4"><div><h2 className="text-sm font-semibold">Today&apos;s focus</h2><p className="mt-0.5 text-[11px] text-muted-foreground">Open commitments across your team</p></div><Button render={<Link href="/app/tasks" />} variant="ghost" className="text-xs">All tasks <ArrowUpRight className="size-3.5" /></Button></div>
          <div className="divide-y px-5">
            {data.tasks.map((task) => (
              <div key={task.id} className="flex items-start gap-3 py-3.5"><button className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border hover:border-accent hover:bg-accent"><Check className="size-3 opacity-0 hover:opacity-100" /></button><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium">{task.title}</p><div className="mt-1.5 flex items-center gap-2 text-[10px] text-muted-foreground"><span>{task.project?.code ?? "OPS"}</span><span>·</span><span>{task.status}</span></div></div><span className={cn("rounded-full px-2 py-1 text-[9px] font-semibold", task.priority === "High" ? "bg-red-50 text-red-700" : task.priority === "Medium" ? "bg-orange-50 text-orange-700" : "bg-muted text-muted-foreground")}>{task.priority}</span></div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-5 rounded-2xl border bg-white p-5 shadow-[0_12px_30px_rgba(35,42,50,0.035)]">
        <div className="flex items-center justify-between"><div><h2 className="text-sm font-semibold">Pipeline movement</h2><p className="mt-0.5 text-[11px] text-muted-foreground">Value and deal count by commercial stage</p></div><Button render={<Link href="/app/leads" />} variant="ghost" className="text-xs">Open CRM <ArrowUpRight className="size-3.5" /></Button></div>
        <div className="mt-5 grid gap-2 sm:grid-cols-5">
          {data.pipelineByStage.map((stage, index) => (
            <div key={stage.stage} className="rounded-xl border bg-muted/25 p-3.5"><div className="flex items-center justify-between"><span className="font-mono text-[9px] text-muted-foreground">0{index + 1}</span><span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-semibold shadow-sm">{stage.count}</span></div><p className="mt-4 text-xs font-semibold">{stage.stage}</p><p className="mt-1 text-lg font-semibold tracking-[-0.03em]">{money.format(stage.value)}</p><div className="mt-3 h-1 rounded-full bg-blue-100"><div className="h-full rounded-full bg-[linear-gradient(90deg,#155dfc,#02d1fa)]" style={{ width: `${Math.min(100, 24 + index * 16)}%` }} /></div></div>
          ))}
        </div>
      </section>
    </div>
  );
}
