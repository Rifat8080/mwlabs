import { redirect } from "next/navigation";

import { getCurrentAuthSession } from "@/lib/dal";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AuthContinuePage() {
  const session = await getCurrentAuthSession();
  if (!session?.user?.id) redirect("/sign-in");

  const [membership, lead] = await Promise.all([
    db.member.findFirst({ where: { userId: session.user.id }, select: { id: true } }),
    db.lead.findFirst({ where: { userId: session.user.id }, select: { id: true } }),
  ]);

  if (membership) redirect("/app");
  if (lead) redirect("/app");
  redirect("/register?step=profile");
}
