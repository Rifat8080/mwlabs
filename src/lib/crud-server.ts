import "server-only";

import { z } from "zod";

import { db } from "@/lib/db";

type Scope = "organization" | "project" | "invoice";

type CrudSpec = {
  delegate: string;
  scope: Scope;
  schema: z.ZodObject<z.ZodRawShape>;
  fields: string[];
};

type CrudDelegate = {
  findMany: (args: Record<string, unknown>) => Promise<Record<string, unknown>[]>;
  findFirst: (args: Record<string, unknown>) => Promise<Record<string, unknown> | null>;
  create: (args: Record<string, unknown>) => Promise<Record<string, unknown>>;
  update: (args: Record<string, unknown>) => Promise<Record<string, unknown>>;
  delete: (args: Record<string, unknown>) => Promise<Record<string, unknown>>;
};

const shortText = (max = 191) => z.string().trim().min(1).max(max);
const optionalText = (max = 191) => z.preprocess((value) => value === "" ? null : value, z.string().trim().max(max).nullable().optional());
const optionalId = z.preprocess((value) => value === "" ? null : value, z.string().min(1).max(191).nullable().optional());
const money = z.coerce.number().finite().min(0).max(1_000_000_000);
const percentage = z.coerce.number().int().min(0).max(100);
const optionalDate = z.preprocess(
  (value) => value === "" ? null : value,
  z.union([z.string().date(), z.string().datetime(), z.date(), z.null()]).transform((value) => value ? value instanceof Date ? value : new Date(value) : null).optional(),
);
const requiredDate = z.union([z.string().date(), z.string().datetime(), z.date()]).transform((value) => value instanceof Date ? value : new Date(value));
const optionalDateTime = z.preprocess(
  (value) => value === "" || value === undefined ? null : value,
  z.union([z.null(), z.coerce.date()]).optional(),
);
const requiredDateTime = z.coerce.date();
const optionalSlug = z.preprocess(
  (value) => value === "" ? undefined : value,
  z.string().trim().toLowerCase().min(2).max(191).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only").optional(),
);
const optionalUrl = z.preprocess(
  (value) => value === "" ? null : value,
  z.string().trim().max(4_000).refine((value) => value.startsWith("/") || /^https?:\/\//i.test(value), "Use an absolute http(s) URL or a site-relative path").nullable().optional(),
);
const publicationStatus = z.enum(["Draft", "Published", "Archived"]);
const contentResources = new Set(["blog-posts", "work-posts", "seo-pages"]);
const reservedPageSlugs = new Set(["app", "api", "auth", "blog", "portal", "register", "robots.txt", "sign-in", "sign-up", "sitemap.xml", "work", "_next"]);

function validationMessage(error: z.ZodError) {
  const issue = error.issues[0];
  if (!issue) return "Invalid record details";
  const field = issue.path[0];
  return field ? `${String(field)}: ${issue.message}` : issue.message;
}

const specs: Record<string, CrudSpec> = {
  leads: {
    delegate: "lead",
    scope: "organization",
    schema: z.object({ name: shortText(120), company: shortText(160), email: z.email().max(191), phone: optionalText(40), source: shortText(80), stage: shortText(40), value: money, probability: percentage.optional(), score: percentage.optional(), ownerName: optionalText(120), nextActivityAt: optionalDate, notes: optionalText(10_000) }),
    fields: ["name", "company", "email", "phone", "source", "stage", "value", "probability", "score", "ownerName", "nextActivityAt", "notes", "createdAt", "updatedAt"],
  },
  clients: {
    delegate: "client",
    scope: "organization",
    schema: z.object({ name: shortText(120), company: shortText(160), email: z.email().max(191), phone: optionalText(40), status: shortText(40), healthScore: percentage.optional(), lifetimeValue: money.optional(), onboardingProgress: percentage.optional() }),
    fields: ["name", "company", "email", "phone", "status", "healthScore", "lifetimeValue", "onboardingProgress", "createdAt", "updatedAt"],
  },
  proposals: {
    delegate: "proposal",
    scope: "organization",
    schema: z.object({ title: shortText(240), status: shortText(40), amount: money, leadId: optionalId, clientId: optionalId, validUntil: optionalDate, sentAt: optionalDate, acceptedAt: optionalDate }),
    fields: ["title", "status", "amount", "leadId", "clientId", "validUntil", "sentAt", "acceptedAt", "createdAt", "updatedAt"],
  },
  contracts: {
    delegate: "contract",
    scope: "organization",
    schema: z.object({ title: shortText(240), clientId: shortText(), proposalId: optionalId, status: shortText(40), value: money, startDate: optionalDate, endDate: optionalDate, signedAt: optionalDate }),
    fields: ["title", "clientId", "proposalId", "status", "value", "startDate", "endDate", "signedAt", "createdAt", "updatedAt"],
  },
  projects: {
    delegate: "project",
    scope: "organization",
    schema: z.object({ name: shortText(240), code: shortText(80), clientId: shortText(), status: shortText(40), progress: percentage.optional(), budget: money.optional(), spent: money.optional(), managerName: optionalText(120), startDate: optionalDate, dueDate: optionalDate }),
    fields: ["name", "code", "clientId", "status", "progress", "budget", "spent", "managerName", "startDate", "dueDate", "createdAt", "updatedAt"],
  },
  tasks: {
    delegate: "task",
    scope: "organization",
    schema: z.object({ title: shortText(240), description: optionalText(10_000), projectId: optionalId, assigneeId: optionalId, status: shortText(40), priority: shortText(30), dueDate: optionalDate, estimatedMinutes: z.coerce.number().int().min(0).max(1_000_000).optional(), trackedMinutes: z.coerce.number().int().min(0).max(1_000_000).optional() }),
    fields: ["title", "description", "projectId", "assigneeId", "status", "priority", "dueDate", "estimatedMinutes", "trackedMinutes", "createdAt", "updatedAt"],
  },
  "calendar-events": {
    delegate: "calendarEvent",
    scope: "organization",
    schema: z.object({ title: shortText(191), leadId: optionalId, inviteeName: optionalText(120), inviteeEmail: z.preprocess((value) => value === "" ? null : value, z.email().max(191).nullable().optional()), inviteePhone: optionalText(40), inviteeCompany: optionalText(160), startAt: requiredDateTime, endAt: optionalDateTime, timezone: optionalText(100), location: optionalText(2_000), status: z.enum(["Scheduled", "Completed", "Canceled", "No show"]), cancellationReason: optionalText(2_000), notes: optionalText(10_000) }),
    fields: ["title", "leadId", "bookingTypeId", "source", "bookingReference", "inviteeName", "inviteeEmail", "inviteePhone", "inviteeCompany", "startAt", "endAt", "timezone", "location", "status", "rescheduled", "cancellationReason", "notes", "createdAt", "updatedAt"],
  },
  "time-entries": {
    delegate: "timeEntry",
    scope: "project",
    schema: z.object({ projectId: shortText(), taskId: optionalId, description: optionalText(500), minutes: z.coerce.number().int().min(1).max(100_000), billable: z.boolean().optional(), hourlyRate: money.nullable().optional(), date: requiredDate }),
    fields: ["projectId", "taskId", "userId", "description", "minutes", "billable", "hourlyRate", "date"],
  },
  invoices: {
    delegate: "invoice",
    scope: "organization",
    schema: z.object({ clientId: shortText(), projectId: optionalId, number: shortText(80), status: shortText(40), currency: z.string().trim().length(3), subtotal: money, tax: money.optional(), total: money, issuedAt: optionalDate, dueDate: optionalDate, paidAt: optionalDate }),
    fields: ["clientId", "projectId", "number", "status", "currency", "subtotal", "tax", "total", "issuedAt", "dueDate", "paidAt", "createdAt", "updatedAt"],
  },
  expenses: {
    delegate: "expense",
    scope: "organization",
    schema: z.object({ category: shortText(100), vendor: shortText(160), description: optionalText(5_000), amount: money, status: shortText(40), incurredAt: requiredDate }),
    fields: ["category", "vendor", "description", "amount", "status", "incurredAt"],
  },
  retainers: {
    delegate: "retainer",
    scope: "organization",
    schema: z.object({ clientId: shortText(), name: shortText(240), status: shortText(40), monthlyValue: money, includedHours: z.coerce.number().int().min(0).max(100_000).optional(), renewalDate: optionalDate }),
    fields: ["clientId", "name", "status", "monthlyValue", "includedHours", "renewalDate"],
  },
  documents: {
    delegate: "document",
    scope: "organization",
    schema: z.object({ clientId: optionalId, projectId: optionalId, name: shortText(240), type: shortText(80), url: optionalText(4_000), version: z.coerce.number().int().min(1).max(100_000).optional() }),
    fields: ["clientId", "projectId", "name", "type", "url", "version", "createdAt"],
  },
  activities: {
    delegate: "activity",
    scope: "organization",
    schema: z.object({ leadId: optionalId, type: shortText(100), title: shortText(240), body: optionalText(10_000), occurredAt: optionalDate }),
    fields: ["leadId", "type", "title", "body", "occurredAt"],
  },
  automations: {
    delegate: "automation",
    scope: "organization",
    schema: z.object({ name: shortText(240), trigger: shortText(500), action: shortText(2_000), enabled: z.boolean().optional(), runCount: z.coerce.number().int().min(0).max(1_000_000_000).optional(), lastRunAt: optionalDate }),
    fields: ["name", "trigger", "action", "enabled", "runCount", "lastRunAt"],
  },
  knowledge: {
    delegate: "knowledgeItem",
    scope: "organization",
    schema: z.object({ title: shortText(240), content: shortText(100_000), source: optionalText(2_000), tags: optionalText(2_000) }),
    fields: ["title", "content", "source", "tags", "createdAt", "updatedAt"],
  },
  "blog-posts": {
    delegate: "blogPost",
    scope: "organization",
    schema: z.object({ title: shortText(191), slug: optionalSlug, excerpt: optionalText(5_000), content: shortText(200_000), coverImage: optionalUrl, category: shortText(120), authorName: shortText(120), status: publicationStatus, featured: z.boolean().optional(), publishedAt: optionalDate, metaTitle: optionalText(191), metaDescription: optionalText(500), canonicalUrl: optionalUrl, ogImage: optionalUrl }),
    fields: ["title", "slug", "excerpt", "content", "coverImage", "category", "authorName", "status", "featured", "publishedAt", "metaTitle", "metaDescription", "canonicalUrl", "ogImage", "createdAt", "updatedAt"],
  },
  "work-posts": {
    delegate: "workPost",
    scope: "organization",
    schema: z.object({ title: shortText(191), slug: optionalSlug, clientName: optionalText(160), industry: optionalText(120), services: optionalText(2_000), summary: shortText(5_000), challenge: optionalText(100_000), solution: shortText(100_000), results: optionalText(100_000), coverImage: optionalUrl, projectUrl: optionalUrl, status: publicationStatus, featured: z.boolean().optional(), completedAt: optionalDate, publishedAt: optionalDate, metaTitle: optionalText(191), metaDescription: optionalText(500), canonicalUrl: optionalUrl, ogImage: optionalUrl }),
    fields: ["title", "slug", "clientName", "industry", "services", "summary", "challenge", "solution", "results", "coverImage", "projectUrl", "status", "featured", "completedAt", "publishedAt", "metaTitle", "metaDescription", "canonicalUrl", "ogImage", "createdAt", "updatedAt"],
  },
  "seo-pages": {
    delegate: "seoPage",
    scope: "organization",
    schema: z.object({ title: shortText(191), slug: optionalSlug, eyebrow: optionalText(120), summary: shortText(5_000), content: shortText(200_000), heroImage: optionalUrl, primaryKeyword: optionalText(191), status: publicationStatus, noIndex: z.boolean().optional(), publishedAt: optionalDate, metaTitle: optionalText(191), metaDescription: optionalText(500), canonicalUrl: optionalUrl, ogImage: optionalUrl }),
    fields: ["title", "slug", "eyebrow", "summary", "content", "heroImage", "primaryKeyword", "status", "noIndex", "publishedAt", "metaTitle", "metaDescription", "canonicalUrl", "ogImage", "createdAt", "updatedAt"],
  },
  milestones: {
    delegate: "milestone",
    scope: "project",
    schema: z.object({ projectId: shortText(), name: shortText(240), status: shortText(40), progress: percentage.optional(), dueDate: optionalDate }),
    fields: ["projectId", "name", "status", "progress", "dueDate"],
  },
  "invoice-items": {
    delegate: "invoiceItem",
    scope: "invoice",
    schema: z.object({ invoiceId: shortText(), description: shortText(1_000), quantity: z.coerce.number().positive().max(1_000_000), unitPrice: money, total: money }),
    fields: ["invoiceId", "description", "quantity", "unitPrice", "total"],
  },
  payments: {
    delegate: "payment",
    scope: "invoice",
    schema: z.object({ invoiceId: shortText(), amount: money, method: optionalText(100), reference: optionalText(240), processedAt: optionalDate }),
    fields: ["invoiceId", "amount", "method", "reference", "processedAt"],
  },
  teams: {
    delegate: "team",
    scope: "organization",
    schema: z.object({ name: shortText(160) }),
    fields: ["name", "createdAt", "updatedAt"],
  },
};

function getSpec(resource: string) {
  return specs[resource] ?? null;
}

function getDelegate(spec: CrudSpec) {
  return (db as unknown as Record<string, CrudDelegate>)[spec.delegate];
}

function selectFields(spec: CrudSpec) {
  return Object.fromEntries(["id", ...spec.fields].map((field) => [field, true]));
}

function ownershipWhere(spec: CrudSpec, organizationId: string, id?: string) {
  if (spec.scope === "organization") return { ...(id ? { id } : {}), organizationId };
  if (spec.scope === "project") return { ...(id ? { id } : {}), project: { organizationId } };
  return { ...(id ? { id } : {}), invoice: { organizationId } };
}

async function validateRelations(data: Record<string, unknown>, organizationId: string) {
  const checks: Array<Promise<number>> = [];
  const labels: string[] = [];

  const add = (key: string, query: Promise<number>) => {
    if (!data[key]) return;
    labels.push(key);
    checks.push(query);
  };

  add("clientId", db.client.count({ where: { id: String(data.clientId), organizationId } }));
  add("projectId", db.project.count({ where: { id: String(data.projectId), organizationId } }));
  add("leadId", db.lead.count({ where: { id: String(data.leadId), organizationId } }));
  add("proposalId", db.proposal.count({ where: { id: String(data.proposalId), organizationId } }));
  add("taskId", db.task.count({ where: { id: String(data.taskId), organizationId } }));
  add("invoiceId", db.invoice.count({ where: { id: String(data.invoiceId), organizationId } }));
  add("assigneeId", db.member.count({ where: { userId: String(data.assigneeId), organizationId } }));

  const results = await Promise.all(checks);
  const invalidIndex = results.findIndex((count) => count === 0);
  if (invalidIndex >= 0) throw new Error(`Invalid organization relationship: ${labels[invalidIndex]}`);
}

function normalizeRecord(record: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(record).map(([key, value]) => {
    if (value instanceof Date) return [key, value.toISOString()];
    if (value && typeof value === "object" && "toNumber" in value && typeof value.toNumber === "function") return [key, value.toNumber()];
    return [key, value];
  }));
}

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 191);
}

