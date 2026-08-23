import type { Metadata } from "next";

import { ResetPasswordForm } from "@/components/auth/password-recovery-form";

export const metadata: Metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const params = await searchParams;
  return <ResetPasswordForm token={typeof params.token === "string" ? params.token : undefined} />;
}