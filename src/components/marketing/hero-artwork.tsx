"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { Bot, Clapperboard, Code2, Megaphone, MousePointer2, Palette, Sparkles, Target } from "lucide-react";

const heroServices = [
  { label: "Web Development", outcome: "Digital products that perform", icon: Code2, position: "left-[8%] top-[18%]", tone: "bg-blue-50 text-blue-600", accent: "#2563eb", delay: "-0.4s" },
  { label: "Digital Marketing", outcome: "Attention into demand", icon: Megaphone, position: "right-[2%] top-[19%]", tone: "bg-cyan-50 text-cyan-600", accent: "#06b6d4", delay: "-2.6s" },
  { label: "Branding & Design", outcome: "Identity people remember", icon: Palette, position: "right-[1%] top-[52%]", tone: "bg-violet-50 text-violet-600", accent: "#7c3aed", delay: "-4.3s" },
  { label: "Video Editing", outcome: "Stories that hold attention", icon: Clapperboard, position: "right-[10%] top-[77%]", tone: "bg-fuchsia-50 text-fuchsia-600", accent: "#c026d3", delay: "-1.7s" },
  { label: "Growth Strategy", outcome: "A clearer route to scale", icon: Target, position: "left-[2%] top-[70%]", tone: "bg-emerald-50 text-emerald-600", accent: "#10b981", delay: "-3.5s" },
  { label: "AI Automation", outcome: "Less repetition, more momentum", icon: Bot, position: "left-[42%] top-[85%]", tone: "bg-indigo-50 text-indigo-600", accent: "#4f46e5", delay: "-5.2s" },
];

const heroParticles = [
  { className: "left-[18%] top-[30%] size-1.5 bg-blue-500", delay: "-0.8s" },
  { className: "left-[31%] top-[11%] size-2 bg-violet-400", delay: "-2.1s" },
  { className: "right-[27%] top-[13%] size-2.5 bg-cyan-400", delay: "-3.4s" },
  { className: "right-[9%] top-[43%] size-1.5 bg-blue-600", delay: "-1.5s" },
  { className: "left-[17%] bottom-[21%] size-2 bg-cyan-400", delay: "-4.2s" },
  { className: "right-[29%] bottom-[12%] size-1.5 bg-indigo-500", delay: "-2.8s" },
];