function prepareContentData(
  resource: string,
  data: Record<string, unknown>,
  options: { creating: boolean; existingPublishedAt?: unknown },
) {
  if (!contentResources.has(resource)) return;

  if (options.creating && !data.slug && typeof data.title === "string") data.slug = slugify(data.title);
  if (!data.slug && options.creating) throw new Error("The title must produce a valid URL slug.");
  if (resource === "seo-pages" && typeof data.slug === "string" && reservedPageSlugs.has(data.slug)) {
    throw new Error("That page slug is reserved by the website. Choose a different URL slug.");
  }
  if (data.status === "Published" && !data.publishedAt && !options.existingPublishedAt) data.publishedAt = new Date();
}

function prepareCalendarData(
  resource: string,
  data: Record<string, unknown>,
  options: { creating: boolean; existingStartAt?: unknown; existingEndAt?: unknown },
) {
  if (resource !== "calendar-events") return;
  if (options.creating && data.startAt instanceof Date && !data.endAt) {
    data.endAt = new Date(data.startAt.getTime() + 30 * 60 * 1_000);
  }
  const startAt = data.startAt instanceof Date ? data.startAt : options.existingStartAt;
  const endAt = data.endAt instanceof Date ? data.endAt : data.endAt === null ? null : options.existingEndAt;
  if (startAt instanceof Date && endAt instanceof Date && endAt <= startAt) {
    throw new Error("endAt: The end time must be later than the start time.");
  }
}

