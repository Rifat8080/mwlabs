"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useScrollStore, type MaterialTarget } from "@/lib/scroll-store";

const sceneMorphs: Record<string, number> = { hero: 0, manifesto: .16, capabilities: .35, work: .56, process: .73, studio: .87, contact: 1 };

export function ScrollOrchestrator() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const { progressRef, pointerRef, morphRef, materialRef } = useScrollStore.getState();
    const lenis = new Lenis({ lerp: .095, smoothWheel: true, syncTouch: false });
    window.__mwLenis = lenis;
    const onLenisScroll = () => ScrollTrigger.update();
    const onTicker = (time: number) => lenis.raf(time * 1000);
    const onPointerMove = (event: PointerEvent) => { pointerRef.current.x = event.clientX / window.innerWidth * 2 - 1; pointerRef.current.y = -(event.clientY / window.innerHeight * 2 - 1); };
    lenis.on("scroll", onLenisScroll);
    gsap.ticker.add(onTicker);
    gsap.ticker.lagSmoothing(0);
    const rootTrigger = ScrollTrigger.create({ trigger: document.body, start: "top top", end: "bottom bottom", onUpdate: (self) => { progressRef.current = self.progress; } });
    const sceneTriggers = [...document.querySelectorAll<HTMLElement>("[data-scene]")].map((element) => ScrollTrigger.create({ trigger: element, start: "top center", end: "bottom center", onEnter: () => { morphRef.current = sceneMorphs[element.dataset.scene ?? "hero"] ?? 0; }, onEnterBack: () => { morphRef.current = sceneMorphs[element.dataset.scene ?? "hero"] ?? 0; } }));
    const capabilityTargets = [...document.querySelectorAll<HTMLElement>("[data-material]")];
    const onMaterial = (event: Event) => { const target = event.currentTarget as HTMLElement; materialRef.current = (target.dataset.material as MaterialTarget | undefined) ?? "chrome"; };
    const resetMaterial = () => { materialRef.current = "chrome"; };
    capabilityTargets.forEach((target) => { target.addEventListener("pointerenter", onMaterial); target.addEventListener("focus", onMaterial); target.addEventListener("pointerleave", resetMaterial); target.addEventListener("blur", resetMaterial); });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    const refresh = window.requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => { window.cancelAnimationFrame(refresh); capabilityTargets.forEach((target) => { target.removeEventListener("pointerenter", onMaterial); target.removeEventListener("focus", onMaterial); target.removeEventListener("pointerleave", resetMaterial); target.removeEventListener("blur", resetMaterial); }); window.removeEventListener("pointermove", onPointerMove); sceneTriggers.forEach((trigger) => trigger.kill()); rootTrigger.kill(); gsap.ticker.remove(onTicker); lenis.off("scroll", onLenisScroll); lenis.destroy(); delete window.__mwLenis; };
  }, []);
  return null;
}
