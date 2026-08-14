"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpenText,
  BrainCircuit,
  BriefcaseBusiness,
  Building2,
  CalendarCheck2,
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
  GalleryVerticalEnd,
  Handshake,
  Inbox,
  Library,
  LogOut,
  Menu,
  PanelsTopLeft,
  Search,
  Settings,
  Sparkles,
  UserRound,
  UsersRound,
  X,
  Zap,
} from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

// logo replaced with Image component for admin sidebar
import { NotificationsBell } from "@/components/agency/notifications";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useSession, signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const navigation = [
  {
    label: "Command",
    items: [
      { label: "Overview", href: "/app", icon: Gauge },
      { label: "M&W AI", href: "/app/ai", icon: BrainCircuit, badge: "⌘ J" },
      { label: "Inbox", href: "/app/inbox", icon: Inbox },
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
      { label: "Scheduling", href: "/app/scheduling", icon: CalendarCheck2 },
      { label: "Time", href: "/app/time", icon: Clock3 },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Blog", href: "/app/blog", icon: BookOpenText },
      { label: "Work & Proof", href: "/app/work", icon: GalleryVerticalEnd },
      { label: "SEO Pages", href: "/app/seo-pages", icon: PanelsTopLeft },
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

type AccountMenuProps = {
  user: AgencyShellProps["user"];
  organization: AgencyShellProps["organization"];
  role: string;
  placement: "header" | "sidebar";
  onNavigate: (href: string) => void;
  onLogout: () => Promise<void>;
};

function AccountMenu({ user, organization, role, placement, onNavigate, onLogout }: AccountMenuProps) {
  const header = placement === "header";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={header ? (
          <button type="button" className="group flex h-10 items-center gap-1 rounded-full pl-0.5 pr-1 outline-none transition hover:bg-blue-50 focus-visible:ring-3 focus-visible:ring-blue-200" aria-label="Open profile menu">
            <Avatar className="size-9 ring-2 ring-blue-100 transition group-hover:ring-blue-200">
              {user.image && <AvatarImage src={user.image} alt="" />}
              <AvatarFallback className="bg-brand-navy text-[10px] text-white">{initials(user.name)}</AvatarFallback>
            </Avatar>
            <ChevronDown className="hidden size-3.5 text-slate-400 transition group-data-popup-open:rotate-180 sm:block" />
          </button>
        ) : (
          <button type="button" className="group flex w-full items-center gap-3 rounded-xl p-2 text-left outline-none transition hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring">
            <Avatar className="size-8">
              {user.image && <AvatarImage src={user.image} alt="" />}
              <AvatarFallback className="bg-white/10 text-[11px] text-white">{initials(user.name)}</AvatarFallback>
            </Avatar>
            <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-white">{user.name}</span><span className="block text-[10px] capitalize text-white/35">{role} account</span></span>
            <ChevronDown className="size-3.5 text-white/35 transition group-data-popup-open:rotate-180" />
          </button>
        )}
      />
      <DropdownMenuContent align={header ? "end" : "start"} side={header ? "bottom" : "top"} sideOffset={header ? 8 : 10} className="w-[min(19rem,calc(100vw-1rem))] rounded-2xl border-blue-100 p-2 shadow-[0_18px_55px_rgba(1,22,69,0.18)]">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-2.5 font-normal">
            <div className="flex items-center gap-3">
              <Avatar className="size-10 ring-2 ring-blue-100">
                {user.image && <AvatarImage src={user.image} alt="" />}
                <AvatarFallback className="bg-brand-navy text-xs font-semibold text-white">{initials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-foreground">{user.name}</p><p className="truncate text-[11px] text-muted-foreground">{user.email}</p></div>
              <span className="rounded-full bg-blue-50 px-2 py-1 text-[9px] font-semibold capitalize text-blue-700">{role}</span>
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-muted/40 px-3 py-2"><span className="grid size-7 place-items-center rounded-lg bg-white font-semibold text-blue-700 shadow-sm">{organization.name[0]?.toUpperCase()}</span><span className="min-w-0"><span className="block truncate text-[11px] font-semibold text-foreground">{organization.name}</span><span className="block truncate text-[9px] text-muted-foreground">{organization.slug}</span></span></div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="min-h-10 cursor-pointer rounded-xl px-3" onClick={() => onNavigate("/app/settings")}><UserRound className="size-4 text-blue-600" />Account &amp; workspace</DropdownMenuItem>
        <DropdownMenuItem className="min-h-10 cursor-pointer rounded-xl px-3" onClick={() => onNavigate("/app/team")}><UsersRound className="size-4 text-violet-600" />Team &amp; permissions</DropdownMenuItem>
        <DropdownMenuItem className="min-h-10 cursor-pointer rounded-xl px-3" onClick={() => onNavigate("/app/inbox")}><Inbox className="size-4 text-orange-600" />Notification preferences</DropdownMenuItem>
        <DropdownMenuItem className="min-h-10 cursor-pointer rounded-xl px-3" onClick={() => onNavigate("/")}><Building2 className="size-4 text-cyan-700" />View agency website</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" className="min-h-10 cursor-pointer rounded-xl px-3" onClick={() => void onLogout()}><LogOut className="size-4" />Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AgencyShell({ children, user, organization, role }: AgencyShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [savedPref, setSavedPref] = useState(false);
  const session = useSession();
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const allNavigation = navigation.flatMap((group) => group.items);
  const currentPage = [...allNavigation]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href));
  const mobileNavigation = [
    allNavigation.find((item) => item.href === "/app"),
    allNavigation.find((item) => item.href === "/app/leads"),
    allNavigation.find((item) => item.href === "/app/tasks"),
    allNavigation.find((item) => item.href === "/app/scheduling"),
  ].filter((item): item is (typeof allNavigation)[number] => Boolean(item));

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

  useEffect(() => {
    if (!mobileOpen && !commandOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [commandOpen, mobileOpen]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("mwlabs:sidebarCollapsed");
      if (saved !== null) { setCollapsed(JSON.parse(saved)); setSavedPref(true); }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    function onResize() {
      if (typeof window === "undefined") return;
      const width = window.innerWidth;
      // if user hasn't set a preference, auto-collapse on narrower large screens
      if (!savedPref) setCollapsed(width < 1400);
    }
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [savedPref]);

  useEffect(() => {
    if (session.isPending) return;
    if (!session.data?.user) {
      // avoid redirecting from public auth routes
      if (!pathname.startsWith("/sign-in") && !pathname.startsWith("/register") && !pathname.startsWith("/invite") && !pathname.startsWith("/auth")) {
        router.push("/sign-in");
      }
    }
  }, [session, pathname, router]);

  async function logout() {
    try {
      await signOut();
    } finally {
      try { localStorage.removeItem("mwlabs:sidebarCollapsed"); } catch {}
      router.push("/sign-in");
      router.refresh();
    }
  }

  function navigateAccount(href: string) {
    setMobileOpen(false);
    router.push(href);
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-[4.5rem] items-center justify-between border-b border-sidebar-border px-3">
        <div className="flex items-center gap-3">
          {collapsed ? (
            <span className="rounded-md bg-white p-1">
              <Image src="/mw-logo.png" alt="M&W Labs" width={28} height={28} />
            </span>
          ) : (
            <Link href="/app" aria-label="M&W Labs home" className="inline-flex items-center gap-2.5 font-semibold text-white">
              <span className="rounded-md bg-white p-1">
                <Image src="/mw-logo.png" alt="M&W Labs" width={120} height={36} />
              </span>
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { const next = !collapsed; setCollapsed(next); setSavedPref(true); try { localStorage.setItem("mwlabs:sidebarCollapsed", JSON.stringify(next)); } catch {} }} className="hidden xl:inline-grid grid size-9 place-items-center rounded-xl text-white/60 transition hover:bg-white/10 hover:text-white" aria-label="Toggle sidebar">
            {collapsed ? <ChevronRight className="size-5" /> : <ChevronLeft className="size-5" />}
          </button>
          <button className="grid size-9 place-items-center rounded-xl text-white/60 transition hover:bg-white/10 hover:text-white xl:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X className="size-5" /></button>
        </div>
      </div>
      <div className="border-b border-sidebar-border p-3">
        <Link href="/app/settings" onClick={() => setMobileOpen(false)} className={cn("flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-sidebar-accent", collapsed && "justify-center") }>
          <span className="grid size-8 place-items-center rounded-lg bg-accent font-semibold text-accent-foreground">{organization.name[0]?.toUpperCase()}</span>
          {!collapsed && <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-white">{organization.name}</span><span className="block truncate text-[11px] text-white/38">Agency workspace</span></span>}
          <ChevronDown className="size-3.5 text-white/35" />
        </Link>
      </div>
      <nav className="admin-scrollbar flex-1 overflow-y-auto px-3 py-4" aria-label="Agency workspace">
        {navigation.map((group) => (
          <div key={group.label} className="mb-5">
            {!collapsed && <p className="mb-1.5 px-2.5 text-[9px] font-semibold uppercase tracking-[0.17em] text-white/28">{group.label}</p>}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = item.href === "/app" ? pathname === item.href : pathname.startsWith(item.href);
                const Icon = item.icon;
                const badge = item.href === "/app/inbox"
                  ? unreadNotifications > 0 ? unreadNotifications > 99 ? "99+" : String(unreadNotifications) : null
                  : "badge" in item ? item.badge : null;
                return (
                  <Link onClick={() => setMobileOpen(false)} key={item.href} href={item.href} className={cn("group flex min-h-10 items-center gap-2.5 rounded-xl px-2.5 text-[13px] text-white/60 transition hover:bg-sidebar-accent hover:text-white", active && "bg-sidebar-accent text-white shadow-[inset_3px_0_0_#02d1fa,0_8px_20px_rgba(0,0,0,0.12)]", collapsed && "justify-center px-1.5")}> 
                    <Icon className={cn("size-4 text-white/38 group-hover:text-white/75", active && "text-accent")} />
                    {!collapsed && <span className="flex-1">{item.label}</span>}
                    {badge && !collapsed && <span className={cn("text-[9px] text-white/28", item.label === "Inbox" && "grid min-w-5 place-items-center rounded-full bg-white/8 px-1 py-0.5 text-white/55")}>{badge}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <AccountMenu user={user} organization={organization} role={role} placement="sidebar" onNavigate={navigateAccount} onLogout={logout} />
      </div>
    </div>
  );

  return (
    <div data-agency-shell className="min-h-svh bg-background">
      {/* session handling: redirect to sign-in if not authenticated */}
      {session.isPending ? (
        <div className="fixed inset-0 z-60 grid place-items-center bg-white/90"><div className="animate-pulse text-slate-700">Loading session…</div></div>
      ) : !session.data?.user ? (
        <></>
      ) : null}
      <aside className={cn("fixed inset-y-0 left-0 z-40 hidden xl:block", collapsed ? "w-20" : "w-[264px]")}>{sidebar}</aside>
      {mobileOpen && <div className="fixed inset-0 z-50 xl:hidden"><button className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" onClick={() => setMobileOpen(false)} aria-label="Close navigation overlay" /><aside className="relative h-full w-[min(88vw,320px)] shadow-2xl">{sidebar}</aside></div>}

      <div className={cn(collapsed ? "xl:pl-[80px]" : "xl:pl-[264px]")}> 
        <header className="sticky top-0 z-30 flex h-[4.5rem] items-center gap-3 border-b border-blue-100/80 bg-white/90 px-3 shadow-[0_8px_30px_rgba(15,23,42,0.025)] backdrop-blur-xl sm:px-6">
          <button onClick={() => setMobileOpen(true)} className="grid size-10 shrink-0 place-items-center rounded-xl border border-blue-100 bg-white text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 xl:hidden" aria-label="Open navigation"><Menu className="size-5" /></button>
          <div className="min-w-0 md:hidden"><p className="truncate text-sm font-semibold tracking-[-0.02em]">{currentPage?.label ?? "Workspace"}</p><p className="truncate text-[9px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">{organization.name}</p></div>
          <button onClick={() => { setCommandQuery(""); setCommandOpen(true); }} className="relative hidden w-full max-w-md items-center md:flex">
            <Search className="absolute left-3 size-4 text-muted-foreground" />
            <Input readOnly placeholder="Jump to a workspace…" className="h-10 cursor-pointer border-blue-100 bg-blue-50/55 pl-9 pr-14 text-xs shadow-none" />
            <kbd className="absolute right-2.5 rounded border bg-white px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">⌘ K</kbd>
          </button>
          <div className="ml-auto flex items-center gap-1.5">
            <button onClick={() => { setCommandQuery(""); setCommandOpen(true); }} className="grid size-10 place-items-center rounded-full text-muted-foreground transition hover:bg-blue-50 hover:text-blue-700 md:hidden" aria-label="Search workspaces"><Search className="size-4" /></button>
            <Button nativeButton={false} render={<Link href="/app/ai" />} className="hidden h-10 gap-2 rounded-full border-0 bg-[linear-gradient(110deg,#155dfc,#0188ec_58%,#02b9e8)] px-4 text-xs text-white shadow-[0_10px_24px_rgba(21,93,252,0.22)] hover:-translate-y-0.5 hover:brightness-105 sm:inline-flex">
              <Sparkles className="size-3.5" /> Ask M&amp;W AI
            </Button>
            <NotificationsBell onCountChange={setUnreadNotifications} />
            <AccountMenu user={user} organization={organization} role={role} placement="header" onNavigate={navigateAccount} onLogout={logout} />
          </div>
        </header>
        <main className="min-h-[calc(100svh-4.5rem)] pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-0">{children}</main>
      </div>

      <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-2xl border border-blue-100 bg-white/95 p-1.5 shadow-[0_18px_50px_rgba(1,22,69,0.18)] backdrop-blur-xl md:hidden" style={{ paddingBottom: "max(0.375rem, env(safe-area-inset-bottom))" }} aria-label="Mobile quick navigation">
        {mobileNavigation.map((item) => {
          const active = item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
          return <Link key={item.href} href={item.href} className={cn("flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[9px] font-semibold text-slate-500 transition", active && "bg-blue-50 text-blue-700")}><item.icon className={cn("size-4", active && "text-blue-600")} /><span>{item.label === "Scheduling" ? "Schedule" : item.label}</span></Link>;
        })}
        <button onClick={() => setMobileOpen(true)} className={cn("flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[9px] font-semibold text-slate-500 transition", mobileOpen && "bg-blue-50 text-blue-700")}><Menu className="size-4" /><span>More</span></button>
      </nav>

      {commandOpen && (
        <div className="fixed inset-0 z-[70] flex items-end bg-slate-950/35 p-2 backdrop-blur-sm sm:grid sm:place-items-start sm:px-4 sm:pt-[12vh]" onMouseDown={() => setCommandOpen(false)}>
          <div className="max-h-[78svh] w-full overflow-hidden rounded-2xl border bg-white shadow-2xl sm:max-w-xl" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-center gap-3 border-b px-4"><Search className="size-4 text-muted-foreground" /><input autoFocus value={commandQuery} onChange={(event) => setCommandQuery(event.target.value)} className="h-14 flex-1 bg-transparent text-sm outline-none" placeholder="Jump to a workspace…" /></div>
            <div className="admin-scrollbar max-h-[calc(78svh-3.5rem)] overflow-y-auto p-2">
              <p className="px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">{commandQuery ? "Matching workspaces" : "Quick access"}</p>
              {allNavigation.filter((item) => item.label.toLowerCase().includes(commandQuery.trim().toLowerCase())).slice(0, commandQuery ? 20 : 8).map((item) => <Link onClick={() => setCommandOpen(false)} key={item.href} href={item.href} className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition hover:bg-blue-50 hover:text-blue-700"><span className="grid size-8 place-items-center rounded-lg bg-muted"><item.icon className="size-4 text-muted-foreground" /></span>{item.label}</Link>)}
              {navigation.flatMap((group) => group.items).filter((item) => item.label.toLowerCase().includes(commandQuery.trim().toLowerCase())).length === 0 && <p className="px-3 py-8 text-center text-xs text-muted-foreground">No workspace matches “{commandQuery}”.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
