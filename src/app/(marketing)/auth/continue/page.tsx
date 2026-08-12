import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AuthContinuePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) redirect("/sign-in");

  const [membership, lead] = await Promise.all([
    db.member.findFirst({ where: { userId: session.user.id }, select: { id: true } }),
    db.lead.findUnique({ where: { userId: session.user.id }, select: { id: true } }),
  ]);

  if (membership) redirect("/app");
  if (lead) redirect("/portal");
  redirect("/register?step=profile");
}
