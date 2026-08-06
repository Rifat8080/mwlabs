import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  BriefcaseBusiness,
  CalendarCheck2,
  Check,
  Clapperboard,
  ClipboardList,
  Code2,
  Compass,
  Globe2,
  Lightbulb,
  LineChart,
  Megaphone,
  MessageSquareQuote,
  MousePointerClick,
  PenTool,
  Rocket,
  SearchCheck,
  Send,
  ShieldCheck,
  Smile,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

import { GrowthSystemShowcase } from "@/components/marketing/growth-system-showcase";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { MarketingReception, ProjectEnquiryForm, TestimonialsCarousel } from "@/components/marketing/marketing-interactions";
import { Reveal } from "@/components/marketing/reveal";

type Service = {
  icon: LucideIcon;
  title: string;
  copy: string;
  tone: string;
};

const services: Service[] = [
  { icon: Code2, title: "Web & Software Development", copy: "Custom websites, web apps, SaaS platforms, dashboards and business systems.", tone: "bg-blue-600 text-white" },
  { icon: Megaphone, title: "Digital Marketing", copy: "SEO, Google & Meta Ads, lead generation, funnels, email and WhatsApp marketing.", tone: "bg-cyan-50 text-cyan-700" },
  { icon: PenTool, title: "Branding & Design", copy: "Logo design, brand identity, social media creatives, brochures and more.", tone: "bg-blue-50 text-blue-700" },
  { icon: Clapperboard, title: "Video Editing & Content", copy: "Reels, YouTube videos, ads, corporate videos, motion graphics and more.", tone: "bg-slate-100 text-slate-700" },
  { icon: Bot, title: "AI & Automation", copy: "AI chatbots, agents, workflows, dashboards and smart integrations.", tone: "bg-brand-navy text-cyan-300" },
  { icon: LineChart, title: "Growth Strategy", copy: "Business strategy, market research, competitor analysis and scaling plans.", tone: "bg-indigo-50 text-indigo-700" },
];

const benefits = [
  "Result-driven strategies that bring real business growth",
  "Creative, modern and conversion-focused solutions",
  "Transparent communication and on-time delivery",
  "A dedicated team that cares about your success",
];

const stats = [
  { icon: BriefcaseBusiness, value: "500+", label: "Projects Completed" },
  { icon: Smile, value: "300+", label: "Happy Clients" },
  { icon: Trophy, value: "5+", label: "Years of Experience" },
  { icon: Globe2, value: "20+", label: "Countries Served" },
];

const process = [
  { icon: SearchCheck, title: "Discover", copy: "We understand your goals, audience and requirements." },
  { icon: ClipboardList, title: "Plan", copy: "We create a strategic plan tailored to your business." },
  { icon: Code2, title: "Build", copy: "Our experts design, develop and create with precision." },
  { icon: Rocket, title: "Launch", copy: "We test everything and launch for maximum impact." },
  { icon: LineChart, title: "Grow", copy: "We analyze, optimize and scale your business growth." },
];

const insights = [
  { icon: Lightbulb, title: "Every Day Is a Learning Day as an Agency Owner", date: "July 14, 2026", read: "2 min read", tone: "from-blue-600 to-cyan-400" },
  { icon: Rocket, title: "5 Signs Your Startup Idea Is Ready for an MVP", date: "July 07, 2026", read: "4 min read", tone: "from-brand-navy to-blue-600" },
  { icon: Users, title: "Technology, Purpose, and Meaningful Global Impact", date: "June 17, 2026", read: "4 min read", tone: "from-blue-500 to-indigo-700" },
];

function SectionHeading({ eyebrow, children, centered = false, inverse = false }: { eyebrow: string; children: React.ReactNode; centered?: boolean; inverse?: boolean }) {
  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : ""}>
      <p className={`text-xs font-extrabold uppercase tracking-[0.28em] ${inverse ? "text-cyan-300" : "text-blue-600"}`}>{eyebrow}</p>
      <h2 className={`mt-4 text-4xl font-black leading-[0.98] tracking-[-0.045em] sm:text-5xl ${inverse ? "text-white" : "text-slate-950"}`}>{children}</h2>
    </div>
  );
}

