import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { LeadRegistrationForm } from "@/components/auth/lead-registration-form";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Register your project",
  description: "Create a secure M&W Labs project profile and enter the lead workflow.",
};
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const [session, workspace] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    db.organization.findUnique({ where: { slug: "mw-labs" }, select: { id: true } }),
  ]);

  if (!session?.user?.id) {
    return <LeadRegistrationForm workspaceReady={Boolean(workspace)} />;
  }

  const [membership, lead, user] = await Promise.all([
    db.member.findFirst({ where: { userId: session.user.id }, select: { id: true } }),
    db.lead.findUnique({ where: { userId: session.user.id }, select: { id: true } }),
    db.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        company: true,
        phone: true,
        serviceInterest: true,
        budgetRange: true,
        projectBrief: true,
      },
    }),
  ]);

  if (membership) redirect("/app");
  if (lead) redirect("/portal");

  return (
    <LeadRegistrationForm
      profileOnly
      workspaceReady={Boolean(workspace)}
      defaults={{
        name: user?.name ?? session.user.name,
        email: user?.email ?? session.user.email,
        company: user?.company ?? undefined,
        phone: user?.phone ?? undefined,
        serviceInterest: user?.serviceInterest ?? undefined,
        budgetRange: user?.budgetRange ?? undefined,
        projectBrief: user?.projectBrief ?? undefined,
      }}
    />
  );
}
