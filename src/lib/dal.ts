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

  const [leads, clients, projects, tasks, invoices, expenses] = await Promise.all([
    db.lead.findMany({
      where: { organizationId },
      select: { stage: true, value: true, probability: true },
    }),
    db.client.count({ where: { organizationId, status: "Active" } }),
    db.project.findMany({
      where: { organizationId },
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
      select: { status: true, total: true },
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

  return {
    metrics: {
      weightedPipeline,
      paidRevenue,
      receivables,
      grossMargin,
      activeClients: clients,
      activeProjects: projects.length,
    },
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
