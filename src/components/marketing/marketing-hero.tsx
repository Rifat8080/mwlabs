import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

import { HeroArtwork } from "@/components/marketing/hero-artwork";
import { Reveal } from "@/components/marketing/reveal";

const clientInitials = [
  { label: "AM", className: "bg-blue-100 text-blue-700" },
  { label: "RS", className: "bg-slate-200 text-slate-700" },
  { label: "TN", className: "bg-cyan-100 text-cyan-700" },
  { label: "MK", className: "bg-indigo-100 text-indigo-700" },
  { label: "JL", className: "bg-rose-100 text-rose-600" },
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
        <div className="rounded-t-[1.75rem] border border-b-0 border-blue-100/90 bg-white/76 px-6 py-6 text-center shadow-[0_-10px_50px_rgba(37,99,235,0.06)] backdrop-blur-xl sm:rounded-t-[2rem]">
          <div className="mx-auto flex max-w-2xl items-center gap-4 sm:gap-7">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-200" />
            <p className="shrink-0 text-[0.58rem] font-black uppercase tracking-[0.22em] text-slate-500 sm:text-xs sm:tracking-[0.28em]">Trusted by businesses of all sizes</p>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-blue-200" />
          </div>
        </div>
      </div>
    </section>
  );
}
