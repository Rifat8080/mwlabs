import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export function hasTrustedMutationOrigin(request: Request) {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return true;
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;

  const origin = request.headers.get("origin");
  if (!origin) return false;

  const trustedOrigins = new Set([new URL(request.url).origin]);
  if (process.env.BETTER_AUTH_URL) {
    try {
      trustedOrigins.add(new URL(process.env.BETTER_AUTH_URL).origin);
    } catch {
      return false;
    }
  }

  return trustedOrigins.has(origin);
}

export const verifySession = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) redirect("/sign-in");

  return {
    userId: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    activeOrganizationId: session.session.activeOrganizationId,
  };
});

export const getWorkspaceContext = cache(async () => {
  const session = await verifySession();

  const membership = await db.member.findFirst({
    where: session.activeOrganizationId
      ? {
          userId: session.userId,
          organizationId: session.activeOrganizationId,
        }
      : { userId: session.userId },
    select: {
      role: true,
      organization: { select: { id: true, name: true, slug: true } },
    },
  });

  if (!membership) redirect("/portal");

  return {
    user: {
      id: session.userId,
      name: session.name,
      email: session.email,
      image: session.image,
    },
    organization: membership.organization,
    role: membership.role,
  };
});

export async function requireApiSession(request: Request) {
  if (!hasTrustedMutationOrigin(request)) return null;

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) return null;

  const membership = await db.member.findFirst({
    where: session.session.activeOrganizationId
      ? {
          userId: session.user.id,
          organizationId: session.session.activeOrganizationId,
        }
      : { userId: session.user.id },
    select: { organizationId: true, role: true },
  });

  if (!membership) return null;
  return {
    userId: session.user.id,
    organizationId: membership.organizationId,
    role: membership.role,
  };
}