export function supportsCrudResource(resource: string) {
  return Boolean(getSpec(resource));
}

export async function listCrudRecords(resource: string, organizationId: string) {
  const spec = getSpec(resource);
  if (!spec) throw new Error("Unsupported resource");
  const records = await getDelegate(spec).findMany({
    where: ownershipWhere(spec, organizationId),
    select: selectFields(spec),
    ...(contentResources.has(resource)
      ? { orderBy: { updatedAt: "desc" } }
      : resource === "calendar-events"
        ? { orderBy: { startAt: "asc" } }
        : {}),
    take: 250,
  });
  return records.map(normalizeRecord);
}

export async function createCrudRecord(resource: string, organizationId: string, userId: string, input: unknown) {
  const spec = getSpec(resource);
  if (!spec) throw new Error("Unsupported resource");
  const parsed = spec.schema.safeParse(input);
  if (!parsed.success) throw new Error(validationMessage(parsed.error));
  const data: Record<string, unknown> = { ...parsed.data };
  prepareContentData(resource, data, { creating: true });
  prepareCalendarData(resource, data, { creating: true });
  if (resource === "activities" && data.occurredAt === null) delete data.occurredAt;
  if (resource === "payments" && data.processedAt === null) delete data.processedAt;
  await validateRelations(data, organizationId);
  if (spec.scope === "organization") data.organizationId = organizationId;
  if (resource === "time-entries") data.userId = userId;
  const record = await getDelegate(spec).create({ data, select: selectFields(spec) });
  return normalizeRecord(record);
}

