import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Link2,
  QrCode,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col text-slate-900 antialiased selection:bg-lime selection:text-emerald-950">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-20 pt-5 sm:px-6 sm:pt-7 lg:px-8">
        <div className="space-y-12 sm:space-y-16">
          {/* 1. HERO SECTION */}
          <section
            id="landingHero"
            className="relative overflow-hidden rounded-[2.5rem] bg-emerald-950 text-white shadow-soft"
          >
            <img
              src="/images/bollaaaaa.jpeg"
              alt="Pertandingan sepak bola di bawah lampu stadion malam hari"
              className="absolute inset-0 size-full object-cover object-center opacity-30 mix-blend-luminosity"
            />
            <div className="bg-gradient-to-t from-emerald-950 via-emerald-950/85 to-emerald-950/50 absolute inset-0" />
            <div className="border-lime/10 pointer-events-none absolute -right-24 -top-24 size-96 rounded-full border-[40px] blur-xl" />

            <div className="relative mx-auto flex max-w-4xl flex-col items-center px-6 py-16 text-center sm:px-10 sm:py-24 lg:py-28">
              <h1 className="font-display text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl lg:leading-[1.15]">
                Lebih dari sekedar Fun Football,{" "}
                <span className="text-lime">
                  Kami Membangun Ekosistem Sepakbola dari komunitas
                </span>
              </h1>

              <div className="mt-8 flex justify-center">
                <Link
                  href="/auth?mode=register&role=admin"
                  className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-lime px-8 py-4 text-sm font-black uppercase tracking-wider text-emerald-950 shadow-glow transition hover:scale-105 hover:bg-[#d6fa42]"
                >
                  <ShieldCheck
                    className="size-5 transition group-hover:scale-110"
                    aria-hidden="true"
                  />
                  <span>Buat Komunitas</span>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </section>

          {/* 2. CARA BUAT TIM / KOMUNITAS */}
          <section
            id="caraBuatTimKomunitas"
            className="mx-auto max-w-6xl rounded-[2.5rem] border border-slate-200 bg-white p-7 shadow-soft sm:p-12"
          >
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                <Sparkles className="size-3.5" aria-hidden="true" />
                Panduan Kapten &amp; Organizer
              </span>
              <h2 className="mt-2 font-display text-2xl font-black text-slate-900 sm:text-4xl">
                Cara Buat Tim / Komunitas di KickPro
              </h2>
              <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-500">
                Bangun rumah digital untuk komunitas sepak bola, mini soccer, atau futsalmu dalam 3
                langkah praktis.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {/* LANGKAH 1 */}
              <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-slate-50/70 p-6">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-emerald-950 font-display text-lg font-black text-lime shadow-glow">
                      01
                    </span>
                    <Users className="size-5 text-emerald-700" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-extrabold text-slate-900">
                    Daftarkan Profil Tim / Komunitas
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                    Buat akun sebagai <strong>Tim / Komunitas</strong>, isi nama klub, lokasi kota
                    basecamp, jenis olahraga (Sepak Bola, Mini Soccer, atau Futsal), dan visi
                    komunitasmu.
                  </p>
                </div>
                <div className="mt-4 rounded-xl bg-white px-3 py-2 text-[11px] font-bold text-emerald-800 shadow-xs">
                  ✓ Otomatis tampil di direktori Komunitas
                </div>
              </div>

              {/* LANGKAH 2 */}
              <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-slate-50/70 p-6">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-emerald-950 font-display text-lg font-black text-lime shadow-glow">
                      02
                    </span>
                    <CalendarDays className="size-5 text-emerald-700" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-extrabold text-slate-900">
                    Buka Jadwal &amp; Manifest Slot
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                    Atur jadwal main bareng (venue lapangan, tanggal, jam, jumlah tim, kuota slot,
                    dan biaya patungan per orang). Sistem menyiapkan halaman manifest slot otomatis.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-[11px] font-bold text-emerald-800 shadow-xs">
                  <Link2 className="size-3.5 shrink-0" aria-hidden="true" />
                  <span>Dapat link khusus /undangan/komunitasmu</span>
                </div>
              </div>

              {/* LANGKAH 3 */}
              <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-slate-50/70 p-6">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-emerald-950 font-display text-lg font-black text-lime shadow-glow">
                      03
                    </span>
                    <QrCode className="size-5 text-emerald-700" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-extrabold text-slate-900">
                    Bagikan Link &amp; Terima Kas QRIS
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                    Bagikan link undangan ke grup WhatsApp. Anggota memilih nomor slot sendiri,
                    bayar otomatis via QRIS, dan dana kas komunitas tercatat transparan di
                    dashboard.
                  </p>
                </div>
                <div className="mt-4 rounded-xl bg-white px-3 py-2 text-[11px] font-bold text-emerald-800 shadow-xs">
                  ✓ Bebas rekap manual &amp; anti nombok lapangan
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-3xl bg-emerald-950 p-6 text-white sm:flex-row sm:px-8">
              <div>
                <h3 className="font-display text-lg font-extrabold text-white sm:text-xl">
                  Siap membangun ekosistem sepak bola dari komunitasmu?
                </h3>
                <p className="mt-1 text-xs text-emerald-100/80 sm:text-sm">
                  Buka halaman resmi tim/komunitas kamu sekarang secara gratis.
                </p>
              </div>
              <Link
                href="/auth?mode=register&role=admin"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-lime px-7 py-4 text-xs font-black uppercase tracking-wider text-emerald-950 shadow-glow transition hover:bg-[#d6fa42] sm:text-sm"
              >
                <ShieldCheck className="size-4" aria-hidden="true" />
                <span>Buat Tim / Komunitas Sekarang</span>
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