export const getDashboardData = cache(async () => {
  const { organization } = await getWorkspaceContext();
  const organizationId = organization.id;

  const [leads, clients, activeProjects, projects, tasks, invoices, expenses] = await Promise.all([
    db.lead.findMany({
      where: { organizationId },
      select: { id: true, company: true, stage: true, value: true, probability: true, nextActivityAt: true },
    }),
    db.client.count({ where: { organizationId, status: "Active" } }),
    db.project.count({ where: { organizationId, status: { notIn: ["Complete", "Archived"] } } }),
    db.project.findMany({
      where: { organizationId, status: { notIn: ["Complete", "Archived"] } },
      orderBy: { dueDate: "asc" },
      take: 4,
      select: {
        id: true,
        name: true,
        code: true,
        status: true,
        progress: true,
        budget: true,
        spent: true,
        dueDate: true,
        client: { select: { company: true } },
      },
    }),
    db.task.findMany({
      where: { organizationId, status: { not: "Done" } },
      orderBy: [{ dueDate: "asc" }, { priority: "asc" }],
      take: 5,
      select: {
        id: true,
        title: true,
        priority: true,
        status: true,
        dueDate: true,
        project: { select: { code: true } },
      },
    }),
    db.invoice.findMany({
      where: { organizationId },
      select: { status: true, total: true, paidAt: true },
    }),
    db.expense.findMany({
      where: { organizationId },
      select: { amount: true },
    }),
  ]);

  const weightedPipeline = leads.reduce(
    (total, lead) => total + Number(lead.value) * (lead.probability / 100),
    0,
  );
  const paidRevenue = invoices
    .filter((invoice) => invoice.status === "Paid")
    .reduce((total, invoice) => total + Number(invoice.total), 0);
  const receivables = invoices
    .filter((invoice) => ["Sent", "Overdue"].includes(invoice.status))
    .reduce((total, invoice) => total + Number(invoice.total), 0);
  const operatingCosts = expenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0,
  );
  const grossMargin = paidRevenue
    ? Math.max(0, ((paidRevenue - operatingCosts) / paidRevenue) * 100)
    : 0;

  const pipelineByStage = ["New", "Qualified", "Discovery", "Proposal", "Negotiation"].map((stage) => ({
    stage,
    count: leads.filter((lead) => lead.stage === stage).length,
    value: leads
      .filter((lead) => lead.stage === stage)
      .reduce((total, lead) => total + Number(lead.value), 0),
  }));

  const now = new Date();
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5 + index, 1));
    return { key: `${date.getUTCFullYear()}-${date.getUTCMonth()}`, month: new Intl.DateTimeFormat("en", { month: "short" }).format(date), revenue: 0 };
  });
  const monthMap = new Map(months.map((month) => [month.key, month]));
  invoices.filter((invoice) => invoice.status === "Paid" && invoice.paidAt).forEach((invoice) => {
    const paidAt = invoice.paidAt!;
    const month = monthMap.get(`${paidAt.getUTCFullYear()}-${paidAt.getUTCMonth()}`);
    if (month) month.revenue += Number(invoice.total);
  });
  const maxRevenue = Math.max(1, ...months.map((month) => month.revenue));
  const topLead = leads.filter((lead) => !["Won", "Lost"].includes(lead.stage)).sort((a, b) => Number(b.value) * b.probability - Number(a.value) * a.probability)[0] ?? null;
  const riskyProject = [...projects].sort((a, b) => {
    const aVariance = (Number(a.budget) ? Number(a.spent) / Number(a.budget) * 100 : 0) - a.progress;
    const bVariance = (Number(b.budget) ? Number(b.spent) / Number(b.budget) * 100 : 0) - b.progress;
    return bVariance - aVariance;
  })[0] ?? null;

  return {
    asOf: now.toISOString(),
    metrics: {
      weightedPipeline,
      paidRevenue,
      receivables,
      grossMargin,
      activeClients: clients,
      activeProjects,
    },
    revenueSeries: months.map((month) => ({ month: month.month, revenue: month.revenue / 1_000, target: maxRevenue / 1_000 })),
    signals: [
      topLead ? { title: "Highest-value next move", message: `${topLead.company} carries ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(topLead.value))} at ${topLead.probability}% probability.`, href: "/app/leads", tone: "accent" } : { title: "Pipeline ready", message: "Add and qualify leads to generate a revenue priority.", href: "/app/leads", tone: "accent" },
      riskyProject ? { title: "Delivery watch", message: `${riskyProject.client.company} / ${riskyProject.name} is at ${riskyProject.progress}% progress and ${Number(riskyProject.budget) ? Math.round(Number(riskyProject.spent) / Number(riskyProject.budget) * 100) : 0}% budget burn.`, href: "/app/projects", tone: "warning" } : { title: "Delivery ready", message: "No active project evidence is available yet.", href: "/app/projects", tone: "warning" },
      { title: "Cash visibility", message: `${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(receivables)} is currently sent or overdue.`, href: "/app/finance", tone: "cash" },
    ],
    pipelineByStage,
    projects: projects.map((project) => ({
      ...project,
      budget: Number(project.budget),
      spent: Number(project.spent),
      dueDate: project.dueDate?.toISOString() ?? null,
    })),
    tasks: tasks.map((task) => ({
      ...task,
      dueDate: task.dueDate?.toISOString() ?? null,
    })),
  };
});

