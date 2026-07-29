"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

function getDhakaTime() { return new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(new Date()); }

export function StudioFooter() {
  const [time, setTime] = useState("");
  useEffect(() => { setTime(getDhakaTime()); const interval = window.setInterval(() => setTime(getDhakaTime()), 1000); return () => window.clearInterval(interval); }, []);
  function backToTop() { const root = window as Window & { __mwLenis?: { scrollTo: (target: number, options?: { duration?: number }) => void } }; if (root.__mwLenis) root.__mwLenis.scrollTo(0, { duration: 1.1 }); else window.scrollTo({ top: 0, behavior: "smooth" }); }
  return <footer className="studio-footer"><div className="studio-ticker"><span>MW LABS</span><i /> <span>DESIGN / ENGINEERING / MOTION</span><i /> <span>DHAKA {time ? `/ ${time}` : ""}</span><i /> <span>AVAILABLE FOR SELECT PROJECTS</span></div><div className="studio-footer-bottom"><p>© {new Date().getFullYear()} MW Labs</p><div><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><button type="button" onClick={backToTop}>Back to top ↑</button></div></div></footer>;
}
