import Link from "next/link";
import {
  ArrowRight,
  Check,
  Globe,
  LayoutGrid,
  Link2,
  MapPin,
  QrCode,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function TentangKamiPage() {
  return (
    <div className="flex min-h-screen flex-col text-slate-900 antialiased selection:bg-lime selection:text-emerald-950">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-20 pt-5 sm:px-6 sm:pt-7 lg:px-8">
        <div id="tentangKamiPage" className="app-panel space-y-10">
          {/* 1. PENJELASAN TENTANG KICKPRO & VISI UTAMA */}
          <section className="relative overflow-hidden rounded-[2.5rem] bg-emerald-950 p-7 text-white shadow-soft sm:p-12">
            <div className="border-lime/10 pointer-events-none absolute -right-16 -top-20 size-80 rounded-full border-[36px]" />
            <div className="relative grid gap-8 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7">
                <span className="border-lime/20 bg-lime/10 mb-4 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-lime">
                  <Sparkles className="size-3.5" aria-hidden="true" />
                  Tentang KickPro &amp; Visi Kami
                </span>

                <h1 className="font-display text-3xl font-black leading-tight tracking-tight sm:text-5xl">
                  Membangun Ekosistem Sepak Bola Indonesia{" "}
                  <span className="text-lime">dari Komunitas.</span>
                </h1>

                <p className="text-emerald-100/85 mt-5 text-sm leading-relaxed sm:text-base">
                  <strong>Apa itu KickPro?</strong> KickPro adalah platform digital yang dirancang
                  khusus untuk memberdayakan komunitas sepak bola, mini soccer, dan futsal akar
                  rumput di Indonesia. Kami mengubah cara komunitas mengelola jadwal main bareng
                  (mabar), mencatat manifest pemain, hingga mengelola iuran kas lapangan secara
                  transparan dan otomatis.
                </p>

                <p className="text-emerald-100/75 mt-3 text-sm leading-relaxed">
                  Kami percaya kemajuan sepak bola Indonesia tumbuh dari ribuan komunitas lokal yang
                  aktif bermain setiap minggu. Dengan teknologi yang mempermudah kapten dan
                  menghubungkan pemain, komunitas dapat tumbuh lebih sehat, rapi, dan berkelanjutan.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href="/auth?mode=register&role=admin"
                    className="flex items-center gap-2 rounded-xl bg-lime px-6 py-3.5 text-xs font-extrabold uppercase tracking-wider text-emerald-950 shadow-glow transition hover:bg-[#d6fa42] sm:text-sm"
                  >
                    <span>Buat Page Komunitasmu</span>
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                  <Link
                    href="/komunitas"
                    className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-xs font-bold text-white transition hover:bg-white/20 sm:text-sm"
                  >
                    <span>Jelajahi Komunitas</span>
                  </Link>
                </div>
              </div>

              {/* VISI PILLARS CARD */}
              <div className="lg:col-span-5">
                <div className="space-y-3.5 rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-md">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-lime">
                    Mengapa Dimulai dari Komunitas?
                  </p>
                  <div className="space-y-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5">
                      <h2 className="text-sm font-extrabold text-white">
                        1. Fondasi Akar Rumput yang Kuat
                      </h2>
                      <p className="mt-1 text-xs leading-relaxed text-emerald-100/75">
                        Ribuan pertandingan mini soccer, futsal, dan sepak bola digelar oleh
                        komunitas setiap pekannya di berbagai kota Indonesia.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5">
                      <h2 className="text-sm font-extrabold text-white">
                        2. Digitalisasi Manajemen Tim &amp; Mabar
                      </h2>
                      <p className="mt-1 text-xs leading-relaxed text-emerald-100/75">
                        Menggantikan rekap chat manual yang rawan batal mendadak dan tombokan
                        lapangan dengan sistem manifest slot &amp; QRIS terintegrasi.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5">
                      <h2 className="text-sm font-extrabold text-white">
                        3. Link Jadwal Mandiri untuk Anggota
                      </h2>
                      <p className="mt-1 text-xs leading-relaxed text-emerald-100/75">
                        Kapten cukup membagikan link pendek jadwal (/event/nama-komunitas) agar
                        pemain langsung memilih slot tanpa ribet.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. FITUR PAGE UNTUK KOMUNITAS */}
          <section id="fiturPageKomunitas" className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                  <Globe className="size-3.5 text-emerald-700" aria-hidden="true" />
                  Fitur Unggulan Komunitas
                </span>
                <h2 className="mt-2 font-display text-2xl font-black text-slate-900 sm:text-4xl">
                  Fitur Page Khusus untuk Komunitas Kamu
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-slate-500">
                  Setiap tim dan komunitas di KickPro mendapatkan halaman resmi (*Community Page*)
                  dengan fitur lengkap untuk mengelola jadwal mabar, slot pemain, dan keuangan klub.
                </p>
              </div>

              <Link
                href="/undangan/event-jumat-malam"
                className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-extrabold text-emerald-900 transition hover:bg-emerald-100"
              >
                <span>Lihat Contoh Page Komunitas</span>
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {/* FITUR 1 */}
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
                <div className="bg-lime/40 mb-4 flex size-11 items-center justify-center rounded-2xl text-emerald-950">
                  <Link2 className="size-5" aria-hidden="true" />
                </div>
                <h3 className="font-display text-lg font-extrabold text-slate-900">
                  Link &amp; Halaman Profil Komunitas Resmi
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                  Dapatkan alamat halaman khusus seperti{" "}
                  <span className="font-mono font-bold text-emerald-800">
                    kickpro.id/undangan/nama-komunitas
                  </span>{" "}
                  yang menampilkan identitas klub, lokasi basecamp, aturan main, dan fasilitas.
                </p>
              </article>

              {/* FITUR 2 */}
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
                <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                  <LayoutGrid className="size-5" aria-hidden="true" />
                </div>
                <h3 className="font-display text-lg font-extrabold text-slate-900">
                  Manifest Slot Pemain Interaktif
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                  Pemain dapat melihat sisa kuota secara live dan memilih nomor slot sendiri. Status
                  slot (Tersedia, Diproses, Lunas) langsung terupdate otomatis tanpa edit list chat.
                </p>
              </article>

              {/* FITUR 3 */}
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
                <div className="bg-lime/40 mb-4 flex size-11 items-center justify-center rounded-2xl text-emerald-950">
                  <QrCode className="size-5" aria-hidden="true" />
                </div>
                <h3 className="font-display text-lg font-extrabold text-slate-900">
                  Kunci Slot &amp; Pembayaran QRIS Otomatis
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                  Sistem mengunci slot selama 10 menit saat checkout dan memverifikasi pembayaran
                  QRIS secara instan. Kapten tidak perlu lagi mengecek bukti transfer satu per satu.
                </p>
              </article>

              {/* FITUR 4 */}
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
                <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                  <MapPin className="size-5" aria-hidden="true" />
                </div>
                <h3 className="font-display text-lg font-extrabold text-slate-900">
                  Terdaftar di Direktori Lokasi &amp; Jadwal
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                  Page komunitas dan jadwal mabarmu otomatis tampil di halaman{" "}
                  <strong>Main Bareng</strong> dan <strong>Komunitas</strong> sehingga mudah dicari
                  berdasarkan lokasi kota dan jadwal.
                </p>
              </article>

              {/* FITUR 5 */}
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
                <div className="bg-lime/40 mb-4 flex size-11 items-center justify-center rounded-2xl text-emerald-950">
                  <Wallet className="size-5" aria-hidden="true" />
                </div>
                <h3 className="font-display text-lg font-extrabold text-slate-900">
                  Dashboard Kas &amp; Rekap Uang Lapangan
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                  Pantau dana patungan yang terkumpul dari setiap sesi mabar secara real-time di
                  dashboard klub, lengkap dengan catatan transaksi yang transparan bagi pengurus.
                </p>
              </article>

              {/* FITUR 6 */}
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
                <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                  <Users className="size-5" aria-hidden="true" />
                </div>
                <h3 className="font-display text-lg font-extrabold text-slate-900">
                  Manajemen Anggota &amp; Share WhatsApp 1-Klik
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                  Bagikan undangan mabar berformat rapi langsung ke grup WhatsApp komunitas hanya
                  dengan satu tombol, lengkap dengan rincian venue, jam, biaya, dan sisa slot.
                </p>
              </article>
            </div>
          </section>

          {/* 3. PREVIEW RINGKAS ALUR PAGE KOMUNITAS */}
          <section className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                <ShieldCheck className="size-3.5" aria-hidden="true" />
                Dirancang untuk Kapten &amp; Anggota
              </span>
              <h3 className="mt-3 font-display text-2xl font-extrabold text-slate-900">
                Kenapa Komunitas Beralih Menggunakan Page KickPro?
              </h3>
              <ul className="mt-4 space-y-3 text-xs font-medium text-slate-600 sm:text-sm">
                <li className="flex items-start gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden="true" />
                  <span>
                    <strong>Bebas Nombok Sewa Lapangan:</strong> Setiap slot diikat komitmen
                    pembayaran QRIS di depan sebelum nama masuk ke manifest resmi.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden="true" />
                  <span>
                    <strong>Terlihat Profesional &amp; Terpercaya:</strong> Pemain baru lebih yakin
                    bergabung karena informasi venue, aturan, fasilitas, dan PIC terpampang jelas.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden="true" />
                  <span>
                    <strong>Tumbuh Bersama Ekosistem Nasional:</strong> Komunitasmu menjadi bagian
                    dari jaringan ekosistem sepak bola komunitas di seluruh Indonesia.
                  </span>
                </li>
              </ul>
            </div>

            <div className="rounded-3xl bg-emerald-950 p-6 text-white">
              <p className="text-xs font-extrabold uppercase tracking-wider text-lime">
                Siap Memulai?
              </p>
              <h4 className="mt-2 font-display text-xl font-extrabold sm:text-2xl">
                Daftarkan Komunitasmu atau Sign In ke Dashboard Sekarang
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-emerald-100/80 sm:text-sm">
                Gratis membuat akun komunitas dan mulai membangun ekosistem sepak bola yang lebih
                rapi dari komunitasmu sendiri.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/auth?mode=register"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-lime px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-emerald-950 shadow-glow transition hover:bg-[#d6fa42]"
                >
                  <span>Buat Tim / Komunitas</span>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/auth?mode=login"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-xs font-bold text-white transition hover:bg-white/20"
                >
                  <span>Sign In Komunitas</span>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
