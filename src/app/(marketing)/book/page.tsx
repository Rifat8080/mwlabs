import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock3, ShieldCheck, Sparkles } from "lucide-react";

import { NativeScheduler } from "@/components/marketing/native-scheduler";
import { getCurrentAuthSession } from "@/lib/dal";
import { db } from "@/lib/db";
import { readLeadBookingToken } from "@/lib/scheduling";

export const metadata: Metadata = {
  title: "Book a discovery call",
  description: "Choose a convenient time for a focused discovery call with M&W Labs.",
  robots: { index: false, follow: true },
};
export const dynamic = "force-dynamic";

export default async function BookDiscoveryPage({ searchParams }: PageProps<"/book">) {
  const query = await searchParams;
  const tokenLeadId = readLeadBookingToken(query.lead);
  const session = await getCurrentAuthSession();

  const lead = tokenLeadId
    ? await db.lead.findFirst({
        where: { id: tokenLeadId, organization: { slug: "mw-labs" } },
        select: { name: true, email: true, phone: true, company: true },
      })
    : session?.user?.id
      ? await db.lead.findFirst({
          where: { userId: session.user.id },
          select: { name: true, email: true, phone: true, company: true },
        })
      : null;

  const profile = session?.user?.id
    ? await db.user.findUnique({ where: { id: session.user.id }, select: { serviceInterest: true } })
    : null;

  return (
    <div className="relative isolate overflow-hidden bg-[#f7faff] pb-20 pt-14 sm:pt-20 lg:pb-28 lg:pt-24">
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_12%_18%,rgba(37,99,235,0.12),transparent_28rem),radial-gradient(circle_at_88%_24%,rgba(34,211,238,0.14),transparent_30rem)]" />
      <div className="marketing-grid pointer-events-none absolute inset-0 -z-10 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_90%)]" />

      <div className="mx-auto max-w-[92rem] px-4 sm:px-6 lg:px-12">
        <Link href="/" className="inline-flex items-center text-xs font-black text-blue-700 transition hover:text-blue-900"><ArrowLeft className="mr-2 size-4" /> Back to M&amp;W Labs</Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-[0.68fr_1.32fr] lg:items-start lg:gap-14">
          <section className="lg:sticky lg:top-32">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-[0.6rem] font-black uppercase tracking-[0.17em] text-emerald-700">
              <span className="size-2 rounded-full bg-emerald-500" /> Live availability
            </div>
            <h1 className="mt-6 text-5xl font-black leading-[0.94] tracking-[-0.06em] text-slate-950 sm:text-6xl">Book a focused <span className="text-gradient">discovery call.</span></h1>
            <p className="mt-6 max-w-xl text-base font-semibold leading-8 text-slate-600">Choose a time that works for you. We’ll use the conversation to clarify the opportunity, expected outcomes, timing, and the smartest next step.</p>

            <div className="mt-8 space-y-3">
              {[
                { icon: Clock3, title: "A focused conversation", copy: "No generic sales script—just goals, constraints, and useful next steps." },
                { icon: ShieldCheck, title: "Connected to your CRM record", copy: "The booking, status, and follow-up stay attached to one secure opportunity." },
                { icon: CheckCircle2, title: "Instant booking confirmation", copy: "Your meeting is saved directly in our CRM with private reschedule and cancellation controls." },
              ].map(({ icon: Icon, title, copy }) => (
                <div key={title} className="flex gap-4 rounded-2xl border border-white bg-white/72 p-4 shadow-[0_14px_40px_rgba(37,99,235,0.06)] backdrop-blur-xl">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-slate-950 text-cyan-300"><Icon className="size-4" /></span>
                  <div><p className="text-sm font-black text-slate-950">{title}</p><p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{copy}</p></div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-xs font-bold leading-5 text-blue-900">
              <Sparkles className="size-4 shrink-0 text-blue-600" /> Your name and email are prefilled when you arrive from an enquiry or your secure portal.
            </div>
          </section>

          <section><NativeScheduler name={lead?.name ?? session?.user?.name} email={lead?.email ?? session?.user?.email} phone={lead?.phone ?? undefined} company={lead?.company ?? undefined} service={profile?.serviceInterest ?? undefined} leadToken={typeof query.lead === "string" ? query.lead : undefined} initialType={typeof query.type === "string" ? query.type : undefined} /></section>
        </div>
      </div>
    </div>
  );
}
