"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, LoaderCircle, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

type AuthFormProps = {
  mode: "sign-in" | "sign-up";
  googleEnabled: boolean;
  nextPath?: string;
};

function makeSlug(value: string) {
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${normalized || "agency"}-${crypto.randomUUID().slice(0, 5)}`;
}

export function AuthForm({ mode, googleEnabled, nextPath = "/auth/continue" }: AuthFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const signUpMode = mode === "sign-up";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? "").trim();
    const agency = String(form.get("agency") ?? "").trim();

    if (!email || password.length < 10 || (signUpMode && (!name || !agency))) {
      toast.error("Check the form", {
        description: "Use a valid email and a password of at least 10 characters.",
      });
      return;
    }

    setPending(true);
    try {
      if (signUpMode) {
        const result = await authClient.signUp.email({ email, password, name });
        if (result.error) throw new Error(result.error.message);

        const workspace = await authClient.organization.create({
          name: agency,
          slug: makeSlug(agency),
        });
        if (workspace.error || !workspace.data) {
          throw new Error(workspace.error?.message ?? "Could not create the workspace.");
        }
        await authClient.organization.setActive({ organizationId: workspace.data.id });
        await fetch("/api/registrations/owner", { method: "POST" });
        toast.success("Your agency workspace is ready");
        router.push("/app");
      } else {
        const result = await authClient.signIn.email({
          email,
          password,
          rememberMe: true,
        });
        if (result.error) throw new Error(result.error.message);
        router.push(nextPath);
      }
      router.refresh();
    } catch (error) {
      toast.error(signUpMode ? "Could not create your workspace" : "Could not sign in", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setPending(false);
    }
  }

  async function handleGoogle() {
    setPending(true);
    const result = await authClient.signIn.social({
      provider: "google",
      callbackURL: nextPath,
      newUserCallbackURL: "/auth/continue",
    });
    if (result?.error) {
      setPending(false);
      toast.error("Google sign-in failed", { description: result.error.message });
    }
  }

  return (
    <div className="grid min-h-[calc(100svh-4.5rem)] pt-18 lg:grid-cols-[0.92fr_1.08fr]">
      <section className="flex items-center justify-center px-5 py-14 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-9">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {signUpMode ? "Start your command center" : "Welcome back"}
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
              {signUpMode ? "Set up M&W Command." : "Continue to M&W Command."}
            </h1>
            <p className="mt-4 leading-7 text-muted-foreground">
              {signUpMode
                ? "Create the first owner account for M&W Labs. Disable initial signup immediately afterward."
                : "Return to the private operating system for M&W Labs."}
            </p>
          </div>

          {googleEnabled && (
            <Button type="button" variant="outline" className="h-11 w-full" onClick={handleGoogle} disabled={pending}>
              <span className="grid size-5 place-items-center rounded-full bg-white text-xs font-bold text-[#4285f4] shadow-sm">G</span>
              Continue with Google
            </Button>
          )}

          {googleEnabled && (
            <div className="my-6 flex items-center gap-4 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> or use email <span className="h-px flex-1 bg-border" />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {signUpMode && (
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Your name</Label>
                  <Input id="name" name="name" autoComplete="name" placeholder="Avery Kim" required className="h-11 bg-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agency">Agency name</Label>
                  <Input id="agency" name="agency" autoComplete="organization" defaultValue="M&W Labs" required className="h-11 bg-white" />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Work email</Label>
              <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@mwlabs.digital" required className="h-11 bg-white" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {!signUpMode && <span className="text-xs text-muted-foreground">10+ characters</span>}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={signUpMode ? "new-password" : "current-password"}
                  minLength={10}
                  maxLength={128}
                  required
                  className="h-11 bg-white pr-11"
                />
                <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="h-12 w-full bg-foreground text-background hover:bg-foreground/88" disabled={pending}>
              {pending ? <LoaderCircle className="size-4 animate-spin" /> : signUpMode ? "Create my workspace" : "Sign in"}
              {!pending && <ArrowRight className="size-4" />}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {signUpMode ? "Already have access?" : "Planning a project?"}{" "}
            <Link href={signUpMode ? "/sign-in" : "/register"} className="font-semibold text-foreground underline underline-offset-4">
              {signUpMode ? "Sign in" : "Register with M&W"}
            </Link>
          </p>
          <p className="mt-7 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" /> Encrypted, role-scoped, database-backed sessions
          </p>
        </div>
      </section>

      <aside className="noise relative hidden overflow-hidden bg-brand-ink p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-40 -top-28 size-[620px] rounded-full border border-white/8">
          <div className="absolute inset-16 rounded-full border border-accent/25" />
          <div className="absolute inset-36 rounded-full bg-accent/8 blur-2xl" />
        </div>
        <div className="relative z-10 flex justify-end"><Sparkles className="size-6 text-accent" /></div>
        <div className="relative z-10 max-w-xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">Today in your agency</p>
          <blockquote className="mt-6 text-balance text-4xl font-medium leading-[1.08] tracking-[-0.045em]">
            “I found the client risk, revised the resource plan, and drafted tomorrow&apos;s priorities.”
          </blockquote>
          <div className="mt-9 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-accent text-accent-foreground"><Sparkles className="size-4" /></span>
            <div><p className="text-sm font-semibold">M&amp;W Intelligence</p><p className="text-xs text-white/42">The agency&apos;s second brain</p></div>
          </div>
        </div>
        <div className="relative z-10 grid grid-cols-3 gap-3">
          {[['$114k', 'weighted pipeline'], ['57.8%', 'gross margin'], ['91%', 'on-time work']].map(([value, label]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xl font-semibold">{value}</p><p className="mt-1 text-[11px] text-white/40">{label}</p></div>
          ))}
        </div>
      </aside>
    </div>
  );
}
