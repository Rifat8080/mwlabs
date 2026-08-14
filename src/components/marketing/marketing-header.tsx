"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Bot,
  CalendarCheck2,
  ChevronDown,
  Clapperboard,
  Code2,
  LineChart,
  Menu,
  Megaphone,
  PenTool,
  Sparkles,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { label: "Studio", href: "/#about", section: "about" },
  { label: "Work", href: "/work", section: "work" },
  { label: "Process", href: "/#process", section: "process" },
  { label: "Insights", href: "/blog", section: "insights" },
  { label: "Contact", href: "/#enquiry", section: "enquiry" },
];

const services: Array<{
  title: string;
  description: string;
  icon: LucideIcon;
  tone: string;
}> = [
  {
    title: "Web & Software",
    description: "Websites, platforms and digital products.",
    icon: Code2,
    tone: "bg-blue-50 text-blue-700",
  },
  {
    title: "Digital Marketing",
    description: "Campaigns and funnels that convert.",
    icon: Megaphone,
    tone: "bg-cyan-50 text-cyan-700",
  },
  {
    title: "Branding & Design",
    description: "Identity systems built to be remembered.",
    icon: PenTool,
    tone: "bg-indigo-50 text-indigo-700",
  },
  {
    title: "Video & Content",
    description: "Stories designed for every channel.",
    icon: Clapperboard,
    tone: "bg-violet-50 text-violet-700",
  },
  {
    title: "AI & Automation",
    description: "Smarter workflows that scale with you.",
    icon: Bot,
    tone: "bg-sky-50 text-sky-700",
  },
  {
    title: "Growth Strategy",
    description: "A focused plan for sustainable growth.",
    icon: LineChart,
    tone: "bg-emerald-50 text-emerald-700",
  },
];

const observedSections = ["about", "services", "work", "process", "insights", "enquiry"];

