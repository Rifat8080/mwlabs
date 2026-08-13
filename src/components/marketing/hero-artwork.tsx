"use client";

import Image from "next/image";
import { useRef, type PointerEvent } from "react";
import { Bot, Clapperboard, Code2, Megaphone, Palette, Target } from "lucide-react";

const heroServices = [
  { label: "Web Development", icon: Code2, position: "left-[10%] top-[17%]", tone: "bg-blue-50 text-blue-600", delay: "-0.4s" },
  { label: "Digital Marketing", icon: Megaphone, position: "right-[3%] top-[18%]", tone: "bg-cyan-50 text-cyan-600", delay: "-2.6s" },
  { label: "Branding & Design", icon: Palette, position: "right-[2%] top-[52%]", tone: "bg-violet-50 text-violet-600", delay: "-4.3s" },
  { label: "Video Editing", icon: Clapperboard, position: "right-[12%] top-[76%]", tone: "bg-fuchsia-50 text-fuchsia-600", delay: "-1.7s" },
  { label: "Growth Strategy", icon: Target, position: "left-[4%] top-[70%]", tone: "bg-emerald-50 text-emerald-600", delay: "-3.5s" },
  { label: "AI Automation", icon: Bot, position: "left-[43%] top-[84%]", tone: "bg-indigo-50 text-indigo-600", delay: "-5.2s" },
];

export function HeroArtwork() {
  const root = useRef<HTMLDivElement>(null);

  function updateDepth(event: PointerEvent<HTMLDivElement>) {
    const element = root.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = element.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    element.style.setProperty("--hero-depth-x", `${x * 18}px`);
    element.style.setProperty("--hero-depth-y", `${y * 14}px`);
    element.style.setProperty("--hero-light-x", `${(x + 0.5) * 100}%`);
    element.style.setProperty("--hero-light-y", `${(y + 0.5) * 100}%`);
  }

  function resetDepth() {
    root.current?.style.setProperty("--hero-depth-x", "0px");
    root.current?.style.setProperty("--hero-depth-y", "0px");
    root.current?.style.setProperty("--hero-light-x", "72%");
    root.current?.style.setProperty("--hero-light-y", "28%");
  }

  return (
    <div
      ref={root}
      className="hero-artwork hero-visual relative mx-auto min-h-[32rem] w-full max-w-[62rem] sm:min-h-[37rem] lg:min-h-[40rem] xl:min-h-[44rem]"
      onPointerMove={updateDepth}
      onPointerLeave={resetDepth}
    >
      <div className="hero-artwork-light pointer-events-none absolute inset-[5%] rounded-full" />
      <div className="hero-artwork-aura hero-artwork-aura-cyan pointer-events-none absolute right-[5%] top-[18%] size-[44%] rounded-full bg-cyan-200/30 blur-[75px]" />
      <div className="hero-artwork-aura hero-artwork-aura-violet pointer-events-none absolute left-[8%] top-[15%] size-[45%] rounded-full bg-violet-200/20 blur-[85px]" />

      <div className="hero-orbit hero-orbit-one pointer-events-none absolute left-[8%] top-[15%] h-[65%] w-[86%] rounded-[50%] border border-blue-200/55" />
      <div className="hero-orbit hero-orbit-two pointer-events-none absolute left-[5%] top-[28%] h-[44%] w-[92%] -rotate-6 rounded-[50%] border border-cyan-300/40" />
      <div className="hero-orbit hero-orbit-three pointer-events-none absolute left-[15%] top-[23%] h-[52%] w-[76%] rotate-12 rounded-[50%] border border-indigo-300/35" />
      <span className="hero-orbit-node hero-orbit-node-one pointer-events-none absolute left-[49%] top-[15%] size-2 rounded-full bg-blue-600 shadow-[0_0_0_6px_rgba(37,99,235,0.1),0_0_22px_rgba(37,99,235,0.65)]" />
      <span className="hero-orbit-node hero-orbit-node-two pointer-events-none absolute right-[13%] top-[42%] size-2.5 rounded-full bg-cyan-400 shadow-[0_0_0_7px_rgba(34,211,238,0.1),0_0_24px_rgba(34,211,238,0.7)]" />

      <div className="hero-glass-plane pointer-events-none absolute left-[12%] top-[33%] h-[36%] w-[78%] -rotate-[8deg] rounded-[2rem] border border-white/90 bg-white/42 shadow-[0_35px_75px_rgba(15,23,42,0.08)] backdrop-blur-sm" />

      <div className="hero-artwork-depth absolute inset-x-[2%] top-[2%] bottom-[27%] sm:inset-x-[5%] sm:top-[5%] sm:bottom-[22%] xl:inset-[7%]">
        <div className="hero-svg-breathe relative size-full">
          <Image
            src="/hero.svg"
            alt="M&amp;W Labs infinity ribbon connecting strategy, technology, marketing, design, content and AI automation"
            fill
            preload
            unoptimized
            sizes="(max-width: 1023px) 100vw, 55vw"
            className="object-contain drop-shadow-[0_32px_42px_rgba(19,54,139,0.18)]"
          />
        </div>
      </div>

      <div className="absolute left-[7%] top-[8%] hidden items-center gap-2 rounded-full border border-white/90 bg-white/72 px-3 py-2 shadow-[0_12px_35px_rgba(37,99,235,0.08)] backdrop-blur-xl sm:flex">
        <span className="relative size-2 rounded-full bg-emerald-500">
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-35" />
        </span>
        <span className="text-[0.48rem] font-black uppercase tracking-[0.18em] text-slate-500">Connected growth system</span>
      </div>

      <div className="absolute inset-0 z-10 hidden xl:block" aria-label="Connected agency services">
        {heroServices.map((service) => {
          const Icon = service.icon;
          return (
            <div key={service.label} className={`hero-service-anchor absolute ${service.position}`} style={{ animationDelay: service.delay }}>
              <div className="hero-service-card group flex min-w-[12rem] items-center gap-3 rounded-[1.15rem] border border-white bg-white/94 p-3 pr-4 text-slate-900 shadow-[0_16px_42px_rgba(15,23,42,0.11)] backdrop-blur-xl">
                <span className={`grid size-10 shrink-0 place-items-center rounded-xl transition duration-300 group-hover:scale-105 ${service.tone}`}>
                  <Icon className="size-[1.1rem]" strokeWidth={2.3} />
                </span>
                <span className="whitespace-nowrap text-[0.78rem] font-black tracking-[-0.025em]">{service.label}</span>
                <span className="ml-auto size-1.5 rounded-full bg-blue-400/70 opacity-0 transition group-hover:opacity-100" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute inset-x-3 bottom-3 z-10 grid grid-cols-2 gap-2 sm:inset-x-[8%] xl:hidden" aria-label="Connected agency services">
        {heroServices.map((service, index) => {
          const Icon = service.icon;
          return (
            <div key={service.label} className="hero-mobile-service flex min-w-0 items-center gap-2 rounded-xl border border-white bg-white/90 p-2 text-slate-800 shadow-[0_10px_30px_rgba(37,99,235,0.09)] backdrop-blur-xl" style={{ animationDelay: `${index * 0.12}s` }}>
              <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${service.tone}`}>
                <Icon className="size-3.5" strokeWidth={2.3} />
              </span>
              <span className="truncate text-[0.62rem] font-black sm:text-[0.7rem]">{service.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
