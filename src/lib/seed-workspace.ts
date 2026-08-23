import "server-only";

import { db } from "@/lib/db";

export async function seedWorkspace(organizationId: string) {
  const existing = await db.lead.count({ where: { organizationId } });
  if (existing > 0) return;

  const [northstar, halcyon, fieldnote] = await Promise.all([
    db.client.create({
      data: {
        organizationId,
        name: "Maya Chen",
        company: "Northstar Labs",
        email: "maya@northstarlabs.co",
        healthScore: 94,
        lifetimeValue: 68400,
        onboardingProgress: 100,
      },
    }),
    db.client.create({
      data: {
        organizationId,
        name: "Jon Bell",
        company: "Halcyon Health",
        email: "jon@halcyon.health",
        healthScore: 81,
        lifetimeValue: 42750,
        onboardingProgress: 76,
      },
    }),
    db.client.create({
      data: {
        organizationId,
        name: "Aria Rahman",
        company: "Fieldnote Studio",
        email: "aria@fieldnote.design",
        healthScore: 72,
        lifetimeValue: 28900,
        onboardingProgress: 48,
      },
    }),
  ]);

  await db.lead.createMany({
    data: [
      { organizationId, name: "Elena Rossi", company: "Vela Systems", email: "elena@vela.io", source: "Referral", stage: "Proposal", value: 28000, probability: 75, score: 92, ownerName: "Mina" },
      { organizationId, name: "Noah Williams", company: "Nova Commerce", email: "noah@novacommerce.shop", source: "LinkedIn", stage: "Discovery", value: 18000, probability: 45, score: 84, ownerName: "Avery" },
      { organizationId, name: "Sofia Malik", company: "Common Ground", email: "sofia@commonground.org", source: "Website", stage: "Qualified", value: 12500, probability: 35, score: 76, ownerName: "Mina" },
      { organizationId, name: "Theo Grant", company: "Juniper AI", email: "theo@juniper.ai", source: "Event", stage: "New", value: 34000, probability: 20, score: 71, ownerName: "Sam" },
      { organizationId, name: "Ana Silva", company: "Forma Living", email: "ana@forma.live", source: "Organic", stage: "Negotiation", value: 22000, probability: 85, score: 95, ownerName: "Avery" },
    ],
  });

  const [projectA, projectB, projectC] = await Promise.all([
    db.project.create({ data: { organizationId, clientId: northstar.id, name: "Platform relaunch", code: "NST-024", status: "In progress", progress: 68, budget: 48000, spent: 29200, managerName: "Avery Kim", dueDate: new Date("2026-09-18") } }),
    db.project.create({ data: { organizationId, clientId: halcyon.id, name: "Patient portal", code: "HAL-011", status: "Review", progress: 86, budget: 36000, spent: 31800, managerName: "Mina Park", dueDate: new Date("2026-08-22") } }),
    db.project.create({ data: { organizationId, clientId: fieldnote.id, name: "Brand system", code: "FLD-008", status: "In progress", progress: 42, budget: 24500, spent: 9400, managerName: "Sam Rivera", dueDate: new Date("2026-10-04") } }),
  ]);

  await db.task.createMany({
    data: [
      { organizationId, projectId: projectA.id, title: "Approve responsive prototype", status: "Today", priority: "High", estimatedMinutes: 90, trackedMinutes: 35, dueDate: new Date("2026-08-06") },
      { organizationId, projectId: projectB.id, title: "QA accessibility fixes", status: "In progress", priority: "High", estimatedMinutes: 180, trackedMinutes: 120, dueDate: new Date("2026-08-07") },
      { organizationId, projectId: projectC.id, title: "Present visual directions", status: "Today", priority: "Medium", estimatedMinutes: 60, trackedMinutes: 0, dueDate: new Date("2026-08-06") },
      { organizationId, projectId: projectA.id, title: "Document CMS handoff", status: "Backlog", priority: "Low", estimatedMinutes: 120, trackedMinutes: 0 },
    ],
  });

  await Promise.all([
    db.invoice.create({ data: { organizationId, clientId: northstar.id, projectId: projectA.id, number: "INV-2026-041", status: "Paid", subtotal: 12000, tax: 0, total: 12000, issuedAt: new Date("2026-07-01"), dueDate: new Date("2026-07-15"), paidAt: new Date("2026-07-12") } }),
    db.invoice.create({ data: { organizationId, clientId: halcyon.id, projectId: projectB.id, number: "INV-2026-046", status: "Sent", subtotal: 14500, tax: 0, total: 14500, issuedAt: new Date("2026-07-28"), dueDate: new Date("2026-08-11") } }),
    db.invoice.create({ data: { organizationId, clientId: fieldnote.id, projectId: projectC.id, number: "INV-2026-049", status: "Draft", subtotal: 8200, tax: 0, total: 8200 } }),
    db.expense.create({ data: { organizationId, category: "Software", vendor: "Figma", amount: 180, status: "Approved" } }),
    db.expense.create({ data: { organizationId, category: "Contractor", vendor: "Motion studio", amount: 2400, status: "Pending" } }),
    db.retainer.create({ data: { organizationId, clientId: northstar.id, name: "Growth partnership", monthlyValue: 8500, includedHours: 60, renewalDate: new Date("2027-01-01") } }),
  ]);

  await db.automation.createMany({
    data: [
      { organizationId, name: "Lead response SLA", trigger: "New lead received", action: "Draft personalized reply + notify owner", runCount: 48 },
      { organizationId, name: "Invoice chase", trigger: "Invoice overdue by 3 days", action: "Prepare reminder for approval", runCount: 11 },
      { organizationId, name: "Project risk scan", trigger: "Every weekday at 09:00", action: "Flag budget and deadline risks", runCount: 126 },
    ],
  });

  await db.knowledgeItem.createMany({
    data: [
      { organizationId, title: "Agency positioning", content: "M&W Labs is a full-service digital agency helping businesses launch, grow, and scale through web and software, digital marketing, branding and content, AI automation, and growth strategy.", source: "Operating manual", tags: "strategy,positioning" },
      { organizationId, title: "Proposal guardrails", content: "Target 55% gross margin. Every engagement needs a clear owner, measurable outcome, and change-request clause.", source: "Finance playbook", tags: "sales,finance" },
      { organizationId, title: "Communication standard", content: "Acknowledge client requests within four business hours and always close the loop with a named next step.", source: "Client success handbook", tags: "clients,delivery" },
    ],
  });
}
