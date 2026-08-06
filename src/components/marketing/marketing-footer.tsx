import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUp, Mail, MapPin, Phone, Sparkles } from "lucide-react";

const footerGroups = [
  {
    title: "Capabilities",
    links: [
      { label: "Web & Software", href: "#services" },
      { label: "Digital Marketing", href: "#services" },
      { label: "Brand Systems", href: "#services" },
      { label: "AI & Automation", href: "#services" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "The Studio", href: "#about" },
      { label: "Selected Work", href: "#work" },
      { label: "Our Process", href: "#process" },
      { label: "Insights", href: "#insights" },
    ],
  },
  {
    title: "Workspace",
    links: [
      { label: "Agency Login", href: "/sign-in" },
      { label: "Start a Project", href: "#enquiry" },
      { label: "Testimonials", href: "#testimonials" },
      { label: "Back to Top", href: "#top" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer id="contact" className="relative overflow-hidden bg-brand-ink text-white">
      <div className="pointer-events-none absolute -right-36 -top-40 size-[34rem] rounded-full bg-blue-600/20 blur-[110px]" />
      <div className="pointer-events-none absolute -bottom-48 left-1/4 size-[30rem] rounded-full bg-cyan-400/10 blur-[120px]" />

      <div className="mx-auto max-w-[104rem] px-4 py-14 sm:px-6 sm:py-20 lg:px-12 2xl:px-16">
        <div className="relative grid gap-10 border-b border-white/10 pb-14 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.22em] text-cyan-300"><Sparkles className="size-4" /> Have an ambitious idea?</div>
            <h2 className="mt-5 max-w-5xl text-5xl font-black leading-[0.9] tracking-[-0.06em] sm:text-7xl lg:text-[6.5rem]">Let&apos;s give it<br /><span className="text-gradient-light">momentum.</span></h2>
          </div>
          <Link href="#enquiry" className="group inline-flex size-36 items-center justify-center rounded-full border border-white/20 bg-white text-center text-sm font-black text-brand-ink shadow-[0_30px_80px_rgba(2,209,250,0.18)] transition duration-500 hover:scale-105 hover:bg-cyan-300 sm:size-44">
            Start a project <ArrowRight className="ml-2 size-4 transition group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid gap-12 py-14 md:grid-cols-2 lg:grid-cols-[1.35fr_0.7fr_0.7fr_0.7fr_1fr]">
          <div>
            <Link href="#top" className="relative block h-12 w-48 rounded-lg bg-white px-2" aria-label="M&W Labs home">
              <Image src="/mw-logo.png" alt="M&W Labs" fill sizes="192px" className="object-contain p-1.5" />
            </Link>
            <p className="mt-5 max-w-xs text-sm font-semibold leading-7 text-slate-400">An independent digital studio building brands, products, campaigns, and intelligent operating systems.</p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-emerald-300"><span className="size-2 animate-pulse rounded-full bg-emerald-400" /> Accepting selected projects</div>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-500">{group.title}</h3>
              <ul className="mt-5 space-y-3 text-sm font-semibold text-slate-300">
                {group.links.map((link) => <li key={link.label}><Link href={link.href} className="transition hover:text-cyan-300">{link.label}</Link></li>)}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-500">Contact</h3>
            <ul className="mt-5 space-y-4 text-sm font-semibold leading-6 text-slate-300">
              <li className="flex items-center gap-3"><Phone className="size-4 text-cyan-300" /><Link href="tel:+8801704014210" className="hover:text-white">+880 1704 014 210</Link></li>
              <li className="flex items-center gap-3"><Mail className="size-4 text-cyan-300" /><Link href="mailto:hello@mwlabs.digital" className="hover:text-white">hello@mwlabs.digital</Link></li>
              <li className="flex items-start gap-3"><MapPin className="mt-1 size-4 text-cyan-300" /><span>Dhaka, Bangladesh<br />Working worldwide</span></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 pt-6 text-xs font-bold uppercase tracking-[0.14em] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 M&amp;W Labs · Built locally</p>
          <Link href="#top" className="inline-flex items-center text-slate-300 transition hover:text-cyan-300">Return to top <ArrowUp className="ml-2 size-3.5" /></Link>
        </div>
      </div>
    </footer>
  );
}
