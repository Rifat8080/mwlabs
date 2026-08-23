"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle, ShieldCheck, UsersRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient, useSession } from "@/lib/auth-client";

export function InvitationAcceptance({ invitationId }: { invitationId: string }) {
  const router = useRouter();
  const session = useSession();
  const [mode, setMode] = useState<"sign-in" | "create">("sign-in");
  const [pending, setPending] = useState(false);

  async function accept() {
    const result = await authClient.organization.acceptInvitation({ invitationId });
    if (result.error) throw new Error(result.error.message);
    const organizationId = result.data?.member?.organizationId ?? result.data?.invitation?.organizationId;
    if (organizationId) await authClient.organization.setActive({ organizationId });
    toast.success("Invitation accepted", { description: "Welcome to the agency workspace." });
    router.push("/app");
    router.refresh();
  }

  async function authenticate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? "").trim();
    setPending(true);
    try {
      const result = mode === "create"
        ? await authClient.signUp.email({ email, password, name })
        : await authClient.signIn.email({ email, password, rememberMe: true });
      if (result.error) throw new Error(result.error.message);
      await accept();
    } catch (error) {
      toast.error(mode === "create" ? "Could not join the workspace" : "Could not sign in", { description: error instanceof Error ? error.message : "Check your invitation and account details." });
    } finally {
      setPending(false);
    }
  }

  async function acceptCurrentSession() {
    setPending(true);
    try { await accept(); }
    catch (error) { toast.error("Could not accept this invitation", { description: error instanceof Error ? error.message : "The invitation may be expired or intended for another email." }); }
    finally { setPending(false); }
  }

  return (
    <main className="grid min-h-svh place-items-center bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_35%),linear-gradient(#f8fafc,#fff)] px-5 py-16">
      <div className="w-full max-w-lg rounded-3xl border bg-white p-7 shadow-[0_28px_80px_rgba(15,23,42,0.12)] sm:p-10">
        <span className="grid size-12 place-items-center rounded-2xl bg-brand-navy text-cyan-300"><UsersRound className="size-5" /></span>
        <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-600">Agency invitation</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.045em]">Join the M&amp;W Command workspace.</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">Use the exact email address that received this private invitation. The link expires after 48 hours.</p>

        {session.isPending ? <div className="grid h-36 place-items-center"><LoaderCircle className="size-6 animate-spin text-blue-600" /></div> : session.data?.user ? (
          <div className="mt-7 rounded-2xl border bg-muted/25 p-5">
            <p className="text-xs text-muted-foreground">Signed in as</p><p className="mt-1 text-sm font-semibold">{session.data.user.name}</p><p className="text-xs text-muted-foreground">{session.data.user.email}</p>
            <Button className="mt-5 w-full" onClick={() => void acceptCurrentSession()} disabled={pending}>{pending ? <LoaderCircle className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}Accept invitation</Button>
          </div>
        ) : (
          <>
            <div className="mt-7 grid grid-cols-2 rounded-xl bg-muted p-1"><button type="button" onClick={() => setMode("sign-in")} className={`rounded-lg px-3 py-2 text-xs font-semibold ${mode === "sign-in" ? "bg-white shadow-sm" : "text-muted-foreground"}`}>I have an account</button><button type="button" onClick={() => setMode("create")} className={`rounded-lg px-3 py-2 text-xs font-semibold ${mode === "create" ? "bg-white shadow-sm" : "text-muted-foreground"}`}>Create my account</button></div>
            <form key={mode} onSubmit={authenticate} className="mt-5 space-y-4">
              {mode === "create" && <div className="space-y-2"><Label htmlFor="invite-name">Your name</Label><Input id="invite-name" name="name" required autoComplete="name" /></div>}
              <div className="space-y-2"><Label htmlFor="invite-account-email">Invited email</Label><Input id="invite-account-email" name="email" type="email" required autoComplete="email" /></div>
              <div className="space-y-2"><Label htmlFor="invite-password">Password</Label><Input id="invite-password" name="password" type="password" minLength={10} maxLength={128} required autoComplete={mode === "create" ? "new-password" : "current-password"} /><p className="text-[10px] text-muted-foreground">At least 10 characters.</p></div>
              <Button type="submit" className="h-11 w-full" disabled={pending}>{pending ? <LoaderCircle className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}{mode === "create" ? "Create account and join" : "Sign in and join"}</Button>
            </form>
          </>
        )}
        <p className="mt-7 flex items-center gap-2 text-[11px] leading-5 text-muted-foreground"><ShieldCheck className="size-4 shrink-0 text-emerald-600" />Access is organization-scoped and the invitation can only be accepted by its intended email.</p>
      </div>
    </main>
  );
}
