"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, LoaderCircle, LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

export function LeadPortalActions() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    const result = await authClient.signOut();
    if (result.error) {
      setPending(false);
      toast.error("Could not sign out", { description: result.error.message });
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2 min-[420px]:flex-row">
      <Link href="/" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-blue-100 bg-white px-4 text-xs font-black text-slate-700 transition hover:border-blue-200 hover:text-blue-700">
        <Home className="mr-2 size-3.5" /> Website
      </Link>
      <button type="button" onClick={signOut} disabled={pending} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-950 px-4 text-xs font-black text-white transition hover:bg-blue-700 disabled:opacity-60">
        {pending ? <LoaderCircle className="mr-2 size-3.5 animate-spin" /> : <LogOut className="mr-2 size-3.5" />}
        Sign out
      </button>
    </div>
  );
}
