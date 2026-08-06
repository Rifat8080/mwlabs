import type { Metadata } from "next";

import { Dashboard } from "@/components/agency/dashboard";
import { getDashboardData, getWorkspaceContext } from "@/lib/dal";

export const metadata: Metadata = { title: "Command center" };

export default async function DashboardPage() {
  const [context, data] = await Promise.all([
    getWorkspaceContext(),
    getDashboardData(),
  ]);

  return <Dashboard data={data} firstName={context.user.name.split(" ")[0] ?? "there"} />;
}
