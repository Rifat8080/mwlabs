"use client";

import { useRef } from "react";
import { Bot, ChartNoAxesCombined, Layers3, Palette, Sparkles, Workflow } from "lucide-react";

const signals = [
  { icon: Palette, label: "Brand signal", value: "Distinct" },
  { icon: Workflow, label: "Delivery flow", value: "Connected" },
  { icon: Bot, label: "AI leverage", value: "Always on" },
];

export function GrowthSystemShowcase() {
  const stage = useRef<HTMLDivElement>(null);

  function move(event: React.PointerEvent<HTMLDivElement>) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    stage.current?.style.setProperty("transform", `rotateX(${-y * 4}deg) rotateY(${x * 6}deg)`);
  }

  function reset() {
    stage.current?.style.setProperty("transform", "rotateX(0deg) rotateY(0deg)");
  }

  return (
    <section className="growth-showcase relative overflow-hidden rounded-[2rem] bg-[#030b20] px-4 py-9 text-white shadow-[0_45px_140px_rgba(2,6,24,0.24)] sm:rounded-[2.75rem] sm:px-8 sm:py-12 lg:px-10 xl:px-14 xl:py-14">
      <div className="marketing-grid-dark pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(circle_at_center,black,transparent_80%)]" />
      <div className="absolute -left-20 top-0 size-80 rounded-full bg-blue-600/20 blur-[100px]" /><div className="absolute -right-24 bottom-0 size-96 rounded-full bg-cyan-400/10 blur-[110px]" />
      <div className="relative grid gap-9 lg:grid-cols-[0.72fr_1.28fr] lg:items-center xl:gap-12">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.24em] text-cyan-300"><Sparkles className="size-4" /> The M&amp;W growth system</div>
          <h2 className="mt-5 text-4xl font-black leading-[0.96] tracking-[-0.05em] sm:text-5xl">Creative craft.<br />Operational <span className="text-gradient-light">intelligence.</span></h2>
          <p className="mt-6 max-w-xl text-sm font-semibold leading-8 text-slate-400 sm:text-base">A strong digital presence is not a pile of deliverables. It is a connected system where brand, product, acquisition, data, and automation make each other more valuable.</p>
          <div className="mt-8 space-y-3">
            {signals.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex min-w-0 items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-3 sm:gap-4 sm:p-3.5 backdrop-blur">
                <div className="flex min-w-0 items-center gap-2.5 sm:gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-500/15 text-cyan-300 sm:size-10"><Icon className="size-4" /></span><span className="truncate text-xs font-bold text-slate-300 sm:text-sm">{label}</span></div>
                <span className="shrink-0 rounded-full border border-emerald-400/15 bg-emerald-400/8 px-2.5 py-1 text-[0.55rem] font-extrabold uppercase tracking-[0.1em] text-emerald-300 sm:px-3 sm:text-[0.65rem] sm:tracking-[0.14em]">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div onPointerMove={move} onPointerLeave={reset} className="growth-visual perspective-stage relative min-h-[400px] w-full max-w-full sm:min-h-[500px] xl:min-h-[520px]">
          <div ref={stage} className="growth-stage absolute inset-0 transition-transform duration-500 ease-out [transform-style:preserve-3d]">
            <div className="growth-dashboard absolute inset-x-0 inset-y-[3%] overflow-hidden rounded-[1.4rem] border border-white/15 bg-white/[0.055] shadow-[0_35px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl [transform:translateZ(10px)] sm:inset-[7%_4%] sm:rounded-[2rem] lg:inset-[7%_3%] xl:inset-[7%_5%]">
              <div className="flex h-11 items-center justify-between border-b border-white/10 px-3 sm:h-12 sm:px-5"><div className="flex gap-1.5"><span className="size-2 rounded-full bg-red-400" /><span className="size-2 rounded-full bg-amber-300" /><span className="size-2 rounded-full bg-emerald-400" /></div><span className="truncate pl-3 text-[0.48rem] font-extrabold uppercase tracking-[0.14em] text-slate-500 sm:text-[0.6rem] sm:tracking-[0.2em]">MW / Growth OS</span></div>
              <div className="grid h-[calc(100%-2.75rem)] min-w-0 grid-cols-[3.25rem_minmax(0,1fr)] sm:h-[calc(100%-3rem)] sm:grid-cols-[4.5rem_minmax(0,1fr)]">
                <div className="overflow-hidden border-r border-white/10 p-2 sm:p-3"><span className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-400 text-[0.65rem] font-black sm:size-9 sm:text-xs">M</span><div className="mt-5 space-y-3.5 sm:mt-6 sm:space-y-4">{[1, 2, 3, 4, 5].map((item) => <span key={item} className={`mx-auto block rounded-lg ${item === 2 ? "size-7 bg-blue-500/25 sm:size-8" : "size-6 bg-white/5 sm:size-7"}`} />)}</div></div>
                <div className="min-w-0 overflow-hidden p-3 sm:p-5 xl:p-6">
                  <div className="flex min-w-0 items-center justify-between gap-2"><div className="min-w-0"><p className="truncate text-[0.5rem] font-bold uppercase tracking-[0.13em] text-cyan-300 sm:text-[0.6rem] sm:tracking-[0.16em]">System pulse</p><p className="mt-1 truncate text-sm font-black sm:text-lg">Momentum overview</p></div><span className="hidden shrink-0 rounded-full bg-emerald-400/10 px-3 py-1.5 text-[0.6rem] font-extrabold text-emerald-300 sm:block">● LIVE</span></div>
                  <div className="mt-4 grid min-w-0 grid-cols-3 gap-1.5 sm:mt-5 sm:gap-3">{[{ value: "+38%", label: "Pipeline" }, { value: "24", label: "Automations" }, { value: "4.8x", label: "Return" }].map((item) => <div key={item.label} className="min-w-0 overflow-hidden rounded-lg border border-white/8 bg-white/[0.045] p-2 sm:rounded-xl sm:p-3"><p className="truncate text-sm font-black text-white sm:text-2xl">{item.value}</p><p className="mt-1 truncate text-[0.42rem] font-bold uppercase tracking-wide text-slate-500 sm:text-[0.55rem] sm:tracking-wider">{item.label}</p></div>)}</div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-[1.35fr_0.65fr]">
                    <div className="relative h-36 min-w-0 overflow-hidden rounded-xl border border-white/8 bg-white/[0.035] p-3 sm:h-40 sm:p-4"><div className="flex h-full min-w-0 items-end gap-1 sm:gap-1.5">{[30, 48, 38, 62, 52, 74, 66, 86, 79, 96].map((height, index) => <span key={index} className="min-w-0 flex-1 rounded-t-sm bg-gradient-to-t from-blue-700 to-cyan-300" style={{ height: `${height}%`, opacity: 0.55 + index * 0.04 }} />)}</div><div className="absolute inset-x-3 top-1/2 h-px bg-cyan-300/20 sm:inset-x-4" /></div>
                    <div className="hidden min-w-0 place-items-center rounded-xl border border-white/8 bg-white/[0.035] p-3 sm:grid"><div className="relative grid size-20 place-items-center rounded-full border-[9px] border-blue-500/15 text-center xl:size-24 xl:border-[10px]"><div className="absolute inset-[-9px] rotate-45 rounded-full border-[9px] border-transparent border-r-cyan-300 border-t-blue-500 xl:inset-[-10px] xl:border-[10px]" /><ChartNoAxesCombined className="size-5 text-cyan-300 xl:size-6" /><span className="absolute -bottom-7 whitespace-nowrap text-[0.48rem] font-bold uppercase tracking-wider text-slate-500 xl:-bottom-8 xl:text-[0.55rem] xl:tracking-widest">Growth health</span></div></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="growth-float-card float-card absolute left-0 top-[5%] z-30 hidden max-w-[13rem] rounded-2xl border border-white/15 bg-[#10235a]/90 p-3 shadow-2xl backdrop-blur-xl [--float-z:80px] lg:block xl:left-[1%] xl:p-3.5"><div className="flex items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-500 text-white xl:size-10"><Layers3 className="size-4" /></span><div className="min-w-0"><p className="truncate text-[0.5rem] font-extrabold uppercase tracking-wider text-cyan-300 xl:text-[0.55rem] xl:tracking-widest">Experience layer</p><p className="mt-1 truncate text-xs font-black">Brand + Product</p></div></div></div>
            <div className="growth-float-card float-card float-card-delay absolute bottom-[8%] right-0 z-30 hidden max-w-[14rem] rounded-2xl border border-cyan-300/20 bg-[#071633]/92 p-3 shadow-2xl backdrop-blur-xl [--float-z:100px] lg:block xl:right-[1%] xl:p-3.5"><div className="flex items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-cyan-300 text-brand-ink xl:size-10"><Bot className="size-4" /></span><div className="min-w-0"><p className="truncate text-[0.5rem] font-extrabold uppercase tracking-wider text-cyan-300 xl:text-[0.55rem] xl:tracking-widest">Intelligence layer</p><p className="mt-1 truncate text-xs font-black">Gemini + Automation</p></div></div></div>
          </div>
        </div>
      </div>
    </section>
  );
}
