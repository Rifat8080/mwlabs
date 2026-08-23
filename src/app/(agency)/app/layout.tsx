import { AgencyShell } from "@/components/agency/agency-shell";
import { getWorkspaceContext } from "@/lib/dal";

export default async function AgencyLayout({ children }: LayoutProps<"/app">) {
  const context = await getWorkspaceContext();

  return (
    <AgencyShell
      user={context.user}
      organization={context.organization}
      role={context.role}
    >
      {children}
    </AgencyShell>
  );
}
