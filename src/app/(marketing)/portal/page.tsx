import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CalendarCheck2,
  Check,
  Circle,
  Clock3,
  FileCheck2,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { LeadPortalActions } from "@/components/auth/lead-portal-actions";
import { LocalMeetingTime } from "@/components/marketing/timezone-control";
import { getCurrentAuthSession } from "@/lib/dal";
import { db } from "@/lib/db";
import { createBookingManagePath } from "@/lib/scheduling";

export const metadata: Metadata = { title: "Your project status" };
export const dynamic = "force-dynamic";

const workflow = [
  { stage: "New", title: "Registered", copy: "Your project profile is securely in our CRM." },
  { stage: "Qualified", title: "Fit review", copy: "We review goals, scope, budget and timing." },
  { stage: "Discovery", title: "Discovery booked", copy: "Your strategy conversation and calendar invitation are confirmed." },
  { stage: "Proposal", title: "Proposal", copy: "You receive the recommended approach and investment." },
  { stage: "Negotiation", title: "Decision", copy: "We resolve scope and commercial questions together." },
  { stage: "Won", title: "Kickoff", copy: "The approved opportunity moves into client onboarding." },
];

export default async function LeadPortalPage() {
  const session = await getCurrentAuthSession();
  if (!session?.user?.id) redirect("/sign-in?next=/portal");

  const [membership, lead, user] = await Promise.all([
    db.member.findFirst({ where: { userId: session.user.id }, select: { id: true } }),
    db.lead.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        company: true,
        stage: true,
        score: true,
        nextActivityAt: true,
        createdAt: true,
        activities: {
          orderBy: { occurredAt: "desc" },
          take: 4,
          select: { id: true, title: true, body: true, occurredAt: true },
        },
        calendarEvents: {
          where: { status: "Scheduled", startAt: { gte: new Date() } },
          orderBy: { startAt: "asc" },
          take: 1,
          select: { id: true, title: true, startAt: true, endAt: true, timezone: true, location: true, bookingReference: true },
        },
      },
    }),
    db.user.findUnique({
      where: { id: session.user.id },
      select: { serviceInterest: true, budgetRange: true },
    }),
  ]);

  if (membership) redirect("/app");
  if (!lead) redirect("/register?step=profile");

  const stageIndex = lead.stage === "Lost"
    ? 0
    : Math.max(0, workflow.findIndex((item) => item.stage === lead.stage));
  const nextStep = workflow[Math.min(stageIndex + 1, workflow.length - 1)];
  const upcomingMeeting = lead.calendarEvents[0];
  const manageMeetingPath = upcomingMeeting?.bookingReference ? createBookingManagePath(upcomingMeeting.id) : null;
  const firstName = session.user.name.split(" ")[0];

  return (
    <div className="relative isolate overflow-hidden bg-[#f7faff] pb-20 pt-14 sm:pt-20 lg:pb-28 lg:pt-24">
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_12%_18%,rgba(37,99,235,0.12),transparent_28rem),radial-gradient(circle_at_88%_22%,rgba(34,211,238,0.14),transparent_28rem)]" />
      <div className="marketing-grid pointer-events-none absolute inset-0 -z-10 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_90%)]" />

      <div className="mx-auto max-w-[94rem] px-4 sm:px-6 lg:px-12">
        <header className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-[0.6rem] font-black uppercase tracking-[0.17em] text-emerald-700">
              <span className="size-2 rounded-full bg-emerald-500" /> Secure project profile active
            </div>
            <h1 className="mt-5 text-4xl font-black tracking-[-0.055em] text-slate-950 sm:text-6xl">
              Welcome, {firstName}. <span className="text-gradient">We have your brief.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-slate-600 sm:text-base">
              Follow your opportunity through the M&amp;W workflow, book discovery, and manage confirmed meeting times from one secure place.
            </p>
          </div>
          <LeadPortalActions />
        </header>

        <section className="mt-10 overflow-hidden rounded-[2rem] border border-white/95 bg-white/86 shadow-[0_30px_100px_rgba(22,55,120,0.12)] ring-1 ring-blue-100/70 backdrop-blur-2xl sm:rounded-[2.5rem]">
          <div className="grid gap-4 border-b border-blue-50 bg-[linear-gradient(135deg,#f8fbff,#ffffff_60%,#ecfeff)] p-5 sm:grid-cols-2 sm:p-8 lg:grid-cols-4">
            {[
              { label: "Opportunity", value: lead.company },
              { label: "Current stage", value: lead.stage },
              { label: "Primary need", value: user?.serviceInterest ?? "General enquiry" },
              { label: "Indicative budget", value: user?.budgetRange ?? "To be discussed" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white bg-white/74 p-4 shadow-sm">
                <p className="text-[0.55rem] font-black uppercase tracking-[0.17em] text-slate-400">{item.label}</p>
                <p className="mt-2 truncate text-sm font-black text-slate-950">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="p-5 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-blue-600">Lead workflow</p>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] text-slate-950 sm:text-3xl">A clear path from idea to kickoff.</h2>
              </div>
              <p className="flex items-center gap-2 text-xs font-bold text-slate-500"><ShieldCheck className="size-4 text-blue-600" /> Visible only to you and M&amp;W Labs</p>
            </div>

            <div className="mt-8 grid gap-3 lg:grid-cols-6">
              {workflow.map((item, index) => {
                const completed = index < stageIndex || lead.stage === "Won";
                const active = index === stageIndex && lead.stage !== "Lost";
                return (
                  <article key={item.stage} className={`relative rounded-2xl border p-4 transition ${active ? "border-slate-950 bg-slate-950 text-white shadow-[0_18px_45px_rgba(15,23,42,0.2)]" : completed ? "border-blue-100 bg-blue-50/70 text-slate-900" : "border-slate-100 bg-white text-slate-500"}`}>
                    <div className="flex items-center justify-between">
                      <span className={`grid size-8 place-items-center rounded-full ${active ? "bg-cyan-400 text-slate-950" : completed ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                        {completed ? <Check className="size-4" /> : <Circle className="size-3.5" />}
                      </span>
                      <span className={`text-[0.5rem] font-black tracking-[0.16em] ${active ? "text-cyan-200" : "text-slate-400"}`}>0{index + 1}</span>
                    </div>
                    <h3 className="mt-4 text-sm font-black">{item.title}</h3>
                    <p className={`mt-2 text-xs font-semibold leading-5 ${active ? "text-slate-300" : "text-slate-500"}`}>{item.copy}</p>
                    {index < workflow.length - 1 && <ArrowRight className="absolute -right-2.5 top-1/2 z-10 hidden size-4 -translate-y-1/2 text-blue-300 lg:block" />}
                  </article>
                );
              })}
            </div>

            {lead.stage === "Lost" && (
              <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
                This opportunity is currently closed. Contact M&amp;W Labs if you would like us to reopen it.
              </p>
            )}
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          <section className="rounded-[1.75rem] bg-slate-950 p-6 text-white shadow-[0_26px_70px_rgba(15,23,42,0.2)] sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <span className="grid size-11 place-items-center rounded-xl bg-cyan-400 text-slate-950"><Sparkles className="size-4" /></span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[0.55rem] font-black uppercase tracking-[0.14em] text-cyan-200">Next milestone</span>
            </div>
            <p className="mt-7 text-[0.58rem] font-black uppercase tracking-[0.18em] text-cyan-300">Coming next</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">{upcomingMeeting ? "Discovery booked" : nextStep.title}</h2>
            <p className="mt-3 text-sm font-semibold leading-7 text-slate-300">
              {upcomingMeeting
                ? <>{upcomingMeeting.title} is confirmed for <LocalMeetingTime value={upcomingMeeting.startAt.toISOString()} fallbackTimezone={upcomingMeeting.timezone ?? "UTC"} />.</>
                : nextStep.copy}
            </p>
            <div className="mt-7 flex items-center gap-3 border-t border-white/10 pt-5 text-xs font-bold text-slate-400">
              <CalendarCheck2 className="size-4 text-cyan-300" />
              {upcomingMeeting
                ? "Calendar confirmed · shown in your current timezone"
                : lead.nextActivityAt
                ? `Follow-up planned for ${lead.nextActivityAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`
                : "M&W Labs will confirm the next activity shortly."}
            </div>
            {upcomingMeeting ? (
              manageMeetingPath && <Link href={manageMeetingPath} className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-cyan-400 px-4 text-xs font-black text-slate-950 transition hover:bg-cyan-300">Reschedule or cancel</Link>
            ) : !["Proposal", "Negotiation", "Won", "Lost"].includes(lead.stage) ? (
              <Link href="/book" className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-cyan-400 px-4 text-xs font-black text-slate-950 transition hover:bg-cyan-300"><CalendarCheck2 className="mr-2 size-4" /> Book discovery call</Link>
            ) : null}
          </section>

          <section className="rounded-[1.75rem] border border-blue-100 bg-white/88 p-6 shadow-[0_22px_65px_rgba(37,99,235,0.08)] backdrop-blur-xl sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div><p className="text-[0.58rem] font-black uppercase tracking-[0.18em] text-blue-600">Activity</p><h2 className="mt-2 text-2xl font-black tracking-[-0.035em] text-slate-950">Your opportunity timeline</h2></div>
              <MessageSquareText className="size-5 text-blue-300" />
            </div>
            <div className="mt-6 space-y-4">
              {lead.activities.length > 0 ? lead.activities.map((activity) => (
                <div key={activity.id} className="flex gap-3">
                  <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600"><FileCheck2 className="size-3.5" /></span>
                  <div className="min-w-0 flex-1 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm font-black text-slate-900">{activity.title}</p><p className="flex items-center gap-1 text-[0.62rem] font-bold text-slate-400"><Clock3 className="size-3" /> {activity.occurredAt.toLocaleDateString("en-GB")}</p></div>
                    {activity.body && <p className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-slate-500">{activity.body}</p>}
                  </div>
                </div>
              )) : (
                <p className="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">Your first review activity will appear here.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
