"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const StudioScene = dynamic(() => import("@/components/cinematic/studio-scene").then((module) => module.StudioScene), { ssr: false, loading: () => null });

function supportsScene() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (memory !== undefined && memory < 4) return false;
  const canvas = document.createElement("canvas");
  return Boolean(canvas.getContext("webgl2"));
}

export function SceneLayer() {
  const [supported, setSupported] = useState(false);
  const [active, setActive] = useState(true);
  useEffect(() => { if (!supportsScene()) return; setSupported(true); document.documentElement.classList.add("has-webgl"); const onVisibilityChange = () => setActive(!document.hidden); document.addEventListener("visibilitychange", onVisibilityChange); return () => { document.documentElement.classList.remove("has-webgl"); document.removeEventListener("visibilitychange", onVisibilityChange); }; }, []);
  return supported ? <StudioScene active={active} /> : null;
}
