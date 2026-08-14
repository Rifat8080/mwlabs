import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ModuleWorkspace } from "@/components/agency/module-workspace";
import { NotificationsWorkspace } from "@/components/agency/notifications";
import { ReportsWorkspace } from "@/components/agency/reports-workspace";
import { SchedulingWorkspace } from "@/components/agency/scheduling-workspace";
import { SettingsWorkspace } from "@/components/agency/settings-workspace";
import { TeamWorkspace } from "@/components/agency/team-workspace";
import { getReportsData, getWorkspaceContext } from "@/lib/dal";
import { agencyModules, moduleConfigs } from "@/lib/module-config";

export async function generateMetadata({ params }: PageProps<"/app/[module]">): Promise<Metadata> {
  const { module } = await params;
  const config = moduleConfigs[module];
  return { title: config?.title ?? "Workspace" };
}

export default async function ModulePage({ params }: PageProps<"/app/[module]">) {
  const { module } = await params;
  if (!agencyModules.includes(module) || module === "ai") notFound();
  const config = moduleConfigs[module];
  if (!config) notFound();
  if (module === "scheduling") return <SchedulingWorkspace />;
  if (module === "inbox") return <NotificationsWorkspace />;
  if (module === "team") return <TeamWorkspace />;
  if (module === "reports") return <ReportsWorkspace data={await getReportsData()} />;
  if (module === "settings") return <SettingsWorkspace />;

  const workspace = await getWorkspaceContext();
  return <ModuleWorkspace moduleKey={module} config={config} role={workspace.role} />;
}