function ProjectVisual({ variant }: { variant: "builders" | "removal" }) {
  if (variant === "builders") {
    return (
      <div className="relative aspect-video overflow-hidden bg-[linear-gradient(135deg,#eff6ff,#ffffff_50%,#cffafe)] p-5 sm:p-7">
        <div className="absolute -right-10 -top-14 size-48 rounded-full bg-blue-300/35 blur-3xl" />
        <div className="relative mx-auto h-full max-w-xl overflow-hidden rounded-xl border border-white/90 bg-white shadow-2xl shadow-blue-900/15">
          <div className="flex h-7 items-center gap-1.5 border-b border-blue-50 px-3"><span className="size-1.5 rounded-full bg-red-300" /><span className="size-1.5 rounded-full bg-amber-300" /><span className="size-1.5 rounded-full bg-emerald-300" /></div>
          <div className="grid h-[calc(100%-1.75rem)] grid-cols-[0.9fr_1.1fr]">
            <div className="flex flex-col justify-center p-4 sm:p-6"><span className="h-2 w-16 rounded-full bg-blue-200" /><span className="mt-3 h-5 w-full rounded bg-slate-900" /><span className="mt-2 h-5 w-3/4 rounded bg-slate-900" /><span className="mt-4 h-2 w-full rounded bg-slate-200" /><span className="mt-2 h-2 w-4/5 rounded bg-slate-200" /><span className="mt-5 h-7 w-24 rounded-lg bg-blue-600" /></div>
            <div className="m-3 overflow-hidden rounded-lg bg-[linear-gradient(145deg,#155dfc,#02d1fa)] p-4"><div className="h-full rounded-lg border border-white/25 bg-white/10 backdrop-blur"><div className="mx-auto mt-4 h-[75%] w-3/4 rounded-t-full bg-white/15" /></div></div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="relative aspect-video overflow-hidden bg-slate-950 p-5 sm:p-7">
      <div className="absolute -left-10 top-1/2 size-48 -translate-y-1/2 rounded-full bg-blue-600/35 blur-3xl" />
      <div className="relative mx-auto grid h-full max-w-xl grid-cols-[70px_1fr] overflow-hidden rounded-xl border border-white/15 bg-white/10 shadow-2xl backdrop-blur">
        <div className="border-r border-white/10 p-3"><div className="size-8 rounded-lg bg-cyan-400" /><div className="mt-5 space-y-3">{[1, 2, 3, 4].map((item) => <div key={item} className="h-2 rounded-full bg-white/15" />)}</div></div>
        <div className="p-4"><div className="flex justify-between"><span className="h-3 w-28 rounded bg-white/80" /><span className="size-6 rounded-full bg-blue-400" /></div><div className="mt-4 grid grid-cols-3 gap-2">{["$82k", "38", "94%"].map((value) => <div key={value} className="rounded-lg bg-white/8 p-2"><p className="text-[9px] font-black text-white">{value}</p><div className="mt-2 h-1 rounded bg-cyan-400/50" /></div>)}</div><div className="mt-3 h-[45%] rounded-lg bg-white/6 p-3"><div className="flex h-full items-end gap-1">{[30, 46, 38, 64, 58, 78, 72, 90].map((height, index) => <div key={index} className="flex-1 rounded-t bg-gradient-to-t from-blue-600 to-cyan-300" style={{ height: `${height}%` }} />)}</div></div></div>
      </div>
    </div>
  );
}

export default function MarketingPage() {
  return (
    <>
      <MarketingHero />

      <section id="about" className="scroll-mt-28 bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-[104rem] px-4 sm:px-6 lg:px-12 2xl:px-16">
          <Reveal className="relative grid gap-8 overflow-hidden rounded-[2rem] border border-blue-100 bg-[radial-gradient(circle_at_top_right,#dbeafe,transparent_30rem),#f8fbff] p-5 shadow-[0_30px_90px_rgba(37,99,235,0.08)] sm:rounded-[2.5rem] sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center lg:p-12">
            <div className="pointer-events-none absolute -right-16 -top-20 size-48 rounded-full bg-blue-100/70 blur-3xl" />
            <div className="relative"><p className="text-xs font-extrabold uppercase tracking-[0.28em] text-blue-600">Who We Are</p><h2 className="mt-4 max-w-4xl text-4xl font-black leading-[1.02] tracking-[-0.045em] text-slate-950 sm:text-5xl">A senior digital team that thinks in outcomes, not deliverables.</h2><p className="mt-5 max-w-3xl text-sm font-semibold leading-8 text-slate-600 sm:text-base">M&amp;W Labs brings developers, marketers, designers, and strategists together as one focused team. From the first strategy session to launch and beyond, every decision connects creative quality to measurable growth.</p></div>
            <div className="relative flex flex-col gap-3 sm:flex-row lg:flex-col"><Link href="#enquiry" className="button-primary inline-flex items-center justify-center rounded-xl px-7 py-4 text-sm font-extrabold">Work With Us <Rocket className="ml-3 size-4" /></Link><Link href="#services" className="button-secondary inline-flex items-center justify-center rounded-xl px-7 py-4 text-sm font-extrabold">Explore Capabilities <Users className="ml-3 size-4" /></Link></div>
          </Reveal>
        </div>
      </section>

      <section id="services" className="relative scroll-mt-24 overflow-hidden bg-brand-ink py-20 text-white sm:py-28">
        <div className="absolute -left-28 top-12 size-96 rounded-full bg-blue-600/15 blur-[110px]" /><div className="absolute -right-36 bottom-0 size-[30rem] rounded-full bg-cyan-400/10 blur-[120px]" />
        <div className="mx-auto max-w-[104rem] px-4 sm:px-6 lg:px-12 2xl:px-16">
          <Reveal><SectionHeading eyebrow="Capabilities / 01—06" centered inverse>One studio. Every discipline needed to <span className="text-gradient-light">move forward.</span></SectionHeading></Reveal>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {services.map(({ icon: Icon, title, copy, tone }, index) => (
              <Reveal key={title} delay={index * 0.04} className="h-full">
                <article className="tilt-card group relative flex h-full min-h-72 flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-7 backdrop-blur transition hover:border-cyan-300/35 hover:bg-white/[0.075]">
                  <span className="absolute right-6 top-5 text-5xl font-black tracking-[-0.08em] text-white/[0.055]">0{index + 1}</span>
                  <span className={`grid size-14 place-items-center rounded-2xl shadow-2xl ${tone}`}><Icon className="size-6" /></span>
                  <h3 className="mt-7 text-2xl font-black leading-snug tracking-[-0.025em] text-white">{title}</h3>
                  <p className="mt-4 flex-1 text-sm font-semibold leading-7 text-slate-400">{copy}</p>
                  <Link href="#enquiry" className="mt-7 inline-flex items-center text-sm font-extrabold text-cyan-300">Discuss this capability <ArrowRight className="ml-2 size-4 transition group-hover:translate-x-1" /></Link>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="why" className="scroll-mt-24 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] py-20 sm:py-28">
        <div className="mx-auto grid max-w-[104rem] gap-10 px-4 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-center lg:px-12 2xl:px-16">
          <Reveal>
            <SectionHeading eyebrow="Why Choose M&W Labs?">We Don’t Just Deliver Services,<br />We Build <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Growth Systems.</span></SectionHeading>
            <div className="mt-7 space-y-4">{benefits.map((benefit) => <div key={benefit} className="flex items-start gap-3 text-sm font-bold text-slate-600"><span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/25"><Check className="size-3.5" /></span>{benefit}</div>)}</div>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row"><Link href="#about" className="button-primary inline-flex items-center justify-center rounded-xl px-7 py-4 text-sm font-extrabold">Meet the Studio <ArrowRight className="ml-3 size-4" /></Link><Link href="#enquiry" className="button-secondary inline-flex items-center justify-center rounded-xl px-7 py-4 text-sm font-extrabold">Get Growth Advice <Lightbulb className="ml-3 size-4" /></Link></div>
          </Reveal>
          <Reveal delay={0.08} className="space-y-6">
            <div className="grid gap-3 rounded-[1.75rem] border border-blue-100 bg-white p-4 shadow-[0_30px_80px_rgba(37,99,235,0.08)] sm:grid-cols-2 xl:grid-cols-4">{stats.map(({ icon: Icon, value, label }) => <div key={label} className="flex items-center gap-4 rounded-2xl p-3 transition hover:bg-blue-50/70"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-600"><Icon className="size-5" /></span><div><p className="text-3xl font-black tracking-[-0.04em] text-slate-950">{value}</p><p className="text-xs font-bold text-slate-500">{label}</p></div></div>)}</div>
            <div className="grid overflow-hidden rounded-[2rem] border border-blue-100 bg-slate-50 shadow-[0_30px_90px_rgba(15,23,42,0.08)] md:grid-cols-[0.42fr_0.58fr]">
              <div className="relative flex min-h-64 items-end justify-center overflow-hidden bg-gradient-to-br from-blue-50 to-white p-6"><div className="absolute inset-0 opacity-50 [background-image:radial-gradient(circle,#dbeafe_1px,transparent_1.4px)] [background-size:14px_14px]" /><div className="relative grid size-40 place-items-center rounded-full border-[14px] border-white bg-gradient-to-br from-blue-600 to-cyan-400 text-white shadow-2xl"><Users className="size-14" /></div></div>
              <div className="flex flex-col justify-center p-7 sm:p-10"><MessageSquareQuote className="size-9 text-blue-200" /><blockquote className="mt-4 text-lg font-bold leading-8 text-slate-700">M&amp;W Labs transformed our online presence completely. Their team is professional, creative, and delivers outstanding results!</blockquote><div className="mt-7"><p className="font-black text-slate-950">David Smith</p><p className="text-sm font-semibold text-slate-500">CEO, TechFlow</p></div></div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-white py-6 sm:py-10">
        <div className="mx-auto max-w-[104rem] px-4 sm:px-6 lg:px-12 2xl:px-16">
          <Reveal><GrowthSystemShowcase /></Reveal>
        </div>
      </section>

      <section id="work" className="scroll-mt-24 bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-[104rem] px-4 sm:px-6 lg:px-12 2xl:px-16">
          <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><SectionHeading eyebrow="Selected Work / 2026">Digital experiences designed to <span className="text-gradient">perform.</span></SectionHeading><p className="max-w-md text-sm font-semibold leading-7 text-slate-500">A selection of conversion-led platforms and operating systems built around real commercial goals.</p></Reveal>
          <div className="mt-12 grid gap-7 lg:grid-cols-2">
            {[
              { visual: "builders" as const, title: "Builders Website Design London", client: "Ravinder", copy: "A conversion-focused digital experience designed to turn local search traffic into qualified enquiries." },
              { visual: "removal" as const, title: "Removal System Design", client: "Md Liakat Kawser", copy: "A smarter digital operations system for the UK removal industry, from lead capture to delivery." },
            ].map((project, index) => <Reveal key={project.title} delay={index * 0.08}><article className="group overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)] transition duration-500 hover:-translate-y-2 hover:shadow-[0_40px_100px_rgba(37,99,235,0.16)]"><ProjectVisual variant={project.visual} /><div className="p-7 sm:p-8"><div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-emerald-600"><span className="relative size-2 rounded-full bg-emerald-500"><span className="absolute inset-0 animate-ping rounded-full bg-emerald-400" /></span>Live · Digital Product</div><h3 className="mt-4 text-3xl font-black tracking-[-0.035em] text-slate-950 transition group-hover:text-blue-700">{project.title}</h3><p className="mt-2 text-sm font-bold text-blue-600">{project.client}</p><p className="mt-4 text-sm font-semibold leading-7 text-slate-600">{project.copy}</p><Link href="#enquiry" className="mt-7 inline-flex items-center text-sm font-extrabold text-blue-600">Plan a similar project <ArrowUpRight className="ml-2 size-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></Link></div></article></Reveal>)}
          </div>
          <Reveal className="mt-10 flex justify-center"><Link href="#enquiry" className="button-primary inline-flex items-center justify-center rounded-xl px-8 py-4 text-sm font-extrabold">Build Something Distinctive <Sparkles className="ml-3 size-4" /></Link></Reveal>
        </div>
      </section>

      <section id="process" className="scroll-mt-24 overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#eff6ff_100%)] py-20 sm:py-28">
        <div className="mx-auto max-w-[104rem] px-4 sm:px-6 lg:px-12 2xl:px-16">
          <Reveal><SectionHeading eyebrow="Process / Clarity at every step">How an idea becomes <span className="text-gradient">impact.</span></SectionHeading></Reveal>
          <div className="relative mt-10 grid gap-7 md:grid-cols-2 lg:grid-cols-5 lg:gap-0">
            {process.map(({ icon: Icon, title, copy }, index) => <Reveal key={title} delay={index * 0.06} className="group relative rounded-2xl bg-white p-4 lg:p-0 lg:pr-7"><div className="relative z-10 flex items-start gap-4"><span className="grid size-16 shrink-0 place-items-center rounded-full border border-blue-100 bg-white text-blue-600 shadow-[0_18px_45px_rgba(37,99,235,0.12)] ring-8 ring-blue-50/70 transition group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white"><Icon className="size-6" /></span><div className="pt-1"><div className="flex items-center gap-3"><p className="text-sm font-black text-blue-600">0{index + 1}</p><h3 className="font-black text-slate-950">{title}</h3></div><p className="mt-4 max-w-[12rem] text-sm font-semibold leading-7 text-slate-600">{copy}</p></div></div>{index < process.length - 1 && <div className="pointer-events-none absolute left-[5rem] top-8 hidden w-[calc(100%-5rem)] border-t-2 border-dashed border-blue-100 lg:block"><ArrowRight className="absolute -right-1 -top-2 size-4 text-blue-500" /></div>}</Reveal>)}
          </div>
          <Reveal className="mt-10 text-center"><Link href="#enquiry" className="inline-flex items-center justify-center rounded-xl border border-blue-200 bg-white px-7 py-4 text-sm font-extrabold text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50">Start With a Discovery Call <CalendarCheck2 className="ml-3 size-4" /></Link></Reveal>
        </div>
      </section>

      <section id="enquiry" className="relative isolate scroll-mt-24 overflow-hidden bg-white py-20 sm:py-28">
        <div className="absolute left-0 top-24 -z-10 size-72 rounded-full bg-blue-100/60 blur-3xl" /><div className="absolute bottom-12 right-0 -z-10 size-80 rounded-full bg-cyan-100/55 blur-3xl" />
        <div className="mx-auto grid max-w-[104rem] gap-10 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:px-12 2xl:px-16">
          <Reveal>
            <SectionHeading eyebrow="Start Your Enquiry">Tell us what you want to build, market, or automate.</SectionHeading>
            <p className="mt-5 max-w-xl text-base font-semibold leading-8 text-slate-600">Use the quick form and we’ll route your request into our CRM, prepare your client workspace, and respond with a clear recommendation, timeline, and next steps.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {[{ icon: MousePointerClick, title: "Quick intake", copy: "Share the essentials in under two minutes." }, { icon: ShieldCheck, title: "Portal access", copy: "New clients get a secure workspace." }, { icon: Compass, title: "Strategic reply", copy: "We respond with a focused next step." }].map(({ icon: Icon, title, copy }) => <div key={title} className="rounded-2xl border border-blue-100 bg-white/80 p-5 shadow-sm backdrop-blur"><span className="grid size-11 place-items-center rounded-xl bg-blue-50 text-blue-600"><Icon className="size-5" /></span><p className="mt-4 text-sm font-black text-slate-950">{title}</p><p className="mt-2 text-xs font-semibold leading-5 text-slate-500">{copy}</p></div>)}
            </div>
          </Reveal>
          <Reveal delay={0.08}><ProjectEnquiryForm /></Reveal>
        </div>
      </section>

      <section id="insights" className="scroll-mt-24 bg-[radial-gradient(circle_at_top_right,#eff6ff,transparent_28rem),linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] py-20 sm:py-28">
        <div className="mx-auto max-w-[104rem] px-4 sm:px-6 lg:px-12 2xl:px-16">
          <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div><SectionHeading eyebrow="Studio Notes">Ideas for building smarter, stronger businesses.</SectionHeading><p className="mt-4 max-w-2xl text-sm font-semibold leading-8 text-slate-600 sm:text-base">Practical thinking on product, marketing, branding, automation, and sustainable agency growth.</p></div><Link href="#enquiry" className="button-secondary inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-sm font-extrabold">Request a growth review <ArrowRight className="ml-3 size-4" /></Link></Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{insights.map(({ icon: Icon, title, date, read, tone }, index) => <Reveal key={title} delay={index * 0.06}><article className="group h-full overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100/70"><div className={`grid aspect-[16/9] place-items-center bg-gradient-to-br ${tone}`}><div className="grid size-20 place-items-center rounded-3xl border border-white/30 bg-white/15 text-white shadow-2xl backdrop-blur"><Icon className="size-9" /></div></div><div className="p-5 sm:p-6"><p className="text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-blue-600">Growth Strategy</p><h3 className="mt-3 text-xl font-black leading-snug text-slate-950 transition group-hover:text-blue-700">{title}</h3><div className="mt-5 flex flex-wrap gap-x-3 gap-y-1 text-[0.66rem] font-bold uppercase tracking-[0.1em] text-slate-500"><span>{date}</span><span>{read}</span></div></div></article></Reveal>)}</div>
        </div>
      </section>

      <section id="testimonials" className="scroll-mt-24 bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-[104rem] px-4 sm:px-6 lg:px-12 2xl:px-16">
          <Reveal><SectionHeading eyebrow="What Clients Say">Real People. Real <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Results.</span></SectionHeading></Reveal>
          <Reveal delay={0.08}><TestimonialsCarousel /></Reveal>
          <Reveal className="relative mt-14 overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 px-7 py-12 text-white shadow-[0_36px_100px_rgba(37,99,235,0.24)] sm:px-12 lg:px-16 lg:py-16">
            <div className="absolute left-0 top-0 h-full w-40 opacity-20 [background-image:radial-gradient(circle,white_1px,transparent_1px)] [background-size:12px_12px]" /><div className="absolute -right-20 -top-24 size-72 rounded-full bg-cyan-300/30 blur-3xl" /><Send className="absolute right-14 top-1/2 hidden size-24 -translate-y-1/2 text-white/75 lg:block" />
            <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center lg:pr-36"><div><p className="text-sm font-extrabold text-blue-100">Ready to Grow Your Business?</p><h3 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Let&apos;s Build Something Amazing Together!</h3><p className="mt-4 max-w-2xl text-base font-semibold leading-8 text-blue-50">Book a free strategy call and let&apos;s discuss how we can help you grow.</p></div><div className="flex flex-col gap-4 sm:flex-row"><Link href="#enquiry" className="inline-flex items-center justify-center rounded-xl bg-white px-7 py-4 text-sm font-extrabold text-blue-700 shadow-xl transition hover:-translate-y-0.5 hover:bg-blue-50">Book a Free Call <CalendarCheck2 className="ml-3 size-4" /></Link><Link href="#enquiry" className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-7 py-4 text-sm font-extrabold text-white backdrop-blur hover:bg-white/20">Request a Quote <ArrowRight className="ml-3 size-4" /></Link></div></div>
          </Reveal>
        </div>
      </section>

      <MarketingReception />
    </>
  );
}
