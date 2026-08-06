"use client";

import Link from "next/link";
import { MessageCircle, Share2, X } from "lucide-react";
import { useState, type ComponentProps } from "react";

type IconProps = ComponentProps<"svg">;

function FacebookIcon(props: IconProps) {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}><path d="M13.7 21v-8h2.8l.4-3.2h-3.2V7.75c0-.93.26-1.56 1.6-1.56H17V3.32c-.3-.04-1.3-.13-2.48-.13-2.46 0-4.15 1.5-4.15 4.27V9.8H7.6V13h2.77v8h3.33Z" /></svg>;
}

function InstagramIcon(props: IconProps) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4.2" /><circle cx="17.4" cy="6.7" r="1" fill="currentColor" stroke="none" /></svg>;
}

function LinkedInIcon(props: IconProps) {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}><path d="M6.4 8.2H3.1V21h3.3V8.2ZM4.75 3A1.9 1.9 0 1 0 4.74 6.8 1.9 1.9 0 0 0 4.75 3ZM21 13.65c0-3.85-2.05-5.64-4.79-5.64-2.2 0-3.19 1.21-3.74 2.06V8.2H9.18V21h3.29v-6.34c0-1.67.32-3.3 2.4-3.3 2.05 0 2.08 1.92 2.08 3.41V21H21v-7.35Z" /></svg>;
}

function YouTubeIcon(props: IconProps) {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}><path d="M21.55 6.2a2.5 2.5 0 0 0-1.76-1.77C18.23 4 12 4 12 4s-6.23 0-7.79.43A2.5 2.5 0 0 0 2.45 6.2C2 7.76 2 11 2 11s0 3.24.45 4.8a2.5 2.5 0 0 0 1.76 1.77C5.77 18 12 18 12 18s6.23 0 7.79-.43a2.5 2.5 0 0 0 1.76-1.77C22 14.24 22 11 22 11s0-3.24-.45-4.8ZM10 14.1V7.9l5.2 3.1-5.2 3.1Z" /></svg>;
}

function WhatsAppIcon(props: IconProps) {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}><path d="M12 2a9.82 9.82 0 0 0-8.45 14.83L2 22l5.3-1.5A9.95 9.95 0 1 0 12 2Zm0 17.98a7.95 7.95 0 0 1-4.06-1.11l-.29-.17-3.15.89.92-3.07-.19-.31A7.84 7.84 0 0 1 4.02 12 7.98 7.98 0 1 1 12 19.98Zm4.38-5.96c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.93-1.19a7.22 7.22 0 0 1-1.34-1.66c-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41h-.46a.89.89 0 0 0-.64.3c-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.51.1.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" /></svg>;
}

const socials = [
  { label: "Facebook", href: "https://www.facebook.com/info.mwlabs/", icon: FacebookIcon, color: "hover:bg-[#1877f2]" },
  { label: "Instagram", href: "https://www.instagram.com/info.mwlabs", icon: InstagramIcon, color: "hover:bg-[#e1306c]" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/mwlabs", icon: LinkedInIcon, color: "hover:bg-[#0a66c2]" },
  { label: "YouTube", href: "https://youtube.com/@mw_labs", icon: YouTubeIcon, color: "hover:bg-[#ff0000]" },
];

export function FloatingActions() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside aria-label="M&W Labs social media" className="fixed right-4 top-1/2 z-[55] hidden -translate-y-1/2 flex-col items-center rounded-full border border-blue-100/90 bg-white/88 p-1.5 shadow-[0_24px_70px_rgba(15,23,42,0.14)] backdrop-blur-xl lg:flex">
        <span className="mb-1 grid size-10 place-items-center rounded-full bg-brand-ink text-[0.6rem] font-black tracking-tight text-white">M&amp;W</span>
        {socials.map(({ label, href, icon: Icon, color }) => (
          <Link key={label} href={href} target="_blank" rel="noreferrer" aria-label={`Follow M&W Labs on ${label}`} className={`group relative grid size-10 place-items-center rounded-full text-slate-500 transition duration-300 hover:-translate-x-1 hover:text-white ${color}`}>
            <Icon className="size-4" />
            <span className="pointer-events-none absolute right-[calc(100%+0.65rem)] whitespace-nowrap rounded-lg bg-brand-ink px-2.5 py-1.5 text-[0.65rem] font-extrabold text-white opacity-0 shadow-xl transition group-hover:opacity-100">{label}</span>
          </Link>
        ))}
        <span className="my-1 h-px w-5 bg-blue-100" />
        <Link href="#enquiry" aria-label="Start a project" className="grid size-10 place-items-center rounded-full bg-blue-600 text-white transition hover:scale-105 hover:bg-blue-700"><MessageCircle className="size-4" /></Link>
      </aside>

      <div className="fixed bottom-5 right-4 z-[60] flex flex-col items-end gap-2 lg:hidden">
        {open && (
          <div className="flex flex-col gap-2 rounded-full border border-blue-100 bg-white/92 p-1.5 shadow-2xl backdrop-blur-xl">
            {socials.map(({ label, href, icon: Icon, color }) => (
              <Link key={label} href={href} target="_blank" rel="noreferrer" aria-label={`Follow M&W Labs on ${label}`} className={`grid size-11 place-items-center rounded-full bg-slate-50 text-slate-600 transition hover:text-white ${color}`}><Icon className="size-4" /></Link>
            ))}
          </div>
        )}
        <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? "Close social links" : "Open social links"} className="grid size-13 place-items-center rounded-full border-4 border-white bg-brand-ink text-white shadow-[0_20px_55px_rgba(15,23,42,0.25)] transition hover:scale-105 hover:bg-blue-600">
          {open ? <X className="size-5" /> : <Share2 className="size-5" />}
        </button>
      </div>

      <Link href="https://wa.me/442037697100" target="_blank" rel="noreferrer" aria-label="Chat with M&W Labs on WhatsApp" className="group fixed bottom-20 right-4 z-[55] flex items-center gap-3 rounded-full border-4 border-white bg-[#25d366] p-1.5 text-sm font-black text-white shadow-[0_22px_65px_rgba(37,211,102,0.28)] transition duration-300 hover:-translate-y-1 hover:bg-[#1fbd5a] sm:bottom-5 sm:right-20 sm:p-2 sm:pr-5 lg:bottom-6 lg:right-6">
        <span className="grid size-10 place-items-center rounded-full bg-white/15"><WhatsAppIcon className="size-5" /></span><span className="hidden sm:inline">Let&apos;s talk</span>
      </Link>
    </>
  );
}
