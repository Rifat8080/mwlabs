import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ModuleWorkspace } from "@/components/agency/module-workspace";
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

  return <ModuleWorkspace moduleKey={module} config={config} />;
}
