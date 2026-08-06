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
    <section className="relative overflow-hidden rounded-[2.75rem] bg-[#030b20] px-6 py-10 text-white shadow-[0_45px_140px_rgba(2,6,24,0.24)] sm:px-10 sm:py-14 lg:px-14">
      <div className="marketing-grid-dark pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(circle_at_center,black,transparent_80%)]" />
      <div className="absolute -left-20 top-0 size-80 rounded-full bg-blue-600/20 blur-[100px]" /><div className="absolute -right-24 bottom-0 size-96 rounded-full bg-cyan-400/10 blur-[110px]" />
      <div className="relative grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.24em] text-cyan-300"><Sparkles className="size-4" /> The M&amp;W growth system</div>
          <h2 className="mt-5 text-4xl font-black leading-[0.96] tracking-[-0.05em] sm:text-5xl">Creative craft.<br />Operational <span className="text-gradient-light">intelligence.</span></h2>
          <p className="mt-6 max-w-xl text-sm font-semibold leading-8 text-slate-400 sm:text-base">A strong digital presence is not a pile of deliverables. It is a connected system where brand, product, acquisition, data, and automation make each other more valuable.</p>
          <div className="mt-8 space-y-3">
            {signals.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur">
                <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-blue-500/15 text-cyan-300"><Icon className="size-4" /></span><span className="text-sm font-bold text-slate-300">{label}</span></div>
                <span className="rounded-full border border-emerald-400/15 bg-emerald-400/8 px-3 py-1 text-[0.65rem] font-extrabold uppercase tracking-[0.14em] text-emerald-300">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div onPointerMove={move} onPointerLeave={reset} className="perspective-stage relative min-h-[430px] sm:min-h-[520px]">
          <div ref={stage} className="growth-stage absolute inset-0 transition-transform duration-500 ease-out [transform-style:preserve-3d]">
            <div className="absolute inset-[7%_2%] overflow-hidden rounded-[2rem] border border-white/15 bg-white/[0.055] shadow-[0_35px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl [transform:translateZ(10px)]">
              <div className="flex h-12 items-center justify-between border-b border-white/10 px-5"><div className="flex gap-1.5"><span className="size-2 rounded-full bg-red-400" /><span className="size-2 rounded-full bg-amber-300" /><span className="size-2 rounded-full bg-emerald-400" /></div><span className="text-[0.6rem] font-extrabold uppercase tracking-[0.2em] text-slate-500">MW / Growth OS</span></div>
              <div className="grid h-[calc(100%-3rem)] grid-cols-[4rem_1fr] sm:grid-cols-[5rem_1fr]">
                <div className="border-r border-white/10 p-3"><span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-400 text-xs font-black">M</span><div className="mt-6 space-y-4">{[1, 2, 3, 4, 5].map((item) => <span key={item} className={`mx-auto block rounded-lg ${item === 2 ? "h-8 w-8 bg-blue-500/25" : "size-7 bg-white/5"}`} />)}</div></div>
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between"><div><p className="text-[0.6rem] font-bold uppercase tracking-[0.16em] text-cyan-300">System pulse</p><p className="mt-1 text-lg font-black">Momentum overview</p></div><span className="hidden rounded-full bg-emerald-400/10 px-3 py-1.5 text-[0.6rem] font-extrabold text-emerald-300 sm:block">● LIVE</span></div>
                  <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">{[{ value: "+38%", label: "Pipeline" }, { value: "24", label: "Automations" }, { value: "4.8x", label: "Return" }].map((item) => <div key={item.label} className="rounded-xl border border-white/8 bg-white/[0.045] p-3"><p className="text-lg font-black text-white sm:text-2xl">{item.value}</p><p className="mt-1 text-[0.55rem] font-bold uppercase tracking-wider text-slate-500">{item.label}</p></div>)}</div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-[1.35fr_0.65fr]">
                    <div className="relative h-40 overflow-hidden rounded-xl border border-white/8 bg-white/[0.035] p-4"><div className="flex items-end gap-1.5 h-full">{[30, 48, 38, 62, 52, 74, 66, 86, 79, 96].map((height, index) => <span key={index} className="flex-1 rounded-t-sm bg-gradient-to-t from-blue-700 to-cyan-300" style={{ height: `${height}%`, opacity: 0.55 + index * 0.04 }} />)}</div><div className="absolute inset-x-4 top-1/2 h-px bg-cyan-300/20" /></div>
                    <div className="grid place-items-center rounded-xl border border-white/8 bg-white/[0.035] p-3"><div className="relative grid size-24 place-items-center rounded-full border-[10px] border-blue-500/15 text-center"><div className="absolute inset-[-10px] rounded-full border-[10px] border-transparent border-r-cyan-300 border-t-blue-500 rotate-45" /><ChartNoAxesCombined className="size-6 text-cyan-300" /><span className="absolute -bottom-8 whitespace-nowrap text-[0.55rem] font-bold uppercase tracking-widest text-slate-500">Growth health</span></div></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="growth-float-card float-card absolute -left-2 top-[8%] rounded-2xl border border-white/15 bg-[#10235a]/90 p-3.5 shadow-2xl backdrop-blur-xl [--float-z:80px] sm:-left-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-blue-500 text-white"><Layers3 className="size-4" /></span><div><p className="text-[0.55rem] font-extrabold uppercase tracking-widest text-cyan-300">Experience layer</p><p className="mt-1 text-xs font-black">Brand + Product</p></div></div></div>
            <div className="growth-float-card float-card float-card-delay absolute -right-1 bottom-[12%] rounded-2xl border border-cyan-300/20 bg-[#071633]/92 p-3.5 shadow-2xl backdrop-blur-xl [--float-z:100px] sm:-right-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-cyan-300 text-brand-ink"><Bot className="size-4" /></span><div><p className="text-[0.55rem] font-extrabold uppercase tracking-widest text-cyan-300">Intelligence layer</p><p className="mt-1 text-xs font-black">Gemini + Automation</p></div></div></div>
          </div>
        </div>
      </div>
    </section>
  );
}
