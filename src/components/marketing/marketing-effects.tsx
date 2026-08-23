"use client";

import { useEffect, useRef } from "react";

export function MarketingEffects() {
  const progress = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;

    const updateProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const value = scrollable > 0 ? window.scrollY / scrollable : 0;
      progress.current?.style.setProperty("transform", `scaleX(${Math.min(1, Math.max(0, value))})`);
    };

    const updateGlow = (event: PointerEvent) => {
      if (reducedMotion || event.pointerType === "touch") return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        glow.current?.style.setProperty("transform", `translate3d(${event.clientX - 190}px, ${event.clientY - 190}px, 0)`);
      });
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("pointermove", updateGlow, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("pointermove", updateGlow);
    };
  }, []);

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-[3px] bg-blue-100/30">
        <div ref={progress} className="h-full origin-left scale-x-0 bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600 will-change-transform" />
      </div>
      <div ref={glow} className="pointer-events-none fixed left-0 top-0 z-30 hidden size-[380px] rounded-full bg-blue-400/8 blur-[90px] will-change-transform lg:block" aria-hidden="true" />
    </>
  );
}
