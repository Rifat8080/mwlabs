import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  const params = await searchParams;
  const requested = typeof params.next === "string" ? params.next : "/auth/continue";
  const nextPath =
    requested.startsWith("/app") || requested === "/portal"
      ? requested
      : "/auth/continue";

  return (
    <AuthForm
      mode="sign-in"
      googleEnabled={Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)}
      nextPath={nextPath}
    />
  );
}
