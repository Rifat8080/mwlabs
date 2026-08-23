"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export function PasswordRecoveryForm() {
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    if (!email) return;

    setPending(true);
    const result = await authClient.requestPasswordReset({ email, redirectTo: "/reset-password" });
    setPending(false);
    if (result.error) {
      toast.error("Could not send the reset link", { description: result.error.message });
      return;
    }
    setSent(true);
  }

  return (
    <div className="mx-auto w-full max-w-md px-5 py-24 sm:px-0">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Account recovery</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em]">Reset your password.</h1>
      <p className="mt-4 leading-7 text-muted-foreground">Enter your work email and we&apos;ll send a secure reset link.</p>
      {sent ? (
        <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-900">
          If an account exists for that email, a reset link is on its way. Check your inbox and spam folder.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Work email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required className="h-11 bg-white" />
          </div>
          <Button type="submit" className="h-12 w-full bg-foreground text-background hover:bg-foreground/88" disabled={pending}>
            {pending ? <LoaderCircle className="size-4 animate-spin" /> : "Email me a reset link"}
            {!pending && <ArrowRight className="size-4" />}
          </Button>
        </form>
      )}
      <p className="mt-7 text-center text-sm text-muted-foreground"><Link href="/sign-in" className="font-semibold text-foreground underline underline-offset-4">Back to sign in</Link></p>
    </div>
  );
}

export function ResetPasswordForm({ token }: { token?: string }) {
  const [pending, setPending] = useState(false);
  const [complete, setComplete] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const password = String(new FormData(event.currentTarget).get("password") ?? "");
    if (!token || password.length < 10) {
      toast.error("Use a password of at least 10 characters.");
      return;
    }
    setPending(true);
    const result = await authClient.resetPassword({ newPassword: password, token });
    setPending(false);
    if (result.error) {
      toast.error("Could not reset your password", { description: result.error.message });
      return;
    }
    setComplete(true);
  }

  return (
    <div className="mx-auto w-full max-w-md px-5 py-24 sm:px-0">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Account recovery</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em]">Choose a new password.</h1>
      {complete ? (
        <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-900">Your password has been changed and other sessions have been signed out.</div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input id="password" name="password" type="password" autoComplete="new-password" minLength={10} maxLength={128} required className="h-11 bg-white" />
          </div>
          <Button type="submit" className="h-12 w-full bg-foreground text-background hover:bg-foreground/88" disabled={pending || !token}>
            {pending ? <LoaderCircle className="size-4 animate-spin" /> : "Change password"}
            {!pending && <ArrowRight className="size-4" />}
          </Button>
        </form>
      )}
      <p className="mt-7 text-center text-sm text-muted-foreground"><Link href="/sign-in" className="font-semibold text-foreground underline underline-offset-4">Back to sign in</Link></p>
    </div>
  );
}