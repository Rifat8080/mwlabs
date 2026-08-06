import "server-only";

import { db } from "@/lib/db";

export async function getAgencyContext(organizationId: string) {
  const [leads, projects, tasks, invoices, knowledge, automations] = await Promise.all([
    db.lead.findMany({
      where: { organizationId },
      orderBy: { score: "desc" },
      take: 10,
      select: { company: true, stage: true, value: true, probability: true, score: true, nextActivityAt: true },
    }),
    db.project.findMany({
      where: { organizationId, status: { not: "Complete" } },
      take: 10,
      select: { name: true, status: true, progress: true, budget: true, spent: true, dueDate: true, client: { select: { company: true } } },
    }),
    db.task.findMany({
      where: { organizationId, status: { not: "Done" } },
      orderBy: { dueDate: "asc" },
      take: 15,
      select: { title: true, status: true, priority: true, dueDate: true, project: { select: { code: true } } },
    }),
    db.invoice.findMany({
      where: { organizationId },
      take: 12,
      orderBy: { createdAt: "desc" },
      select: { number: true, status: true, total: true, dueDate: true, client: { select: { company: true } } },
    }),
    db.knowledgeItem.findMany({
      where: { organizationId },
      orderBy: { updatedAt: "desc" },
      take: 12,
      select: { title: true, content: true, source: true, tags: true },
    }),
    db.automation.findMany({
      where: { organizationId, enabled: true },
      select: { name: true, trigger: true, action: true },
    }),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    leads: leads.map((lead) => ({ ...lead, value: Number(lead.value) })),
    projects: projects.map((project) => ({ ...project, budget: Number(project.budget), spent: Number(project.spent) })),
    tasks,
    invoices: invoices.map((invoice) => ({ ...invoice, total: Number(invoice.total) })),
    approvedKnowledge: knowledge,
    enabledAutomations: automations,
  };
}

export async function saveAiExchange({
  organizationId,
  userId,
  threadId,
  prompt,
  response,
}: {
  organizationId: string;
  userId: string;
  threadId?: string;
  prompt: string;
  response: string;
}) {
  const thread = threadId
    ? await db.aiThread.findFirst({
        where: { id: threadId, organizationId, userId },
        select: { id: true },
      })
    : null;

  const target = thread ?? await db.aiThread.create({
    data: {
      organizationId,
      userId,
      title: prompt.slice(0, 72),
    },
    select: { id: true },
  });

  await db.$transaction([
    db.aiMessage.create({ data: { threadId: target.id, role: "user", content: prompt } }),
    db.aiMessage.create({ data: { threadId: target.id, role: "assistant", content: response } }),
    db.aiThread.update({ where: { id: target.id }, data: { updatedAt: new Date() } }),
  ]);

  return target.id;
}
