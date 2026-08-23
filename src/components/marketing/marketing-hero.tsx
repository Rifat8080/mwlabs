import Link from "next/link";
import { ArrowRight, ShieldCheck, Star } from "lucide-react";

import { HeroArtwork } from "@/components/marketing/hero-artwork";
import { Reveal } from "@/components/marketing/reveal";

const clientInitials = [
  { label: "AM", className: "bg-blue-100 text-blue-700" },
  { label: "RS", className: "bg-slate-200 text-slate-700" },
  { label: "TN", className: "bg-cyan-100 text-cyan-700" },
  { label: "MK", className: "bg-indigo-100 text-indigo-700" },
  { label: "JL", className: "bg-rose-100 text-rose-600" },
];

const trustedBrands = [
  { name: "Wave", mark: "W", tone: "from-blue-600 to-cyan-400", wordmark: "text-slate-800" },
  { name: "Slack", mark: "S", tone: "from-fuchsia-500 to-violet-600", wordmark: "text-slate-800" },
  { name: "Notion", mark: "N", tone: "from-slate-950 to-slate-700", wordmark: "text-slate-950" },
  { name: "Google", mark: "G", tone: "from-blue-500 via-red-500 to-amber-400", wordmark: "text-slate-700" },
  { name: "monday", mark: "m", tone: "from-rose-500 via-amber-400 to-emerald-500", wordmark: "text-slate-950" },
  { name: "HubSpot", mark: "H", tone: "from-orange-500 to-rose-500", wordmark: "text-slate-800" },
  { name: "Shopify", mark: "S", tone: "from-lime-500 to-emerald-600", wordmark: "text-slate-800" },
  { name: "Tech To The Rescue", mark: "+", tone: "from-red-500 to-rose-600", wordmark: "text-slate-800" },
];

