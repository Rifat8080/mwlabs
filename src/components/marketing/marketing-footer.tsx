import Link from "next/link";

import { Logo } from "@/components/logo";

export function MarketingFooter() {
  return (
    <footer className="border-t border-blue-100/10 bg-brand-ink px-5 py-10 text-white sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-[1340px] gap-10 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <Logo className="text-white" />
          <p className="mt-5 max-w-sm text-sm leading-6 text-white/50">
            From code to campaigns—we build digital growth systems for ambitious businesses.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/55">
          <Link href="#services" className="hover:text-white">Services</Link>
          <Link href="https://mwlabs.digital/our-work" className="hover:text-white">Our work</Link>
          <Link href="/sign-in" className="hover:text-white">Team login</Link>
          <span>© 2026 M&amp;W Labs</span>
        </div>
      </div>
    </footer>
  );
}
