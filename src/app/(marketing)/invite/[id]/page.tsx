import type { Metadata } from "next";

import { InvitationAcceptance } from "@/components/auth/invitation-acceptance";

export const metadata: Metadata = { title: "Accept workspace invitation" };

export default async function InvitationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <InvitationAcceptance invitationId={id} />;
}