export function MarketingHero() {
  return (
    <section className="hero-section relative isolate overflow-hidden bg-[#f8fbff] text-slate-950">
      <div className="pointer-events-none absolute inset-0 -z-30 bg-[radial-gradient(circle_at_84%_35%,rgba(34,211,238,0.19),transparent_27rem),radial-gradient(circle_at_8%_47%,rgba(37,99,235,0.09),transparent_34rem),linear-gradient(145deg,#ffffff_0%,#f8fbff_50%,#eff8ff_100%)]" />
      <div className="marketing-grid pointer-events-none absolute inset-0 -z-20 opacity-25 [mask-image:linear-gradient(to_bottom,black,transparent_92%)]" />
      <div className="hero-aurora pointer-events-none absolute -right-44 top-16 -z-10 size-[40rem] rounded-full bg-cyan-200/25 blur-[125px]" />

      <div className="mx-auto grid max-w-[112rem] items-center gap-10 px-4 pb-12 pt-14 sm:px-7 sm:pb-14 sm:pt-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8 lg:px-12 lg:pb-16 lg:pt-16 xl:gap-10 xl:pt-20 2xl:px-16">
        <div className="relative z-20 mx-auto max-w-[46rem] text-center lg:mx-0 lg:text-left">
          <Reveal>
            <div className="mx-auto inline-flex max-w-full items-center gap-2.5 rounded-full border border-blue-100 bg-white/88 px-3.5 py-2.5 text-[0.56rem] font-black uppercase leading-4 tracking-[0.15em] text-blue-700 shadow-[0_14px_42px_rgba(37,99,235,0.09)] backdrop-blur-xl sm:px-4 sm:text-[0.65rem] sm:tracking-[0.19em] lg:mx-0">
              <span className="hero-badge-pulse grid size-5 shrink-0 place-items-center rounded-full bg-blue-600 text-[0.68rem] leading-none text-white shadow-[0_0_0_5px_rgba(37,99,235,0.09)]">+</span>
              <span>Full-service digital agency for growing businesses</span>
            </div>
          </Reveal>

          <Reveal delay={0.07}>
            <h1 className="hero-reference-title mx-auto mt-8 font-black lg:mx-0" aria-label="Build. Market. Automate. Grow.">
              <span className="block text-slate-950 lg:whitespace-nowrap">Build. Market.</span>
              <span className="block text-slate-950 lg:whitespace-nowrap">
                Automate. <span className="hero-growth-word text-gradient">Grow.</span>
              </span>
            </h1>
            <p className="mx-auto mt-7 max-w-[41rem] text-[0.94rem] font-semibold leading-7 text-slate-600 sm:text-lg sm:leading-8 lg:mx-0 xl:text-[1.05rem]">
              M&amp;W Labs is a full-service digital agency helping businesses launch, grow, and scale. We build websites and software, run marketing that wins customers, craft brands and content, and automate operations with AI.
            </p>
          </Reveal>

          <Reveal delay={0.13} className="mt-8 grid gap-3 min-[420px]:grid-cols-2 sm:flex sm:justify-center lg:justify-start">
            <Link
              href="/register"
              className="hero-primary-cta group inline-flex min-h-[3.75rem] items-center justify-center overflow-hidden rounded-2xl bg-blue-600 px-7 text-sm font-black text-white shadow-[0_20px_45px_rgba(37,99,235,0.28)] transition duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-[0_25px_55px_rgba(37,99,235,0.34)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
            >
              Start Your Project
              <ArrowRight className="ml-4 size-4 transition group-hover:translate-x-1" />
            </Link>
            <Link
              href="/#work"
              className="hero-secondary-cta group inline-flex min-h-[3.75rem] items-center justify-center rounded-2xl border border-blue-200 bg-white/86 px-7 text-sm font-black text-blue-700 shadow-[0_14px_35px_rgba(37,99,235,0.07)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-blue-300 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
            >
              View Our Work
              <ArrowRight className="ml-4 size-4 transition group-hover:translate-x-1" />
            </Link>
          </Reveal>

          <Reveal delay={0.19} className="mt-10 sm:mt-12">
            <div className="mx-auto flex w-fit max-w-full flex-col items-center justify-center gap-4 min-[440px]:flex-row min-[440px]:gap-5 lg:mx-0 lg:justify-start">
              <div className="flex -space-x-2.5" aria-hidden="true">
                {clientInitials.map((client) => (
                  <span
                    key={client.label}
                    className={`hero-trust-avatar grid size-10 place-items-center rounded-full border-2 border-white text-[0.6rem] font-black shadow-sm ${client.className}`}
                  >
                    {client.label}
                  </span>
                ))}
              </div>
              <div className="text-left">
                <div className="flex gap-0.5 text-amber-400" aria-label="Five-star client rating">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star key={index} className="size-4 fill-current" />
                  ))}
                </div>
                <p className="mt-1 max-w-52 text-xs font-extrabold leading-4 text-slate-600 sm:text-sm">
                  Trusted by 30+<br className="hidden sm:block" /> Businesses Worldwide
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <HeroArtwork />
        </Reveal>
      </div>

      <div className="relative z-20 mx-auto max-w-[112rem] px-4 sm:px-7 lg:px-12 2xl:px-16">
        <div className="relative overflow-hidden rounded-t-[2rem] border border-b-0 border-blue-100/90 bg-white/88 px-4 pb-7 pt-8 shadow-[0_-18px_65px_rgba(37,99,235,0.09)] backdrop-blur-2xl sm:rounded-t-[2.5rem] sm:px-7 sm:pb-9 sm:pt-9 lg:px-10">
          <div className="pointer-events-none absolute -left-16 -top-20 size-56 rounded-full bg-blue-100/70 blur-3xl" />
          <div className="pointer-events-none absolute -right-12 bottom-0 size-48 rounded-full bg-cyan-100/65 blur-3xl" />

          <div className="relative flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
            <div>
              <div className="flex items-center justify-center gap-2 text-[0.62rem] font-black uppercase tracking-[0.2em] text-blue-600 md:justify-start">
                <span className="grid size-7 place-items-center rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                  <ShieldCheck className="size-3.5" />
                </span>
                Proven partnerships
              </div>
              <h2 className="mt-3 text-2xl font-black tracking-[-0.035em] text-slate-950 sm:text-3xl">
                Trusted by businesses <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">of all sizes.</span>
              </h2>
              <p className="mt-2 text-xs font-semibold leading-5 text-slate-500 sm:text-sm">
                From ambitious startups to established teams building their next stage of growth.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 shadow-sm">
              <div className="flex -space-x-2" aria-hidden="true">
                {clientInitials.slice(0, 3).map((client) => (
                  <span key={client.label} className={`grid size-8 place-items-center rounded-full border-2 border-white text-[0.48rem] font-black ${client.className}`}>
                    {client.label}
                  </span>
                ))}
              </div>
              <div className="text-left">
                <p className="text-sm font-black text-slate-950">30+ partnerships</p>
                <p className="text-[0.62rem] font-bold text-slate-500">Across 5+ countries</p>
              </div>
            </div>
          </div>

          <div className="relative mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
            {trustedBrands.map((brand) => (
              <div
                key={brand.name}
                className="group flex min-h-16 items-center justify-center gap-2.5 rounded-2xl border border-slate-200/80 bg-white/82 px-3 shadow-[0_8px_22px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-[0_15px_32px_rgba(37,99,235,0.11)]"
              >
                <span className={`grid size-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${brand.tone} text-xs font-black text-white shadow-sm transition duration-300 group-hover:scale-105`}>
                  {brand.mark}
                </span>
                <span className={`min-w-0 text-[0.68rem] font-black leading-tight tracking-[-0.015em] sm:text-xs ${brand.wordmark}`}>
                  {brand.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
