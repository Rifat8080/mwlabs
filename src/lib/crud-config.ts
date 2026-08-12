export type CrudFieldType = "text" | "email" | "number" | "date" | "textarea" | "select" | "checkbox" | "relation";

export type CrudField = {
  key: string;
  label: string;
  type: CrudFieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  relationResource?: string;
  min?: number;
  max?: number;
  step?: number;
};

export type CrudColumn = {
  key: string;
  label: string;
  format?: "currency" | "date" | "percent" | "boolean";
};

export type CrudUiConfig = {
  resource: string;
  singular: string;
  fields: CrudField[];
  columns: CrudColumn[];
};

const statusOptions = ["Draft", "Active", "Sent", "Pending", "Approved", "Review", "Complete", "Archived"];

export const crudModuleConfigs: Partial<Record<string, CrudUiConfig>> = {
  inbox: {
    resource: "activities",
    singular: "activity",
    fields: [
      { key: "type", label: "Activity type", type: "text", required: true, placeholder: "client.message" },
      { key: "title", label: "Title", type: "text", required: true },
      { key: "body", label: "Details", type: "textarea" },
      { key: "leadId", label: "Related lead", type: "relation", relationResource: "leads" },
      { key: "occurredAt", label: "Occurred at", type: "date" },
    ],
    columns: [{ key: "title", label: "Activity" }, { key: "type", label: "Type" }, { key: "body", label: "Details" }, { key: "occurredAt", label: "Occurred", format: "date" }],
  },
  leads: {
    resource: "leads",
    singular: "lead",
    fields: [
      { key: "name", label: "Contact name", type: "text", required: true },
      { key: "company", label: "Company", type: "text", required: true },
      { key: "email", label: "Email", type: "email", required: true },
      { key: "phone", label: "Phone", type: "text" },
      { key: "source", label: "Source", type: "text", required: true },
      { key: "stage", label: "Stage", type: "select", options: ["New", "Qualified", "Discovery", "Proposal", "Negotiation", "Won", "Lost"], required: true },
      { key: "value", label: "Estimated value", type: "number", min: 0, step: 100, required: true },
      { key: "probability", label: "Probability", type: "number", min: 0, max: 100 },
      { key: "score", label: "Lead score", type: "number", min: 0, max: 100 },
      { key: "ownerName", label: "Owner", type: "text" },
      { key: "nextActivityAt", label: "Next activity", type: "date" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
    columns: [{ key: "company", label: "Opportunity" }, { key: "stage", label: "Stage" }, { key: "value", label: "Value", format: "currency" }, { key: "score", label: "Score" }, { key: "ownerName", label: "Owner" }, { key: "nextActivityAt", label: "Next step", format: "date" }],
  },
  clients: {
    resource: "clients",
    singular: "client",
    fields: [
      { key: "name", label: "Contact name", type: "text", required: true },
      { key: "company", label: "Company", type: "text", required: true },
      { key: "email", label: "Email", type: "email", required: true },
      { key: "phone", label: "Phone", type: "text" },
      { key: "status", label: "Status", type: "select", options: ["Active", "Onboarding", "At risk", "Paused", "Inactive"], required: true },
      { key: "healthScore", label: "Health score", type: "number", min: 0, max: 100 },
      { key: "lifetimeValue", label: "Lifetime value", type: "number", min: 0, step: 100 },
      { key: "onboardingProgress", label: "Onboarding progress", type: "number", min: 0, max: 100 },
    ],
    columns: [{ key: "company", label: "Client" }, { key: "name", label: "Contact" }, { key: "status", label: "Status" }, { key: "healthScore", label: "Health" }, { key: "lifetimeValue", label: "Lifetime value", format: "currency" }, { key: "onboardingProgress", label: "Onboarding", format: "percent" }],
  },
  onboarding: {
    resource: "clients",
    singular: "client onboarding",
    fields: [
      { key: "name", label: "Contact name", type: "text", required: true },
      { key: "company", label: "Company", type: "text", required: true },
      { key: "email", label: "Email", type: "email", required: true },
      { key: "status", label: "Status", type: "select", options: ["Onboarding", "Active", "At risk", "Paused"], required: true },
      { key: "onboardingProgress", label: "Progress", type: "number", min: 0, max: 100 },
      { key: "healthScore", label: "Health score", type: "number", min: 0, max: 100 },
    ],
    columns: [{ key: "company", label: "Client" }, { key: "name", label: "Owner" }, { key: "status", label: "Status" }, { key: "onboardingProgress", label: "Progress", format: "percent" }, { key: "healthScore", label: "Health" }],
  },
  proposals: {
    resource: "proposals",
    singular: "proposal",
    fields: [
      { key: "title", label: "Proposal title", type: "text", required: true },
      { key: "status", label: "Status", type: "select", options: ["Draft", "Internal review", "Sent", "Viewed", "Accepted", "Rejected", "Converted"], required: true },
      { key: "amount", label: "Amount", type: "number", min: 0, step: 100, required: true },
      { key: "leadId", label: "Lead", type: "relation", relationResource: "leads" },
      { key: "clientId", label: "Client", type: "relation", relationResource: "clients" },
      { key: "validUntil", label: "Valid until", type: "date" },
      { key: "sentAt", label: "Sent at", type: "date" },
      { key: "acceptedAt", label: "Accepted at", type: "date" },
    ],
    columns: [{ key: "title", label: "Proposal" }, { key: "status", label: "Status" }, { key: "amount", label: "Value", format: "currency" }, { key: "validUntil", label: "Valid until", format: "date" }, { key: "sentAt", label: "Sent", format: "date" }],
  },
  contracts: {
    resource: "contracts",
    singular: "contract",
    fields: [
      { key: "title", label: "Agreement title", type: "text", required: true },
      { key: "clientId", label: "Client", type: "relation", relationResource: "clients", required: true },
      { key: "proposalId", label: "Proposal", type: "relation", relationResource: "proposals" },
      { key: "status", label: "Status", type: "select", options: ["Draft", "Legal review", "Sent", "Negotiation", "Signed", "Active", "Expired"], required: true },
      { key: "value", label: "Contract value", type: "number", min: 0, step: 100, required: true },
      { key: "startDate", label: "Start date", type: "date" },
      { key: "endDate", label: "End date", type: "date" },
      { key: "signedAt", label: "Signed at", type: "date" },
    ],
    columns: [{ key: "title", label: "Agreement" }, { key: "status", label: "Status" }, { key: "value", label: "Value", format: "currency" }, { key: "startDate", label: "Starts", format: "date" }, { key: "endDate", label: "Ends", format: "date" }],
  },
  projects: {
    resource: "projects",
    singular: "project",
    fields: [
      { key: "name", label: "Project name", type: "text", required: true },
      { key: "code", label: "Project code", type: "text", required: true },
      { key: "clientId", label: "Client", type: "relation", relationResource: "clients", required: true },
      { key: "status", label: "Status", type: "select", options: ["Planning", "In progress", "Review", "Blocked", "Complete", "Archived"], required: true },
      { key: "progress", label: "Progress", type: "number", min: 0, max: 100 },
      { key: "budget", label: "Budget", type: "number", min: 0, step: 100 },
      { key: "spent", label: "Spent", type: "number", min: 0, step: 100 },
      { key: "managerName", label: "Project manager", type: "text" },
      { key: "startDate", label: "Start date", type: "date" },
      { key: "dueDate", label: "Due date", type: "date" },
    ],
    columns: [{ key: "name", label: "Project" }, { key: "code", label: "Code" }, { key: "status", label: "Status" }, { key: "progress", label: "Progress", format: "percent" }, { key: "budget", label: "Budget", format: "currency" }, { key: "managerName", label: "Manager" }, { key: "dueDate", label: "Due", format: "date" }],
  },
  tasks: {
    resource: "tasks",
    singular: "task",
    fields: [
      { key: "title", label: "Task title", type: "text", required: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "projectId", label: "Project", type: "relation", relationResource: "projects" },
      { key: "status", label: "Status", type: "select", options: ["Backlog", "Today", "In progress", "Review", "Done"], required: true },
      { key: "priority", label: "Priority", type: "select", options: ["Low", "Medium", "High", "Urgent"], required: true },
      { key: "dueDate", label: "Due date", type: "date" },
      { key: "estimatedMinutes", label: "Estimated minutes", type: "number", min: 0 },
      { key: "trackedMinutes", label: "Tracked minutes", type: "number", min: 0 },
    ],
    columns: [{ key: "title", label: "Task" }, { key: "status", label: "Status" }, { key: "priority", label: "Priority" }, { key: "dueDate", label: "Due", format: "date" }, { key: "estimatedMinutes", label: "Estimate" }, { key: "trackedMinutes", label: "Tracked" }],
  },
  calendar: {
    resource: "tasks",
    singular: "scheduled task",
    fields: [
      { key: "title", label: "Event title", type: "text", required: true },
      { key: "projectId", label: "Project", type: "relation", relationResource: "projects" },
      { key: "status", label: "Status", type: "select", options: ["Backlog", "Today", "In progress", "Review", "Done"], required: true },
      { key: "priority", label: "Priority", type: "select", options: ["Low", "Medium", "High", "Urgent"], required: true },
      { key: "dueDate", label: "Scheduled date", type: "date", required: true },
      { key: "description", label: "Notes", type: "textarea" },
    ],
    columns: [{ key: "title", label: "Event" }, { key: "dueDate", label: "Date", format: "date" }, { key: "status", label: "Status" }, { key: "priority", label: "Priority" }],
  },
  time: {
    resource: "time-entries",
    singular: "time entry",
    fields: [
      { key: "projectId", label: "Project", type: "relation", relationResource: "projects", required: true },
      { key: "taskId", label: "Task", type: "relation", relationResource: "tasks" },
      { key: "description", label: "Description", type: "text" },
      { key: "minutes", label: "Minutes", type: "number", min: 1, required: true },
      { key: "billable", label: "Billable", type: "checkbox" },
      { key: "hourlyRate", label: "Hourly rate", type: "number", min: 0, step: 1 },
      { key: "date", label: "Date", type: "date", required: true },
    ],
    columns: [{ key: "description", label: "Entry" }, { key: "date", label: "Date", format: "date" }, { key: "minutes", label: "Minutes" }, { key: "billable", label: "Billable", format: "boolean" }, { key: "hourlyRate", label: "Rate", format: "currency" }],
  },
  finance: {
    resource: "invoices",
    singular: "invoice",
    fields: [
      { key: "number", label: "Invoice number", type: "text", required: true },
      { key: "clientId", label: "Client", type: "relation", relationResource: "clients", required: true },
      { key: "projectId", label: "Project", type: "relation", relationResource: "projects" },
      { key: "status", label: "Status", type: "select", options: ["Draft", "Sent", "Paid", "Overdue", "Void"], required: true },
      { key: "currency", label: "Currency", type: "select", options: ["GBP", "USD", "EUR", "BDT"], required: true },
      { key: "subtotal", label: "Subtotal", type: "number", min: 0, step: 1, required: true },
      { key: "tax", label: "Tax", type: "number", min: 0, step: 1 },
      { key: "total", label: "Total", type: "number", min: 0, step: 1, required: true },
      { key: "issuedAt", label: "Issued", type: "date" },
      { key: "dueDate", label: "Due", type: "date" },
      { key: "paidAt", label: "Paid", type: "date" },
    ],
    columns: [{ key: "number", label: "Invoice" }, { key: "status", label: "Status" }, { key: "currency", label: "Currency" }, { key: "total", label: "Total", format: "currency" }, { key: "issuedAt", label: "Issued", format: "date" }, { key: "dueDate", label: "Due", format: "date" }],
  },
  team: {
    resource: "teams",
    singular: "team",
    fields: [{ key: "name", label: "Team name", type: "text", required: true, placeholder: "Creative" }],
    columns: [{ key: "name", label: "Team" }, { key: "createdAt", label: "Created", format: "date" }, { key: "updatedAt", label: "Last updated", format: "date" }],
  },
  documents: {
    resource: "documents",
    singular: "document",
    fields: [
      { key: "name", label: "Document name", type: "text", required: true },
      { key: "type", label: "Type", type: "text", required: true },
      { key: "url", label: "URL", type: "text" },
      { key: "version", label: "Version", type: "number", min: 1 },
      { key: "clientId", label: "Client", type: "relation", relationResource: "clients" },
      { key: "projectId", label: "Project", type: "relation", relationResource: "projects" },
    ],
    columns: [{ key: "name", label: "Document" }, { key: "type", label: "Type" }, { key: "version", label: "Version" }, { key: "url", label: "Location" }, { key: "createdAt", label: "Created", format: "date" }],
  },
  automations: {
    resource: "automations",
    singular: "automation",
    fields: [
      { key: "name", label: "Automation name", type: "text", required: true },
      { key: "trigger", label: "Trigger", type: "text", required: true },
      { key: "action", label: "Action", type: "textarea", required: true },
      { key: "enabled", label: "Enabled", type: "checkbox" },
      { key: "runCount", label: "Run count", type: "number", min: 0 },
      { key: "lastRunAt", label: "Last run", type: "date" },
    ],
    columns: [{ key: "name", label: "Automation" }, { key: "trigger", label: "Trigger" }, { key: "action", label: "Action" }, { key: "enabled", label: "Enabled", format: "boolean" }, { key: "runCount", label: "Runs" }, { key: "lastRunAt", label: "Last run", format: "date" }],
  },
};

export const genericStatusOptions = statusOptions;
