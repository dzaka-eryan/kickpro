import Link from "next/link";
import { MapPin, ShieldCheck, Sparkles, Users } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200/80 bg-white text-slate-600">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-12">
          {/* BRAND COLUMN */}
          <div className="space-y-4 md:col-span-5">
            <Link
              href="/"
              className="group inline-flex items-center text-left transition hover:opacity-90"
              aria-label="KickPro beranda"
            >
              <img
                src="/kickprologo.png"
                alt="KickPro"
                className="h-9 w-auto object-contain sm:h-10"
              />
            </Link>

            <p className="max-w-sm text-xs leading-relaxed text-slate-500">
              Membangun ekosistem sepak bola Indonesia dari komunitas. Platform manajemen manifest
              slot mabar, halaman profil komunitas, dan pembayaran QRIS otomatis tanpa drama.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-800">
                <Sparkles className="size-3.5 text-emerald-600" aria-hidden="true" />
                Sepak Bola • Mini Soccer • Futsal
              </span>
            </div>
          </div>

          {/* NAVIGATION LINKS */}
          <div className="space-y-3 md:col-span-3">
            <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-slate-900">
              Menu Utama
            </h3>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <Link href="/" className="transition hover:text-emerald-700">
                  Landing Page
                </Link>
              </li>
              <li>
                <Link href="/explore" className="transition hover:text-emerald-700">
                  Main Bareng (Cari Mabar)
                </Link>
              </li>
              <li>
                <Link href="/komunitas" className="transition hover:text-emerald-700">
                  Direktori Komunitas
                </Link>
              </li>
              <li>
                <Link href="/tentang-kami" className="transition hover:text-emerald-700">
                  Tentang Kami
                </Link>
              </li>
            </ul>
          </div>

          {/* AKUN & KOMUNITAS */}
          <div className="space-y-3 md:col-span-4">
            <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-slate-900">
              Portal Komunitas
            </h3>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <Link
                  href="/auth?mode=register"
                  className="inline-flex items-center gap-1.5 transition hover:text-emerald-700"
                >
                  <ShieldCheck className="size-3.5 text-emerald-700" aria-hidden="true" />
                  <span>Daftar &amp; Buat Komunitas</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/auth?mode=login"
                  className="inline-flex items-center gap-1.5 transition hover:text-emerald-700"
                >
                  <Users className="size-3.5 text-emerald-700" aria-hidden="true" />
                  <span>Sign In Kapten Komunitas</span>
                </Link>
              </li>
              <li className="flex items-center gap-1.5 pt-1 text-slate-400">
                <MapPin className="size-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
                <span>Jakarta, Tangerang, Depok &amp; sekitarnya</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 text-xs text-slate-400 sm:flex-row">
          <p>© {new Date().getFullYear()} KickPro Indonesia. Seluruh hak cipta dilindungi.</p>
          <div className="flex items-center gap-4 font-semibold text-slate-500">
            <Link href="/tentang-kami" className="hover:text-emerald-700">
              Visi Komunitas
            </Link>
            <span>•</span>
            <Link href="/undangan/event-jumat-malam" className="hover:text-emerald-700">
              Contoh Page Komunitas
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
