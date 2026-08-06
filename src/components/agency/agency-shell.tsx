"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  BrainCircuit,
  BriefcaseBusiness,
  CalendarDays,
  ChartNoAxesCombined,
  CheckSquare2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  ContactRound,
  FileCheck2,
  FileStack,
  Gauge,
  Handshake,
  Inbox,
  Library,
  Menu,
  PanelLeftClose,
  Search,
  Settings,
  Sparkles,
  UsersRound,
  X,
  Zap,
} from "lucide-react";

import { Logo } from "@/components/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const navigation = [
  {
    label: "Command",
    items: [
      { label: "Overview", href: "/app", icon: Gauge },
      { label: "M&W AI", href: "/app/ai", icon: BrainCircuit, badge: "⌘ J" },
      { label: "Inbox", href: "/app/inbox", icon: Inbox, badge: "8" },
    ],
  },
  {
    label: "Revenue",
    items: [
      { label: "Leads", href: "/app/leads", icon: ContactRound },
      { label: "Proposals", href: "/app/proposals", icon: FileCheck2 },
      { label: "Contracts", href: "/app/contracts", icon: Handshake },
      { label: "Clients", href: "/app/clients", icon: BriefcaseBusiness },
      { label: "Onboarding", href: "/app/onboarding", icon: Library },
    ],
  },
  {
    label: "Delivery",
    items: [
      { label: "Projects", href: "/app/projects", icon: FileStack },
      { label: "Tasks", href: "/app/tasks", icon: CheckSquare2 },
      { label: "Calendar", href: "/app/calendar", icon: CalendarDays },
      { label: "Time", href: "/app/time", icon: Clock3 },
    ],
  },
  {
    label: "Business",
    items: [
      { label: "Finance", href: "/app/finance", icon: CircleDollarSign },
      { label: "Team", href: "/app/team", icon: UsersRound },
      { label: "Documents", href: "/app/documents", icon: Library },
      { label: "Automations", href: "/app/automations", icon: Zap },
      { label: "Reports", href: "/app/reports", icon: ChartNoAxesCombined },
      { label: "Settings", href: "/app/settings", icon: Settings },
    ],
  },
];

type AgencyShellProps = {
  children: React.ReactNode;
  user: { name: string; email: string; image?: string | null };
  organization: { name: string; slug: string };
  role: string;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AgencyShell({ children, user, organization, role }: AgencyShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((open) => !open);
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "j") {
        event.preventDefault();
        router.push("/app/ai");
      }
      if (event.key === "Escape") setCommandOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);

  async function logout() {
    await authClient.signOut();
    router.push("/sign-in");
    router.refresh();
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-17 items-center justify-between border-b border-sidebar-border px-5">
        <Logo href="/app" className="text-white" />
        <PanelLeftClose className="hidden size-4 text-white/30 lg:block" />
        <button className="lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X className="size-5" /></button>
      </div>
      <div className="border-b border-sidebar-border p-3">
        <button className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-sidebar-accent">
          <span className="grid size-8 place-items-center rounded-lg bg-accent font-semibold text-accent-foreground">{organization.name[0]?.toUpperCase()}</span>
          <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-white">{organization.name}</span><span className="block truncate text-[11px] text-white/38">Agency workspace</span></span>
          <ChevronDown className="size-3.5 text-white/35" />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Agency workspace">
        {navigation.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="mb-1.5 px-2.5 text-[9px] font-semibold uppercase tracking-[0.17em] text-white/28">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = item.href === "/app" ? pathname === item.href : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link onClick={() => setMobileOpen(false)} key={item.href} href={item.href} className={cn("group flex h-8.5 items-center gap-2.5 rounded-lg px-2.5 text-[13px] text-white/57 transition hover:bg-sidebar-accent hover:text-white", active && "bg-sidebar-accent text-white shadow-sm")}>
                    <Icon className={cn("size-4 text-white/38 group-hover:text-white/75", active && "text-accent")} />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && <span className={cn("text-[9px] text-white/28", item.label === "Inbox" && "grid min-w-5 place-items-center rounded-full bg-white/8 px-1 py-0.5 text-white/55")}>{item.badge}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-sidebar-accent">
          <Avatar className="size-8"><AvatarFallback className="bg-white/10 text-[11px] text-white">{initials(user.name)}</AvatarFallback></Avatar>
          <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-white">{user.name}</span><span className="block text-[10px] capitalize text-white/35">{role} · Sign out</span></span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-svh bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[244px] lg:block">{sidebar}</aside>
      {mobileOpen && <div className="fixed inset-0 z-50 lg:hidden"><button className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} aria-label="Close navigation overlay" /><aside className="relative h-full w-[284px] shadow-2xl">{sidebar}</aside></div>}

      <div className="lg:pl-[244px]">
        <header className="sticky top-0 z-30 flex h-17 items-center gap-3 border-b bg-white/88 px-4 backdrop-blur-xl sm:px-6">
          <button onClick={() => setMobileOpen(true)} className="grid size-9 place-items-center rounded-lg hover:bg-muted lg:hidden" aria-label="Open navigation"><Menu className="size-5" /></button>
          <button onClick={() => setCommandOpen(true)} className="relative hidden w-full max-w-md items-center md:flex">
            <Search className="absolute left-3 size-4 text-muted-foreground" />
            <Input readOnly placeholder="Search clients, projects, anything…" className="h-9 cursor-pointer bg-muted/65 pl-9 pr-14 text-xs" />
            <kbd className="absolute right-2.5 rounded border bg-white px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">⌘ K</kbd>
          </button>
          <div className="ml-auto flex items-center gap-1.5">
            <Button render={<Link href="/app/ai" />} variant="ghost" className="hidden h-9 gap-2 rounded-full bg-brand-surface px-3 text-xs text-primary hover:bg-blue-100 sm:inline-flex">
              <Sparkles className="size-3.5" /> Ask M&amp;W AI
            </Button>
            <Button variant="ghost" size="icon" className="relative rounded-full"><Bell className="size-4" /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-orange-500" /></Button>
            <Avatar className="ml-1 size-8"><AvatarFallback className="bg-foreground text-[10px] text-background">{initials(user.name)}</AvatarFallback></Avatar>
          </div>
        </header>
        <main className="min-h-[calc(100svh-4.25rem)]">{children}</main>
      </div>

      {commandOpen && (
        <div className="fixed inset-0 z-[70] grid place-items-start bg-black/20 px-4 pt-[12vh] backdrop-blur-sm" onMouseDown={() => setCommandOpen(false)}>
          <div className="w-full max-w-xl overflow-hidden rounded-2xl border bg-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-center gap-3 border-b px-4"><Search className="size-4 text-muted-foreground" /><input autoFocus className="h-14 flex-1 bg-transparent text-sm outline-none" placeholder="Jump to a workspace…" /></div>
            <div className="p-2">
              <p className="px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Quick access</p>
              {navigation.flatMap((group) => group.items).slice(0, 8).map((item) => <Link onClick={() => setCommandOpen(false)} key={item.href} href={item.href} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-muted"><item.icon className="size-4 text-muted-foreground" />{item.label}</Link>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