export const getReportsData = cache(async () => {
  const { organization } = await getWorkspaceContext();
  const organizationId = organization.id;
  const now = new Date();
  const sixMonthsAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));

  const [leads, projects, invoices, expenses, retainers, timeEntries, clients] = await Promise.all([
    db.lead.findMany({ where: { organizationId }, select: { stage: true, value: true, probability: true } }),
    db.project.findMany({ where: { organizationId, status: { notIn: ["Complete", "Archived"] } }, select: { id: true, name: true, progress: true, budget: true, spent: true, dueDate: true, client: { select: { company: true } } } }),
    db.invoice.findMany({ where: { organizationId }, select: { status: true, total: true, paidAt: true, dueDate: true, clientId: true, client: { select: { company: true } } } }),
    db.expense.findMany({ where: { organizationId, incurredAt: { gte: sixMonthsAgo } }, select: { amount: true, incurredAt: true } }),
    db.retainer.findMany({ where: { organizationId, status: "Active" }, select: { monthlyValue: true } }),
    db.timeEntry.findMany({ where: { project: { organizationId }, date: { gte: sixMonthsAgo } }, select: { minutes: true, billable: true } }),
    db.client.findMany({ where: { organizationId }, select: { id: true, status: true, healthScore: true } }),
  ]);

  const paid = invoices.filter((invoice) => invoice.status === "Paid");
  const paidRevenue = paid.reduce((sum, invoice) => sum + Number(invoice.total), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const weightedPipeline = leads.filter((lead) => !["Won", "Lost"].includes(lead.stage)).reduce((sum, lead) => sum + Number(lead.value) * lead.probability / 100, 0);
  const recurringRevenue = retainers.reduce((sum, retainer) => sum + Number(retainer.monthlyValue), 0);
  const loggedMinutes = timeEntries.reduce((sum, entry) => sum + entry.minutes, 0);
  const billableMinutes = timeEntries.filter((entry) => entry.billable).reduce((sum, entry) => sum + entry.minutes, 0);
  const byClient = new Map<string, { company: string; value: number }>();
  paid.forEach((invoice) => {
    const current = byClient.get(invoice.clientId) ?? { company: invoice.client.company, value: 0 };
    current.value += Number(invoice.total);
    byClient.set(invoice.clientId, current);
  });
  const topClient = Array.from(byClient.values()).sort((a, b) => b.value - a.value)[0] ?? null;
  const projectRisks = projects.filter((project) => {
    const burn = Number(project.budget) ? Number(project.spent) / Number(project.budget) * 100 : 0;
    return burn > project.progress + 15 || Boolean(project.dueDate && project.dueDate < now);
  }).map((project) => ({
    id: project.id,
    name: project.name,
    client: project.client.company,
    progress: project.progress,
    burn: Number(project.budget) ? Number(project.spent) / Number(project.budget) * 100 : 0,
    dueDate: project.dueDate?.toISOString() ?? null,
  }));

  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5 + index, 1));
    const key = `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
    return { key, label: new Intl.DateTimeFormat("en", { month: "short" }).format(date), revenue: 0, expenses: 0 };
  });
  const monthMap = new Map(months.map((month) => [month.key, month]));
  paid.forEach((invoice) => {
    if (!invoice.paidAt) return;
    const month = monthMap.get(`${invoice.paidAt.getUTCFullYear()}-${invoice.paidAt.getUTCMonth()}`);
    if (month) month.revenue += Number(invoice.total);
  });
  expenses.forEach((expense) => {
    const month = monthMap.get(`${expense.incurredAt.getUTCFullYear()}-${expense.incurredAt.getUTCMonth()}`);
    if (month) month.expenses += Number(expense.amount);
  });

  return {
    metrics: {
      forecast60Days: weightedPipeline + recurringRevenue * 2,
      forecastConfidence: leads.length ? leads.reduce((sum, lead) => sum + lead.probability, 0) / leads.length : 0,
      utilization: loggedMinutes ? billableMinutes / loggedMinutes * 100 : 0,
      revenueConcentration: paidRevenue && topClient ? topClient.value / paidRevenue * 100 : 0,
      paidRevenue,
      operatingCosts: totalExpenses,
      grossMargin: paidRevenue ? (paidRevenue - totalExpenses) / paidRevenue * 100 : 0,
      recurringRevenue,
    },
    health: {
      activeClients: clients.filter((client) => client.status === "Active").length,
      averageClientHealth: clients.length ? clients.reduce((sum, client) => sum + client.healthScore, 0) / clients.length : 0,
      overdueInvoices: invoices.filter((invoice) => invoice.status === "Overdue" || (invoice.status === "Sent" && invoice.dueDate && invoice.dueDate < now)).length,
      projectRisks: projectRisks.length,
    },
    topClient,
    projectRisks,
    months,
    pipeline: ["New", "Qualified", "Discovery", "Proposal", "Negotiation", "Won", "Lost"].map((stage) => ({
      stage,
      count: leads.filter((lead) => lead.stage === stage).length,
      value: leads.filter((lead) => lead.stage === stage).reduce((sum, lead) => sum + Number(lead.value), 0),
    })),
  };
});
