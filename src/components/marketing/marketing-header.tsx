import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export function MarketingHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-foreground/8 bg-background/82 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex" aria-label="Main navigation">
          <Link href="#services" className="transition-colors hover:text-foreground">Services</Link>
          <Link href="https://mwlabs.digital/our-work" className="transition-colors hover:text-foreground">Our work</Link>
          <Link href="#process" className="transition-colors hover:text-foreground">Process</Link>
          <Link href="https://mwlabs.digital/blog" className="transition-colors hover:text-foreground">Insights</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button render={<Link href="/sign-in" />} variant="ghost" className="hidden sm:inline-flex">
            Team login
          </Button>
          <Button render={<Link href="https://mwlabs.digital/contact" />} className="rounded-full bg-primary px-5 text-primary-foreground shadow-lg shadow-primary/20 hover:bg-brand-primary-hover">
            Start a project <ArrowUpRight className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
