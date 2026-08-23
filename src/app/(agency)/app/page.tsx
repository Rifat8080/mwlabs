import type { Metadata } from "next";

import { Dashboard } from "@/components/agency/dashboard";
import { getCustomerDashboardData, getDashboardData, getWorkspaceContext } from "@/lib/dal";

export const metadata: Metadata = { title: "Command center" };

export default async function DashboardPage() {
  const context = await getWorkspaceContext();
  const data = context.role === "customer" ? await getCustomerDashboardData(context.user.id) : await getDashboardData();

  return <Dashboard data={data} firstName={context.user.name.split(" ")[0] ?? "there"} role={context.role} customer={context.role === "customer"} />;
}
