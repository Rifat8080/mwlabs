import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, Bot, Code2, Globe2, LineChart, Megaphone, MousePointer2, Sparkles } from "lucide-react";

import { HeroScene } from "@/components/marketing/hero-scene";
import { Reveal } from "@/components/marketing/reveal";

const growthLoop = [
  { number: "01", icon: Code2, verb: "Build", outcome: "Products people trust" },
  { number: "02", icon: Megaphone, verb: "Market", outcome: "Demand that converts" },
  { number: "03", icon: Bot, verb: "Automate", outcome: "Operations that think" },
  { number: "04", icon: LineChart, verb: "Grow", outcome: "Momentum that compounds" },
];

const proof = [
  { value: "500+", label: "Projects delivered" },
  { value: "20+", label: "Markets reached" },
  { value: "4.9/5", label: "Client experience" },
];

export function MarketingHero() {
  return (
    <section className="hero-section relative isolate -mt-[4.6rem] overflow-hidden bg-[#020817] pt-[6.8rem] text-white">
      <div className="pointer-events-none absolute inset-0 -z-30 bg-[radial-gradient(circle_at_76%_23%,rgba(1,136,236,0.18),transparent_27rem),radial-gradient(circle_at_14%_34%,rgba(21,93,252,0.13),transparent_30rem),linear-gradient(145deg,#020817_0%,#030b20_47%,#041332_100%)]" />
      <div className="marketing-grid-dark pointer-events-none absolute inset-0 -z-20 opacity-45 [mask-image:linear-gradient(to_bottom,black,transparent_90%)]" />
      <div className="hero-aurora pointer-events-none absolute -right-[12rem] top-12 -z-10 size-[40rem] rounded-full bg-cyan-400/[0.075] blur-[120px]" />
      <div className="hero-aurora hero-aurora-delay pointer-events-none absolute -left-48 top-[35%] -z-10 size-[34rem] rounded-full bg-blue-600/[0.09] blur-[130px]" />

      <div className="mx-auto grid min-h-[calc(100svh-2rem)] max-w-[108rem] items-center gap-12 px-4 pb-14 pt-8 sm:px-6 sm:pb-16 sm:pt-12 lg:grid-cols-[0.79fr_1.21fr] lg:gap-8 lg:px-10 lg:pb-20 lg:pt-14 xl:gap-14 xl:px-14 2xl:px-16">
        <div className="relative z-10 min-w-0 text-center lg:text-left">
          <Reveal>
            <div className="mx-auto flex w-fit max-w-full items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.055] px-3 py-2 text-[0.56rem] font-extrabold uppercase leading-4 tracking-[0.16em] text-slate-300 shadow-[0_18px_70px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:px-4 sm:text-[0.64rem] sm:tracking-[0.2em] lg:mx-0">
              <span className="relative grid size-5 shrink-0 place-items-center rounded-full bg-blue-500 text-[0.5rem] text-white"><span className="absolute inset-0 animate-ping rounded-full bg-cyan-300 opacity-25" />MW</span>
              Independent digital growth studio
              <span className="hidden items-center gap-1.5 text-cyan-300 min-[520px]:inline-flex"><Globe2 className="size-3" /> Dhaka ↔ Worldwide</span>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="mt-6 flex items-center justify-center gap-3 text-[0.52rem] font-black uppercase tracking-[0.2em] text-slate-500 sm:mt-8 lg:justify-start">
              <span>Growth system</span><span className="h-px w-10 bg-gradient-to-r from-blue-500 to-cyan-300" /><span>01—04</span>
            </div>
            <h1 className="experience-title mx-auto mt-4 max-w-[16ch] font-black lg:mx-0">
              <span className="block text-white">Build.<span className="block sm:inline"> Market.</span></span>
              <span className="block text-slate-400">Automate.<span className="block sm:inline"> <span className="text-gradient-light">Grow.</span></span></span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-sm font-medium leading-7 text-slate-300 sm:mt-7 sm:text-lg sm:leading-8 lg:mx-0">We connect brand, digital products, customer acquisition and AI automation into one system designed to compound.</p>
          </Reveal>

          <Reveal delay={0.14} className="mt-7 grid gap-3 min-[430px]:grid-cols-2 sm:mt-9 sm:flex sm:justify-center lg:justify-start">
            <Link href="#enquiry" className="group inline-flex min-h-13 items-center justify-center rounded-2xl bg-white px-5 text-sm font-black text-brand-ink shadow-[0_20px_60px_rgba(2,209,250,0.12)] transition duration-300 hover:-translate-y-1 hover:bg-cyan-300 sm:px-7">Start a growth project <ArrowRight className="ml-3 size-4 transition group-hover:translate-x-1" /></Link>
            <Link href="#work" className="group inline-flex min-h-13 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.055] px-5 text-sm font-black text-white backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-300/35 hover:bg-white/[0.09] sm:px-7">View selected work <ArrowUpRight className="ml-3 size-4 text-cyan-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></Link>
          </Reveal>

          <Reveal delay={0.2} className="mx-auto mt-8 max-w-xl border-y border-white/10 lg:mx-0">
            <div className="grid grid-cols-3 divide-x divide-white/10">
              {proof.map((item) => (
                <div key={item.label} className="min-w-0 px-2 py-4 text-left sm:px-4 sm:py-5">
                  <p className="text-lg font-black tracking-[-0.04em] text-white sm:text-2xl">{item.value}</p>
                  <p className="mt-1 truncate text-[0.48rem] font-extrabold uppercase tracking-[0.1em] text-slate-500 sm:text-[0.56rem] sm:tracking-[0.13em]">{item.label}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.24} className="mx-auto mt-5 flex max-w-xl flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[0.56rem] font-bold uppercase tracking-[0.14em] text-slate-500 lg:mx-0 lg:justify-start">
            <span className="inline-flex items-center gap-2 text-emerald-300"><span className="relative size-1.5 rounded-full bg-emerald-300"><span className="absolute inset-0 animate-ping rounded-full bg-emerald-300" /></span> Booking select projects</span>
            <span>Strategy to scale</span>
            <span>Built in-house</span>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="hero-visual relative mx-auto w-full max-w-5xl">
          <div className="experience-stage hero-stage relative min-h-[540px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-[radial-gradient(circle_at_52%_34%,rgba(21,93,252,0.14),transparent_21rem),linear-gradient(155deg,rgba(255,255,255,0.055),rgba(255,255,255,0.018))] shadow-[0_50px_160px_rgba(0,0,0,0.42)] backdrop-blur-sm sm:min-h-[620px] sm:rounded-[2.5rem] lg:min-h-[660px]">
            <div className="marketing-grid-dark pointer-events-none absolute inset-0 opacity-35 [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />
            <div className="pointer-events-none absolute inset-x-[12%] top-[15%] h-px bg-gradient-to-r from-transparent via-cyan-300/25 to-transparent" />
            <div className="pointer-events-none absolute left-1/2 top-[8%] h-[52%] w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-blue-400/12 to-transparent" />
            <div className="absolute inset-0"><HeroScene /></div>

            <div className="pointer-events-none absolute inset-x-4 top-4 z-20 flex items-center justify-between gap-3 sm:inset-x-6 sm:top-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#020817]/68 px-3 py-1.5 text-[0.5rem] font-extrabold uppercase tracking-[0.14em] text-slate-300 shadow-lg backdrop-blur-xl"><Sparkles className="size-3.5 text-cyan-300" /> M&amp;W growth engine <span className="text-emerald-300">● Live</span></div>
              <div className="hidden items-center gap-2 rounded-full border border-white/8 bg-[#020817]/55 px-3 py-1.5 text-[0.48rem] font-extrabold uppercase tracking-[0.13em] text-slate-400 min-[430px]:flex"><MousePointer2 className="size-3.5 text-blue-400" /> Move + play</div>
            </div>

            <div className="pointer-events-none absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-3 text-[0.46rem] font-black uppercase tracking-[0.18em] text-slate-600 sm:flex">
              <span className="[writing-mode:vertical-rl]">Real-time model</span><span className="h-12 w-px bg-gradient-to-b from-blue-500/50 to-transparent" />
            </div>

            <span className="pointer-events-none absolute left-4 top-4 size-5 border-l border-t border-cyan-300/25 sm:left-6 sm:top-6" />
            <span className="pointer-events-none absolute right-4 top-4 size-5 border-r border-t border-cyan-300/25 sm:right-6 sm:top-6" />
            <span className="pointer-events-none absolute bottom-4 left-4 size-5 border-b border-l border-blue-400/20 sm:bottom-6 sm:left-6" />
            <span className="pointer-events-none absolute bottom-4 right-4 size-5 border-b border-r border-blue-400/20 sm:bottom-6 sm:right-6" />
          </div>

          <div className="mt-4 hidden items-center justify-between px-3 text-[0.5rem] font-extrabold uppercase tracking-[0.18em] text-slate-600 sm:flex">
            <span>Procedural 3D / No image texture</span><span className="inline-flex items-center gap-2">Explore the system <ArrowDown className="size-3 text-cyan-300" /></span>
          </div>
        </Reveal>
      </div>

      <div className="border-y border-white/10 bg-[#020817]/86 backdrop-blur-2xl">
        <div className="mx-auto grid max-w-[108rem] grid-cols-2 md:grid-cols-4">
          {growthLoop.map(({ number, icon: Icon, verb, outcome }) => (
            <div key={verb} className="group relative flex min-w-0 items-center gap-3 overflow-hidden border-b border-r border-white/10 px-4 py-4 last:border-r-0 md:border-b-0 sm:px-6 sm:py-5 lg:px-8">
              <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-blue-500 to-cyan-300 transition duration-500 group-hover:scale-x-100" />
              <span className="text-[0.52rem] font-black text-blue-400">{number}</span>
              <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/8 bg-white/[0.045] text-cyan-300 transition duration-300 group-hover:-translate-y-0.5 group-hover:border-cyan-300/25 group-hover:bg-blue-500/15"><Icon className="size-3.5" /></span>
              <div className="min-w-0 text-left"><p className="text-[0.7rem] font-black uppercase tracking-[0.13em] text-white sm:text-xs">{verb}</p><p className="mt-0.5 truncate text-[0.5rem] font-bold uppercase tracking-wider text-slate-600 sm:text-[0.56rem]">{outcome}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
