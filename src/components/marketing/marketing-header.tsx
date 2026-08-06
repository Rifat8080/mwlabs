"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, ChevronDown, Menu, PhoneCall, X } from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { label: "Studio", href: "#about" },
  { label: "Work", href: "#work" },
  { label: "Process", href: "#process" },
  { label: "Insights", href: "#insights" },
  { label: "Contact", href: "#enquiry" },
];

const services = [
  "Web Development",
  "Digital Marketing",
  "Branding & Design",
  "Video & Content",
  "AI & Automation",
  "Growth Strategy",
];

export function MarketingHeader() {
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 18);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  function closeNavigation() {
    setOpen(false);
    setServicesOpen(false);
  }

  return (
    <header id="top" className="pointer-events-none sticky top-0 z-50 px-3 pt-3 sm:px-5">
      <nav
        className={cn(
          "pointer-events-auto mx-auto flex max-w-[100rem] flex-wrap items-center justify-between gap-y-3 rounded-[1.35rem] border px-3 py-2.5 transition-all duration-500 sm:px-4 lg:flex-nowrap",
          scrolled || open
            ? "border-blue-100/90 bg-white/92 shadow-[0_20px_70px_rgba(15,23,42,0.12)] backdrop-blur-2xl"
            : "border-white/80 bg-white/72 shadow-[0_12px_45px_rgba(37,99,235,0.08)] backdrop-blur-xl",
        )}
      >
        <Link href="#top" onClick={closeNavigation} className="relative block h-10 w-36 shrink-0 min-[380px]:w-40 sm:h-11 sm:w-44" aria-label="M&W Labs home">
          <Image src="/mw-logo.png" alt="M&W Labs" fill sizes="176px" priority className="object-contain object-left" />
        </Link>

        <button
          type="button"
          className="grid size-10 place-items-center rounded-xl border border-blue-100 bg-white text-slate-700 transition hover:border-blue-200 hover:text-blue-600 lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="marketing-navigation"
          aria-label={open ? "Close navigation" : "Open navigation"}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        <div
          id="marketing-navigation"
          className={cn(
            "order-last w-full rounded-2xl border border-blue-100 bg-white p-3 shadow-xl shadow-blue-100/40 lg:order-none lg:flex lg:w-auto lg:flex-1 lg:items-center lg:justify-end lg:gap-6 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none",
            open ? "block" : "hidden lg:flex",
          )}
        >
          <div className="flex flex-col text-[0.78rem] font-extrabold uppercase tracking-[0.08em] text-slate-700 lg:flex-row lg:items-center lg:gap-5 xl:gap-7">
            <div className="relative">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-3 transition hover:bg-blue-50 hover:text-blue-600 lg:px-1"
                onClick={() => setServicesOpen((value) => !value)}
                aria-expanded={servicesOpen}
              >
                Services <ChevronDown className={cn("size-3.5 transition", servicesOpen && "rotate-180")} />
              </button>
              {servicesOpen && (
                <div className="z-50 mt-1 w-full rounded-2xl border border-blue-100 bg-white p-2 shadow-[0_24px_70px_rgba(15,23,42,0.16)] lg:absolute lg:left-1/2 lg:w-64 lg:-translate-x-1/2">
                  {services.map((service) => (
                    <Link key={service} href="#services" onClick={closeNavigation} className="block rounded-xl px-3 py-2.5 text-xs normal-case tracking-normal text-slate-600 transition hover:bg-blue-50 hover:text-blue-700">
                      {service}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {navItems.map((item) => (
              <Link key={item.label} href={item.href} onClick={closeNavigation} className="rounded-lg px-3 py-3 transition hover:bg-blue-50 hover:text-blue-600 lg:px-1">
                {item.label}
              </Link>
            ))}
          </div>

          <div className="mt-3 flex flex-col gap-2 border-t border-blue-100 pt-3 lg:mt-0 lg:flex-row lg:items-center lg:border-0 lg:pt-0">
            <Link href="/sign-in" onClick={closeNavigation} className="inline-flex items-center justify-center rounded-xl border border-blue-100 bg-white px-4 py-3 text-xs font-extrabold text-slate-700 transition hover:border-blue-200 hover:text-blue-700">
              Command Center <ArrowUpRight className="ml-2 size-3.5" />
            </Link>
            <Link href="#enquiry" onClick={closeNavigation} className="inline-flex items-center justify-center rounded-xl bg-brand-ink px-5 py-3 text-xs font-extrabold text-white shadow-lg shadow-blue-950/15 transition hover:-translate-y-0.5 hover:bg-blue-600">
              Start a Project <PhoneCall className="ml-2 size-3.5" />
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