export function MarketingHeader() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 14);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    const sections = observedSections
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: "-18% 0px -68% 0px", threshold: [0, 0.1, 0.25] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!headerRef.current?.contains(event.target as Node)) setServicesOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setMobileOpen(false);
      setServicesOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  function closeNavigation(section?: string) {
    setMobileOpen(false);
    setServicesOpen(false);
    if (section) setActiveSection(section);
  }

  const servicesActive = activeSection === "services";

  return (
    <header
      ref={headerRef}
      id="top"
      className="pointer-events-none sticky top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4"
    >
      {mobileOpen && (
        <button
          type="button"
          className="pointer-events-auto fixed inset-0 z-0 bg-slate-950/20 backdrop-blur-[3px] xl:hidden"
          onClick={() => closeNavigation()}
          aria-label="Close navigation overlay"
        />
      )}

      <nav
        aria-label="Primary navigation"
        className={cn(
          "pointer-events-auto relative z-10 mx-auto flex max-w-[100rem] flex-wrap items-center justify-between gap-x-4 rounded-[1.4rem] border px-3 py-2.5 transition-all duration-300 sm:px-4 xl:flex-nowrap xl:rounded-[1.5rem] xl:px-3 xl:py-2.5",
          scrolled || mobileOpen || servicesOpen
            ? "border-slate-200/90 bg-white/95 shadow-[0_18px_55px_rgba(15,23,42,0.12)] backdrop-blur-2xl"
            : "border-white/80 bg-white/78 shadow-[0_12px_40px_rgba(37,99,235,0.08)] backdrop-blur-xl",
        )}
      >
        <Link
          href="/"
          onClick={() => closeNavigation()}
          className="group relative block h-10 w-[9.25rem] shrink-0 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 min-[380px]:w-[10rem] sm:h-11 sm:w-[10.75rem]"
          aria-label="M&W Labs home"
        >
          <Image
            src="/mw-logo.png"
            alt="M&W Labs"
            fill
            sizes="172px"
            priority
            loading="eager"
            className="object-contain object-left transition duration-300 group-hover:opacity-80"
          />
        </Link>

        <div className="hidden items-center rounded-2xl border border-slate-200/80 bg-slate-50/75 p-1 shadow-inner shadow-slate-200/30 xl:flex">
          <div className="relative">
            <button
              type="button"
              className={cn(
                "group flex h-10 items-center gap-1.5 rounded-xl px-3.5 text-[0.8rem] font-bold text-slate-600 transition hover:bg-white hover:text-slate-950 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-blue-600",
                (servicesOpen || servicesActive) && "bg-white text-blue-700 shadow-sm",
              )}
              onClick={() => setServicesOpen((value) => !value)}
              aria-expanded={servicesOpen}
              aria-controls="desktop-services-menu"
            >
              Services
              <ChevronDown
                className={cn("size-3.5 text-slate-400 transition-transform", servicesOpen && "rotate-180 text-blue-600")}
              />
              {servicesActive && <span className="absolute inset-x-4 -bottom-1 h-0.5 rounded-full bg-blue-600" />}
            </button>

            {servicesOpen && (
              <div
                id="desktop-services-menu"
                className="absolute left-1/2 top-[calc(100%+1rem)] w-[39rem] -translate-x-1/2 overflow-hidden rounded-[1.65rem] border border-slate-200/90 bg-white/98 p-2.5 shadow-[0_28px_90px_rgba(15,23,42,0.18)] backdrop-blur-2xl"
              >
                <div className="flex items-center justify-between px-3 pb-2 pt-1.5">
                  <div>
                    <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-blue-600">Our capabilities</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">Everything you need to build, launch, and grow.</p>
                  </div>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[0.58rem] font-black uppercase tracking-[0.12em] text-emerald-700">
                    End-to-end
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1">
                  {services.map(({ title, description, icon: Icon, tone }) => (
                    <Link
                      key={title}
                      href="/#services"
                      onClick={() => closeNavigation("services")}
                      className="group flex items-start gap-3 rounded-2xl p-3 transition hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600"
                    >
                      <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl transition group-hover:scale-105", tone)}>
                        <Icon className="size-4.5" />
                      </span>
                      <span className="min-w-0 pt-0.5">
                        <span className="block text-[0.78rem] font-extrabold text-slate-900 group-hover:text-blue-700">{title}</span>
                        <span className="mt-1 block text-[0.66rem] font-semibold leading-4 text-slate-500">{description}</span>
                      </span>
                    </Link>
                  ))}
                </div>

                <Link
                  href="/#enquiry"
                  onClick={() => closeNavigation("enquiry")}
                  className="group mt-1 flex items-center justify-between rounded-2xl bg-brand-navy px-4 py-3 text-white transition hover:bg-blue-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  <span>
                    <span className="block text-xs font-extrabold">Not sure where to begin?</span>
                    <span className="mt-0.5 block text-[0.65rem] font-semibold text-blue-200">Tell us your goal and we’ll map the right approach.</span>
                  </span>
                  <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                </Link>
              </div>
            )}
          </div>

          {navItems.map((item) => {
            const routeActive = !item.href.startsWith("/#") && pathname.startsWith(item.href);
            const active = routeActive || (pathname === "/" && activeSection === item.section);

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => closeNavigation(item.href.startsWith("/#") ? item.section : undefined)}
                aria-current={active ? routeActive ? "page" : "location" : undefined}
                className={cn(
                  "relative flex h-10 items-center rounded-xl px-3.5 text-[0.8rem] font-bold text-slate-600 transition hover:bg-white hover:text-slate-950 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-blue-600",
                  active && "bg-white text-blue-700 shadow-sm",
                )}
              >
                {item.label}
                {active && <span className="absolute inset-x-4 -bottom-1 h-0.5 rounded-full bg-blue-600" />}
              </Link>
            );
          })}
        </div>

        <div className="hidden shrink-0 items-center gap-2 xl:flex">
          <Link
            href="/book"
            onClick={() => closeNavigation()}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 px-4 text-[0.78rem] font-extrabold text-emerald-700 shadow-[0_8px_20px_rgba(16,185,129,0.10)] transition hover:-translate-y-0.5 hover:border-emerald-300 hover:from-emerald-100 hover:to-cyan-100 hover:text-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            <CalendarCheck2 className="mr-2 size-3.5" /> Book a call
          </Link>
          <Link
            href="/sign-in"
            onClick={() => closeNavigation()}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-cyan-200/80 bg-gradient-to-br from-cyan-50 via-white to-blue-50 px-4 text-[0.78rem] font-extrabold text-blue-700 shadow-[0_8px_20px_rgba(14,165,233,0.10)] transition hover:-translate-y-0.5 hover:border-cyan-300 hover:from-cyan-100 hover:to-blue-100 hover:text-blue-800 hover:shadow-[0_12px_26px_rgba(14,165,233,0.16)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            onClick={() => closeNavigation()}
            className="group relative isolate inline-flex h-11 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 px-5 text-[0.78rem] font-extrabold text-white shadow-[0_12px_26px_rgba(37,99,235,0.28)] transition before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-r before:from-indigo-600 before:via-blue-600 before:to-cyan-400 before:opacity-0 before:transition-opacity hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(37,99,235,0.36)] hover:before:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Start a project
            <ArrowRight className="ml-2 size-3.5 transition group-hover:translate-x-0.5" />
          </Link>
        </div>

        <button
          type="button"
          className="grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 xl:hidden"
          onClick={() => {
            setMobileOpen((value) => !value);
            setServicesOpen(false);
          }}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        {mobileOpen && (
          <div id="mobile-navigation" className="order-last mt-3 w-full border-t border-slate-200/80 pt-3 xl:hidden">
            <div className="max-h-[calc(100svh-6.5rem)] overflow-y-auto overscroll-contain rounded-2xl bg-slate-50/80 p-2.5">
              <div className="mb-2 flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2.5 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-8 place-items-center rounded-full bg-blue-50 text-blue-600">
                    <Sparkles className="size-3.5" />
                  </span>
                  <span>
                    <span className="block text-[0.68rem] font-extrabold text-slate-900">Independent digital studio</span>
                    <span className="mt-0.5 block text-[0.58rem] font-bold text-slate-500">Strategy, creative, technology & growth</span>
                  </span>
                </div>
                <span className="size-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" aria-label="Available for projects" />
              </div>

              <button
                type="button"
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-extrabold text-slate-700 transition hover:bg-white",
                  (servicesOpen || servicesActive) && "bg-white text-blue-700 shadow-sm",
                )}
                onClick={() => setServicesOpen((value) => !value)}
                aria-expanded={servicesOpen}
                aria-controls="mobile-services-menu"
              >
                <span className="flex items-center gap-2.5">
                  <span className="grid size-7 place-items-center rounded-lg bg-blue-50 text-blue-600">
                    <Sparkles className="size-3.5" />
                  </span>
                  Services
                </span>
                <ChevronDown className={cn("size-4 text-slate-400 transition-transform", servicesOpen && "rotate-180 text-blue-600")} />
              </button>

              {servicesOpen && (
                <div id="mobile-services-menu" className="grid gap-1 px-1 py-2 min-[520px]:grid-cols-2">
                  {services.map(({ title, icon: Icon, tone }) => (
                    <Link
                      key={title}
                      href="/#services"
                      onClick={() => closeNavigation("services")}
                      className="flex items-center gap-2.5 rounded-xl bg-white px-3 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600"
                    >
                      <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", tone)}>
                        <Icon className="size-3.5" />
                      </span>
                      {title}
                    </Link>
                  ))}
                </div>
              )}

              <div className="grid gap-1 sm:grid-cols-2">
                {navItems.map((item) => {
                  const routeActive = !item.href.startsWith("/#") && pathname.startsWith(item.href);
                  const active = routeActive || (pathname === "/" && activeSection === item.section);

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => closeNavigation(item.href.startsWith("/#") ? item.section : undefined)}
                      aria-current={active ? routeActive ? "page" : "location" : undefined}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-3 py-3 text-sm font-extrabold text-slate-700 transition hover:bg-white",
                        active && "bg-white text-blue-700 shadow-sm",
                      )}
                    >
                      {item.label}
                      <ArrowRight className={cn("size-3.5 text-slate-300", active && "text-blue-500")} />
                    </Link>
                  );
                })}
              </div>

              <div className="mt-2 grid grid-cols-[0.78fr_1.22fr] gap-2 border-t border-slate-200 pt-2.5">
                <Link
                  href="/book"
                  onClick={() => closeNavigation()}
                  className="col-span-2 inline-flex min-h-12 items-center justify-center rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-cyan-50 px-4 text-xs font-extrabold text-emerald-700 shadow-sm transition hover:border-emerald-300 hover:from-emerald-100 hover:to-cyan-100 focus-visible:outline-2 focus-visible:outline-emerald-600"
                >
                  <CalendarCheck2 className="mr-2 size-3.5" /> Book a discovery call
                </Link>
                <Link
                  href="/sign-in"
                  onClick={() => closeNavigation()}
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-blue-50 px-4 text-xs font-extrabold text-blue-700 shadow-sm transition hover:border-cyan-300 hover:from-cyan-100 hover:to-blue-100 focus-visible:outline-2 focus-visible:outline-blue-600"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  onClick={() => closeNavigation()}
                  className="group relative isolate inline-flex min-h-12 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 px-4 text-xs font-extrabold text-white shadow-lg shadow-blue-500/25 transition before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-r before:from-indigo-600 before:to-cyan-400 before:opacity-0 before:transition-opacity hover:before:opacity-100 focus-visible:outline-2 focus-visible:outline-blue-600"
                >
                  Start a project
                  <ArrowRight className="ml-2 size-3.5 transition group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
