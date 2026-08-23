export type WorkspaceRole = "owner" | "admin" | "member" | string;

const memberModules = new Set([
  "overview",
  "ai",
  "inbox",
  "clients",
  "onboarding",
  "projects",
  "tasks",
  "calendar",
  "scheduling",
  "time",
  "documents",
]);

export function canAccessModule(role: WorkspaceRole, module: string) {
  if (role === "owner" || role === "admin") return true;
  return memberModules.has(module);
}
