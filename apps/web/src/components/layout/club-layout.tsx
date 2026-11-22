"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Swords,
  Users,
  Wallet,
} from "lucide-react";
import { logoutCommunitySession } from "@/lib/auth/session-client";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface ClubNavItem {
  label: string;
  section: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CLUB_NAV_ITEMS: readonly ClubNavItem[] = [
  { label: "Dashboard", section: "dashboard", icon: LayoutDashboard },
  { label: "Event Mabar", section: "events", icon: CalendarDays },
  { label: "Sparring", section: "sparring", icon: Swords },
  { label: "Buku Kas", section: "wallet", icon: Wallet },
  { label: "Anggota", section: "members", icon: Users },
];

export interface ClubLayoutProps {
  clubId: string;
  clubName?: string;
  clubLogoUrl?: string | null;
  activeSection?: string;
  children: React.ReactNode;
}

export function ClubSidebarContent({
  clubId,
  clubName,
  clubLogoUrl,
  activeSection = "dashboard",
  onNavigate,
}: {
  clubId: string;
  clubName: string;
  clubLogoUrl?: string | null;
  activeSection?: string;
  onNavigate?: () => void;
}) {
  const initials = clubName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "KP";

  return (
    <div className="flex h-full flex-col justify-between gap-6">
      <div>
        <div className="flex items-center gap-2.5 border-b border-border pb-4">
          {clubLogoUrl ? (
            <img
              src={clubLogoUrl}
              alt={clubName}
              className="h-9 w-9 shrink-0 rounded-lg border border-slate-200 object-cover"
            />
          ) : (
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-black text-primary-foreground">
              {initials}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">{clubName}</p>
            <p className="text-xs text-slate-600">Club / Host Mode</p>
          </div>
        </div>

        <nav aria-label="Navigasi Club Mode" className="mt-4 space-y-1">
          {CLUB_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.section;
            const href =
              item.section === "dashboard"
                ? `/club/${clubId}`
                : `/club/${clubId}#${item.section}`;
            return (
              <Link
                key={item.section}
                href={href}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-emerald-50 text-emerald-900"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-border pt-4">
        <Link
          href="/explore"
          onClick={onNavigate}
          className="flex w-full items-center justify-center rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-semibold text-slate-900 transition-colors hover:bg-slate-200"
        >
          Kembali ke Player Mode
        </Link>
      </div>
    </div>
  );
}

export function ClubLayout({
  clubId,
  clubName = "Garuda Muda FC",
  clubLogoUrl,
  activeSection = "dashboard",
  children,
}: ClubLayoutProps) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  async function handleSignOut() {
    await logoutCommunitySession();
    router.push("/auth");
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card p-5 md:block">
        <ClubSidebarContent
          clubId={clubId}
          clubName={clubName}
          clubLogoUrl={clubLogoUrl}
          activeSection={activeSection}
        />
      </aside>

      <div className="flex flex-1 flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
          <div className="flex h-14 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-3">
              <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="md:hidden"
                    aria-label="Buka menu navigasi klub"
                  >
                    <Menu className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Menu Klub</SheetTitle>
                    <SheetDescription>Navigasi pengelolaan klub {clubName}</SheetDescription>
                  </SheetHeader>
                  <ClubSidebarContent
                    clubId={clubId}
                    clubName={clubName}
                    clubLogoUrl={clubLogoUrl}
                    activeSection={activeSection}
                    onNavigate={() => setDrawerOpen(false)}
                  />
                </SheetContent>
              </Sheet>

              <span className="text-sm font-bold text-slate-900 md:hidden">{clubName}</span>
              <Badge variant="lime">Club Mode</Badge>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="hidden items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 sm:inline-flex">
                <KeyRound className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                <span>Session Aktif</span>
              </span>
              <Link
                href="/komunitas"
                className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-slate-200"
              >
                Direktori Komunitas
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-100"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
