"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Shield, Swords, Ticket, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PLAYER_NAV_ITEMS: readonly NavItem[] = [
  { label: "Main Bareng", href: "/explore", icon: Compass },
  { label: "Komunitas", href: "/komunitas", icon: Swords },
  { label: "Undangan", href: "/undangan/event-jumat-malam", icon: Ticket },
  { label: "Klub", href: "/club/club-garuda-muda", icon: Shield },
  { label: "Sign In", href: "/auth", icon: User },
];

export interface PlayerLayoutProps {
  children: React.ReactNode;
  activeHref?: string;
}

export function PlayerBottomNav({
  activeHref,
  embedded = false,
}: {
  activeHref?: string;
  embedded?: boolean;
}) {
  const pathname = usePathname();
  const current = activeHref ?? pathname;

  return (
    <nav
      aria-label="Navigasi Player Mode"
      className={cn(
        "border-t border-slate-200 bg-white/95 backdrop-blur-xl",
        embedded
          ? "w-full rounded-b-xl"
          : "fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom)] md:hidden",
      )}
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {PLAYER_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = current === item.href;
          return (
            <li key={item.label}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-h-[56px] flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] font-semibold transition-colors",
                  isActive ? "text-emerald-950 font-extrabold" : "text-slate-600 hover:text-slate-900",
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function PlayerLayout({ children, activeHref }: PlayerLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col text-slate-900 antialiased selection:bg-lime selection:text-emerald-950">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-16 pt-5 sm:px-6 sm:pt-7 lg:px-8">
        {children}
      </main>

      <div className="pb-16 md:pb-0">
        <SiteFooter />
      </div>

      <PlayerBottomNav activeHref={activeHref} />
    </div>
  );
}