export function HeroArtwork() {
  const root = useRef<HTMLDivElement>(null);
  const animationFrame = useRef<number | null>(null);
  const reducedMotion = useRef(false);
  const [activeServiceIndex, setActiveServiceIndex] = useState(0);
  const activeService = heroServices[activeServiceIndex];

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotionPreference = () => {
      reducedMotion.current = motionQuery.matches;
    };

    syncMotionPreference();
    motionQuery.addEventListener("change", syncMotionPreference);

    return () => {
      motionQuery.removeEventListener("change", syncMotionPreference);
      if (animationFrame.current !== null) window.cancelAnimationFrame(animationFrame.current);
    };
  }, []);

  function updateDepth(event: PointerEvent<HTMLDivElement>) {
    const element = root.current;
    if (!element || reducedMotion.current || event.pointerType === "touch") return;
    const bounds = element.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    if (animationFrame.current !== null) window.cancelAnimationFrame(animationFrame.current);
    animationFrame.current = window.requestAnimationFrame(() => {
      element.style.setProperty("--hero-depth-x", `${x * 22}px`);
      element.style.setProperty("--hero-depth-y", `${y * 17}px`);
      element.style.setProperty("--hero-orbit-x", `${x * -12}px`);
      element.style.setProperty("--hero-orbit-y", `${y * -9}px`);
      element.style.setProperty("--hero-card-x", `${x * 9}px`);
      element.style.setProperty("--hero-card-y", `${y * 7}px`);
      element.style.setProperty("--hero-tilt-x", `${y * -2.2}deg`);
      element.style.setProperty("--hero-tilt-y", `${x * 2.8}deg`);
      element.style.setProperty("--hero-light-x", `${(x + 0.5) * 100}%`);
      element.style.setProperty("--hero-light-y", `${(y + 0.5) * 100}%`);
    });
  }

  function resetDepth() {
    const element = root.current;
    if (!element) return;
    element.style.setProperty("--hero-depth-x", "0px");
    element.style.setProperty("--hero-depth-y", "0px");
    element.style.setProperty("--hero-orbit-x", "0px");
    element.style.setProperty("--hero-orbit-y", "0px");
    element.style.setProperty("--hero-card-x", "0px");
    element.style.setProperty("--hero-card-y", "0px");
    element.style.setProperty("--hero-tilt-x", "0deg");
    element.style.setProperty("--hero-tilt-y", "0deg");
    element.style.setProperty("--hero-light-x", "72%");
    element.style.setProperty("--hero-light-y", "28%");
  }

  return (
    <div
      ref={root}
      className="hero-artwork hero-visual relative mx-auto min-h-[32rem] w-full max-w-[62rem] sm:min-h-[37rem] lg:min-h-[40rem] xl:min-h-[44rem]"
      onPointerMove={updateDepth}
      onPointerLeave={resetDepth}
      style={{ "--hero-active-color": activeService.accent } as CSSProperties}
    >
      <div className="hero-artwork-light pointer-events-none absolute inset-[5%] rounded-full" />
      <div className="hero-artwork-aura hero-artwork-aura-cyan pointer-events-none absolute right-[5%] top-[18%] size-[44%] rounded-full bg-cyan-200/30 blur-[75px]" />
      <div className="hero-artwork-aura hero-artwork-aura-violet pointer-events-none absolute left-[8%] top-[15%] size-[45%] rounded-full bg-violet-200/20 blur-[85px]" />

      <div className="hero-orbit-depth pointer-events-none absolute inset-0">
        <div className="hero-orbit hero-orbit-one absolute left-[8%] top-[15%] h-[65%] w-[86%] rounded-[50%] border border-blue-200/55" />
        <div className="hero-orbit hero-orbit-two absolute left-[5%] top-[28%] h-[44%] w-[92%] -rotate-6 rounded-[50%] border border-cyan-300/40" />
        <div className="hero-orbit hero-orbit-three absolute left-[15%] top-[23%] h-[52%] w-[76%] rotate-12 rounded-[50%] border border-indigo-300/35" />
        <div className="hero-orbit-energy absolute left-[11%] top-[21%] h-[55%] w-[82%] rounded-[50%]" />
        <span className="hero-orbit-node hero-orbit-node-one absolute left-[49%] top-[15%] size-2 rounded-full bg-blue-600 shadow-[0_0_0_6px_rgba(37,99,235,0.1),0_0_22px_rgba(37,99,235,0.65)]" />
        <span className="hero-orbit-node hero-orbit-node-two absolute right-[13%] top-[42%] size-2.5 rounded-full bg-cyan-400 shadow-[0_0_0_7px_rgba(34,211,238,0.1),0_0_24px_rgba(34,211,238,0.7)]" />
        {heroParticles.map((particle) => (
          <span key={particle.className} className={`hero-particle absolute rounded-full ${particle.className}`} style={{ animationDelay: particle.delay }} />
        ))}
      </div>

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

      <div className="hero-pointer-hint absolute right-[7%] top-[8%] hidden items-center gap-2 rounded-full border border-white/80 bg-white/60 px-3 py-2 text-slate-500 shadow-[0_12px_35px_rgba(37,99,235,0.06)] backdrop-blur-xl xl:flex">
        <MousePointer2 className="size-3 text-blue-600" />
        <span className="text-[0.48rem] font-black uppercase tracking-[0.17em]">Move to explore</span>
      </div>

      <div key={activeService.label} className="hero-active-readout absolute left-1/2 top-[8%] z-20 hidden -translate-x-1/2 items-center gap-2.5 rounded-2xl border border-white/90 bg-white/84 px-3 py-2.5 shadow-[0_16px_42px_rgba(37,99,235,0.11)] backdrop-blur-xl xl:flex">
        <span className="grid size-8 place-items-center rounded-xl text-white shadow-lg" style={{ backgroundColor: activeService.accent }}>
          <Sparkles className="size-3.5" />
        </span>
        <span>
          <span className="block text-[0.43rem] font-black uppercase tracking-[0.17em] text-slate-400">Current focus</span>
          <span className="mt-0.5 block whitespace-nowrap text-[0.66rem] font-black text-slate-800">{activeService.outcome}</span>
        </span>
      </div>

      <div className="hero-service-depth absolute inset-0 z-10 hidden xl:block" aria-label="Connected agency services">
        {heroServices.map((service) => {
          const Icon = service.icon;
          const serviceIndex = heroServices.indexOf(service);
          const isActive = serviceIndex === activeServiceIndex;
          return (
            <div key={service.label} className={`hero-service-anchor absolute ${service.position}`} style={{ animationDelay: service.delay }}>
              <button
                type="button"
                aria-pressed={isActive}
                className="hero-service-card group flex min-w-[13.5rem] items-center gap-3 rounded-[1.15rem] border border-white bg-white/94 p-3 pr-4 text-left text-slate-900 shadow-[0_16px_42px_rgba(15,23,42,0.11)] backdrop-blur-xl focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-600"
                data-active={isActive}
                style={{ "--service-accent": service.accent } as CSSProperties}
                onPointerEnter={() => setActiveServiceIndex(serviceIndex)}
                onFocus={() => setActiveServiceIndex(serviceIndex)}
                onClick={() => setActiveServiceIndex(serviceIndex)}
              >
                <span className={`grid size-10 shrink-0 place-items-center rounded-xl transition duration-300 group-hover:scale-105 ${service.tone}`}>
                  <Icon className="size-[1.1rem]" strokeWidth={2.3} />
                </span>
                <span>
                  <span className="block whitespace-nowrap text-[0.76rem] font-black tracking-[-0.025em]">{service.label}</span>
                  <span className="mt-0.5 block whitespace-nowrap text-[0.48rem] font-bold text-slate-400">{service.outcome}</span>
                </span>
                <span className="hero-service-indicator ml-auto size-1.5 rounded-full" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="absolute inset-x-3 bottom-3 z-10 grid grid-cols-2 gap-2 sm:inset-x-[8%] xl:hidden" aria-label="Connected agency services">
        {heroServices.map((service, index) => {
          const Icon = service.icon;
          return (
            <button
              type="button"
              key={service.label}
              aria-pressed={activeServiceIndex === index}
              className="hero-mobile-service flex min-w-0 items-center gap-2 rounded-xl border border-white bg-white/90 p-2 text-left text-slate-800 shadow-[0_10px_30px_rgba(37,99,235,0.09)] backdrop-blur-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              data-active={activeServiceIndex === index}
              style={{ animationDelay: `${index * 0.12}s`, "--service-accent": service.accent } as CSSProperties}
              onClick={() => setActiveServiceIndex(index)}
            >
              <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${service.tone}`}>
                <Icon className="size-3.5" strokeWidth={2.3} />
              </span>
              <span className="truncate text-[0.62rem] font-black sm:text-[0.7rem]">{service.label}</span>
              <span className="hero-service-indicator ml-auto size-1.5 shrink-0 rounded-full" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
