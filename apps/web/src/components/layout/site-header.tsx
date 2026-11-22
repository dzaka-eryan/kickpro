"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Menu, ShieldCheck, X } from "lucide-react";
import {
  getClientSession,
  logoutCommunitySession,
  setClientSession,
  type CommunitySession,
} from "@/lib/auth/session-client";

const NAV_LINKS = [
  { href: "/", label: "Beranda", mobileLabel: "Beranda" },
  {
    href: "/komunitas",
    label: "Komunitas",
    mobileLabel: "Direktori Komunitas",
    matchPrefix: ["/komunitas", "/cari-lawan"],
  },
  { href: "/tentang-kami", label: "Tentang Kami", mobileLabel: "Tentang Kami" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [session, setSession] = React.useState<CommunitySession | null>(null);

  React.useEffect(() => {
    function syncSession() {
      const { session: localSess } = getClientSession();
      if (localSess) {
        setSession(localSess);
        return;
      }
      void fetch("/api/auth/session")
        .then((r) => (r.ok ? (r.json() as Promise<{ authenticated?: boolean; session?: CommunitySession; token?: string }>) : null))
        .then((data) => {
          if (data?.authenticated && data.session && data.token) {
            setClientSession(data.token, data.session);
            setSession(data.session);
          } else {
            setSession(null);
          }
        })
        .catch(() => {
          // ignore offline
        });
    }

    syncSession();
    window.addEventListener("kickpro-session-change", syncSession);
    return () => window.removeEventListener("kickpro-session-change", syncSession);
  }, [pathname]);

  async function handleLogout() {
    await logoutCommunitySession();
    setSession(null);
    router.push("/auth");
  }

  function isLinkActive(item: (typeof NAV_LINKS)[number]): boolean {
    if (item.href === "/") {
      return pathname === "/";
    }
    if (item.matchPrefix) {
      return item.matchPrefix.some((prefix) => pathname.startsWith(prefix));
    }
    return pathname.startsWith(item.href);
  }

  return (
    <header className="relative z-50 w-full border-b border-slate-200/80 bg-white/95 shadow-xs backdrop-blur-xl transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-center text-left transition hover:opacity-90"
          aria-label="KickPro beranda"
        >
          <img
            src="/kickprologo.png"
            alt="KickPro"
            className="h-9 w-auto object-contain sm:h-11"
          />
        </Link>

        <nav
          className="hidden items-center gap-1 rounded-2xl border border-slate-200/60 bg-slate-50/80 p-1 shadow-inner md:flex"
          aria-label="Navigasi utama"
        >
          {NAV_LINKS.map((item) => {
            const active = isLinkActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-4 py-2 text-xs font-extrabold transition ${active
                  ? "bg-white text-emerald-950 shadow-sm"
                  : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
                  }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {session ? (
            <>
              <Link
                href={`/club/${session.clubId}`}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-950 px-3.5 py-2.5 text-xs font-extrabold text-lime shadow-sm transition hover:bg-emerald-900 sm:px-4"
              >
                <LayoutDashboard className="size-4" aria-hidden="true" />
                <span className="max-w-36 truncate">{session.clubName}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-xs transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                title="Sign Out Komunitas"
                aria-label="Sign Out Komunitas"
              >
                <LogOut className="size-4" aria-hidden="true" />
              </button>
            </>
          ) : (
            <Link
              href="/auth"
              className={`flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-extrabold transition sm:px-4 ${
                pathname.startsWith("/auth")
                  ? "bg-lime text-emerald-950 shadow-glow"
                  : "bg-emerald-950 text-white shadow-sm hover:bg-emerald-900"
              }`}
            >
              <ShieldCheck className="size-4 text-lime" aria-hidden="true" />
              <span>Sign In / Daftar Komunitas</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 md:hidden"
            aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-3 shadow-xl md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((item) => {
              const active = isLinkActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-left text-xs font-bold transition ${active
                    ? "bg-emerald-50 font-extrabold text-emerald-900"
                    : "text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <span>{item.mobileLabel}</span>
                  {active && <span className="size-1.5 rounded-full bg-emerald-600" />}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