export async function updateCrudRecord(resource: string, id: string, organizationId: string, input: unknown) {
  const spec = getSpec(resource);
  if (!spec) throw new Error("Unsupported resource");
  const existing = await getDelegate(spec).findFirst({
    where: ownershipWhere(spec, organizationId, id),
    select: contentResources.has(resource)
      ? { id: true, publishedAt: true }
      : resource === "calendar-events"
        ? { id: true, startAt: true, endAt: true }
        : { id: true },
  });
  if (!existing) return null;
  const parsed = spec.schema.partial().safeParse(input);
  if (!parsed.success || Object.keys(parsed.data).length === 0) throw new Error(parsed.success ? "No changes supplied" : validationMessage(parsed.error));
  const data = { ...parsed.data } as Record<string, unknown>;
  prepareContentData(resource, data, { creating: false, existingPublishedAt: existing.publishedAt });
  prepareCalendarData(resource, data, { creating: false, existingStartAt: existing.startAt, existingEndAt: existing.endAt });
  await validateRelations(data, organizationId);
  const record = await getDelegate(spec).update({ where: { id }, data, select: selectFields(spec) });
  return normalizeRecord(record);
}

export async function deleteCrudRecord(resource: string, id: string, organizationId: string) {
  const spec = getSpec(resource);
  if (!spec) throw new Error("Unsupported resource");
  const existing = await getDelegate(spec).findFirst({
    where: ownershipWhere(spec, organizationId, id),
    select: { id: true },
  });
  if (!existing) return false;
  await getDelegate(spec).delete({ where: { id } });
  return true;
}
