import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Create your workspace" };
export const dynamic = "force-dynamic";

export default function SignUpPage() {
  if (process.env.ALLOW_INITIAL_SIGNUP !== "true") redirect("/sign-in");

  return (
    <AuthForm
      mode="sign-up"
      googleEnabled={Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)}
    />
  );
}
