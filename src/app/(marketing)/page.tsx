import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BrainCircuit,
  Check,
  CircleDollarSign,
  Clock3,
  FileSignature,
  Fingerprint,
  Layers3,
  MoveUpRight,
  Radar,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";

import { HeroScene } from "@/components/marketing/hero-scene";
import { Reveal } from "@/components/marketing/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const lifecycle = [
  { number: "01", label: "Web & software", copy: "Sites, apps, SaaS, systems" },
  { number: "02", label: "Digital marketing", copy: "SEO, ads, leads, funnels" },
  { number: "03", label: "Branding & design", copy: "Identity and campaigns" },
  { number: "04", label: "Video & content", copy: "Reels, ads, motion, stories" },
  { number: "05", label: "AI & automation", copy: "Agents, workflows, dashboards" },
  { number: "06", label: "Growth strategy", copy: "Research, positioning, scale" },
];

const checks = [
  "AI chatbots and agents built around real workflows",
  "Smart integrations, dashboards, and business automation",
  "Human approval where decisions affect people or money",
];

export default function MarketingPage() {
  return (
    <>
      <section className="marketing-grid relative min-h-[940px] overflow-hidden border-b border-foreground/10 pt-18 lg:min-h-[900px]">
        <div className="absolute inset-x-0 top-0 h-[680px] bg-[radial-gradient(circle_at_72%_28%,rgb(2_209_250/0.2),transparent_31%),radial-gradient(circle_at_42%_12%,rgb(21_93_252/0.12),transparent_38%)]" />
        <div className="relative mx-auto grid max-w-[1440px] gap-10 px-5 pb-20 pt-20 sm:px-8 lg:grid-cols-[1.04fr_0.96fr] lg:px-12 lg:pb-28 lg:pt-26">
          <div className="relative z-10 max-w-3xl">
            <Reveal>
              <Badge variant="outline" className="rounded-full border-foreground/15 bg-background/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] backdrop-blur">
                <span className="mr-1.5 size-1.5 rounded-full bg-accent" />
                Full-service digital agency for growing businesses
              </Badge>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-7 max-w-[780px] text-balance text-[clamp(3.5rem,7.4vw,7.5rem)] font-semibold leading-[0.88] tracking-[-0.075em]">
                Build. Market.
                <span className="block bg-gradient-to-r from-primary via-brand-electric to-accent bg-clip-text text-transparent">Automate. Grow.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-8 max-w-xl text-balance text-lg leading-8 text-muted-foreground sm:text-xl">
                M&amp;W Labs helps businesses launch, grow, and scale with high-performing websites, software, marketing, brands, content, and AI automation.
              </p>
            </Reveal>
            <Reveal delay={0.22} className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button render={<Link href="https://mwlabs.digital/contact" />} size="lg" className="h-13 rounded-full bg-primary px-7 text-primary-foreground shadow-xl shadow-primary/20 hover:bg-brand-primary-hover">
                Start your project <ArrowUpRight className="size-4" />
              </Button>
              <Button render={<Link href="https://mwlabs.digital/our-work" />} size="lg" variant="outline" className="h-13 rounded-full border-brand-border bg-white/75 px-7 text-brand-primary-hover shadow-sm backdrop-blur hover:bg-brand-surface">
                View our work <ArrowRight className="size-4" />
              </Button>
            </Reveal>
            <Reveal delay={0.28} className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-2"><Check className="size-3.5 text-foreground" /> 500+ projects completed</span>
              <span className="flex items-center gap-2"><Check className="size-3.5 text-foreground" /> 300+ happy clients</span>
              <span className="flex items-center gap-2"><Check className="size-3.5 text-foreground" /> 20+ countries served</span>
            </Reveal>
          </div>

          <Reveal delay={0.18} className="relative min-h-[470px] lg:min-h-[650px]">
            <div className="absolute inset-[-12%_-18%_-8%_-10%] rounded-full bg-brand-navy shadow-[0_50px_120px_rgba(21,93,252,0.22)] lg:inset-[-8%_-15%_-5%_-6%]">
              <HeroScene />
            </div>
            <div className="absolute left-0 top-8 rounded-2xl border border-white/12 bg-white/9 p-4 text-white shadow-2xl backdrop-blur-xl lg:-left-8 lg:top-18">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-accent text-accent-foreground"><Radar className="size-4" /></span>
                <div><p className="text-[10px] uppercase tracking-[0.16em] text-white/45">Launch stack</p><p className="mt-0.5 text-sm font-semibold">Strategy + build + growth</p></div>
              </div>
            </div>
            <div className="absolute bottom-5 right-0 w-[218px] rounded-2xl border border-blue-100/15 bg-brand-navy/82 p-4 text-white shadow-2xl backdrop-blur-xl lg:-right-5 lg:bottom-24">
              <div className="flex items-center justify-between"><p className="text-[10px] uppercase tracking-[0.16em] text-white/45">Built for outcomes</p><Sparkles className="size-3.5 text-accent" /></div>
              <p className="mt-3 text-sm leading-5">Creative, technical, and growth expertise in one team.</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[92%] rounded-full bg-accent" /></div>
            </div>
          </Reveal>
        </div>

        <div className="relative mx-auto grid max-w-[1440px] grid-cols-2 border-x border-t border-foreground/10 bg-background/65 backdrop-blur sm:grid-cols-3 lg:grid-cols-6">
          {lifecycle.map((item) => (
            <div key={item.number} className="border-r border-b border-foreground/10 px-5 py-5 last:border-r-0 lg:border-b-0">
              <span className="font-mono text-[10px] text-muted-foreground">{item.number}</span>
              <p className="mt-4 text-sm font-semibold">{item.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="services" className="px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-[1340px]">
          <Reveal className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">One dedicated digital team</p>
              <h2 className="mt-5 text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl">From first strategy session to launch—and beyond.</h2>
            </div>
            <p className="max-w-xl text-lg leading-8 text-muted-foreground lg:justify-self-end">
              Developers, marketers, designers, editors, and strategists working as one team around measurable business growth.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-4 lg:grid-cols-12">
            <Reveal className="noise relative min-h-[470px] overflow-hidden rounded-[2rem] bg-brand-ink p-7 text-white shadow-[0_28px_80px_rgba(21,93,252,0.14)] lg:col-span-7 lg:p-10">
              <div className="relative z-10 max-w-md">
                <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/45"><Workflow className="size-4 text-accent" />Full-stack execution</div>
                <h3 className="mt-5 text-3xl font-semibold tracking-[-0.04em]">Strategy, craft, and execution move together.</h3>
                <p className="mt-4 leading-7 text-white/58">We plan the growth system, build the digital experience, launch the campaign, and keep improving what the data says matters.</p>
              </div>
              <div className="absolute -bottom-12 -right-12 grid size-[360px] place-items-center rounded-full border border-white/10 sm:size-[430px]">
                <div className="grid size-[72%] place-items-center rounded-full border border-accent/40"><div className="grid size-[54%] place-items-center rounded-full bg-[linear-gradient(135deg,#155dfc,#02d1fa)] text-white shadow-[0_0_80px_rgba(2,209,250,0.28)]"><Layers3 className="size-12" /></div></div>
              </div>
            </Reveal>

            <Reveal delay={0.08} className="rounded-[2rem] border bg-white p-7 shadow-[0_24px_80px_rgba(28,35,45,0.06)] lg:col-span-5 lg:p-10">
              <div className="flex items-start justify-between"><span className="grid size-11 place-items-center rounded-2xl bg-accent/60"><CircleDollarSign className="size-5" /></span><span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Growth systems</span></div>
              <div className="mt-14 flex items-end justify-between"><div><p className="text-sm text-muted-foreground">Launch optimization</p><p className="mt-2 text-6xl font-semibold tracking-[-0.07em]">98%</p></div><MoveUpRight className="mb-2 size-6 text-emerald-600" /></div>
              <div className="mt-8 flex h-24 items-end gap-2">
                {[42, 54, 49, 63, 72, 69, 82, 76, 88, 91, 84, 96].map((height, index) => <div key={index} className="flex-1 rounded-t-sm bg-foreground/10 last:bg-accent" style={{ height: `${height}%` }} />)}
              </div>
              <div className="mt-5 flex justify-between text-xs text-muted-foreground"><span>Last 12 weeks</span><span className="font-semibold text-foreground">+8.4%</span></div>
            </Reveal>

            <Reveal className="rounded-[2rem] border border-brand-border bg-brand-surface p-7 lg:col-span-4 lg:p-9">
              <Clock3 className="size-6" />
              <h3 className="mt-16 text-2xl font-semibold tracking-[-0.035em]">Web &amp; software that performs.</h3>
              <p className="mt-3 leading-7 text-muted-foreground">Custom websites, web apps, SaaS products, dashboards, and internal business systems.</p>
            </Reveal>
            <Reveal delay={0.06} className="rounded-[2rem] border border-cyan-100 bg-cyan-50 p-7 lg:col-span-4 lg:p-9">
              <FileSignature className="size-6" />
              <h3 className="mt-16 text-2xl font-semibold tracking-[-0.035em]">Marketing and content that earns attention.</h3>
              <p className="mt-3 leading-7 text-muted-foreground">SEO, ads, funnels, lead generation, social creative, video, and lifecycle campaigns.</p>
            </Reveal>
            <Reveal delay={0.12} id="security" className="rounded-[2rem] border border-blue-100 bg-blue-50 p-7 lg:col-span-4 lg:p-9">
              <ShieldCheck className="size-6" />
              <h3 className="mt-16 text-2xl font-semibold tracking-[-0.035em]">AI and automation built for the real work.</h3>
              <p className="mt-3 leading-7 text-muted-foreground">Chatbots, agents, smart workflows, integrations, and decision-ready dashboards.</p>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="intelligence" className="noise overflow-hidden bg-brand-ink px-5 py-24 text-white sm:px-8 lg:px-12 lg:py-32">
        <div className="relative mx-auto grid max-w-[1340px] gap-16 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
          <Reveal>
            <Badge className="rounded-full bg-accent text-accent-foreground hover:bg-accent"><BrainCircuit className="size-3.5" /> AI &amp; automation</Badge>
            <h2 className="mt-7 text-balance text-5xl font-semibold leading-[0.96] tracking-[-0.06em] sm:text-6xl">Automation that compounds the work.</h2>
            <p className="mt-7 max-w-xl text-lg leading-8 text-white/58">We connect Gemini, your tools, and your operating knowledge to remove repetitive work and surface the next best decision.</p>
            <div className="mt-8 space-y-3">
              {checks.map((check) => <div key={check} className="flex items-center gap-3 text-sm text-white/75"><span className="grid size-6 place-items-center rounded-full bg-accent/15 text-accent"><Check className="size-3.5" /></span>{check}</div>)}
            </div>
          </Reveal>
          <Reveal delay={0.1} className="hairline relative rounded-[2rem] bg-white/5 p-3 shadow-2xl backdrop-blur sm:p-5">
            <div className="rounded-[1.5rem] border border-blue-100/15 bg-brand-navy p-5 sm:p-7">
              <div className="flex items-center justify-between border-b border-white/10 pb-5"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-accent text-accent-foreground"><Sparkles className="size-4" /></span><div><p className="text-sm font-semibold">M&amp;W Intelligence</p><p className="text-xs text-white/38">A practical AI layer for your business</p></div></div><span className="size-2 rounded-full bg-emerald-400" /></div>
              <div className="mt-6 space-y-3">
                {[
                  ["Revenue", "Vela Systems is 3× more likely to close if the proposal is revised today.", "$28k"],
                  ["Delivery", "Halcyon is nearing its budget threshold with 14 hours of open work.", "86%"],
                  ["Cash", "Two invoices worth $19.4k are due within five days.", "$19.4k"],
                ].map(([label, copy, value]) => (
                  <div key={label} className="grid gap-4 rounded-2xl border border-white/8 bg-white/[0.035] p-4 sm:grid-cols-[80px_1fr_auto] sm:items-center"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">{label}</p><p className="text-sm leading-6 text-white/68">{copy}</p><p className="text-lg font-semibold">{value}</p></div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-brand-navy"><Sparkles className="size-4 text-primary" /><span className="flex-1 text-sm text-muted-foreground">What can we automate next?</span><span className="rounded-lg bg-primary px-3 py-1.5 text-xs text-white">Ask</span></div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="process" className="px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-[1340px]">
          <Reveal className="rounded-[2.5rem] bg-[linear-gradient(135deg,#155dfc,#0188ec_55%,#02d1fa)] p-8 text-white shadow-[0_34px_90px_rgba(21,93,252,0.24)] sm:p-12 lg:grid lg:grid-cols-[1fr_auto] lg:items-end lg:p-16">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.17em] text-white/68"><Fingerprint className="size-4" />Discover · Plan · Build · Launch · Grow</div>
              <h2 className="mt-6 max-w-4xl text-balance text-5xl font-semibold leading-[0.95] tracking-[-0.065em] text-white sm:text-7xl">Tell us what you want to build, market, or automate.</h2>
            </div>
            <Button render={<Link href="https://mwlabs.digital/contact" />} size="lg" className="mt-10 h-14 rounded-full bg-brand-ink px-8 text-white hover:bg-brand-navy lg:mt-0">
              Book a free strategy call <ArrowUpRight className="size-4" />
            </Button>
          </Reveal>
        </div>
      </section>
    </>
  );
}
