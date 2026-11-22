"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Users,
  X,
} from "lucide-react";
import {
  clubDocToCommunityProfile,
  initialClubProfiles,
  type CommunityProfile,
} from "@/data/communities";
import { fetchClubsClient } from "@/lib/firebase/client";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { useToast } from "@/components/ui/toast";

const LOCATION_OPTIONS = [
  "Semua Lokasi",
  "Jakarta Selatan",
  "Jakarta Pusat",
  "Jakarta Barat",
  "Tangerang Selatan",
  "Depok",
] as const;

export default function KomunitasPage() {
  const { toast } = useToast();
  const [clubs, setClubs] = React.useState<CommunityProfile[]>(initialClubProfiles);
  const [liveSource, setLiveSource] = React.useState<"firestore" | "seed">("seed");
  const [syncing, setSyncing] = React.useState(false);
  const [selectedLocation, setSelectedLocation] = React.useState<string>("Semua Lokasi");
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    let active = true;
    fetchClubsClient(20)
      .then((firestoreClubs) => {
        if (!active) return;
        if (firestoreClubs.length > 0) {
          setClubs(firestoreClubs.map(clubDocToCommunityProfile));
          setLiveSource("firestore");
        }
      })
      .catch(() => {
        // Fallback to seed data if emulator is unreachable
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleRefreshClubs() {
    setSyncing(true);
    try {
      const firestoreClubs = await fetchClubsClient(20);
      if (firestoreClubs.length > 0) {
        setClubs(firestoreClubs.map(clubDocToCommunityProfile));
        setLiveSource("firestore");
        toast({
          title: "Data komunitas disinkronkan dari Firestore",
          description: `${firestoreClubs.length} komunitas aktif berhasil dimuat.`,
          variant: "success",
        });
      }
    } catch {
      toast({
        title: "Menampilkan data seed komunitas",
        variant: "default",
      });
    } finally {
      setSyncing(false);
    }
  }

  const filteredClubs = React.useMemo(() => {
    return clubs.filter((club) => {
      const matchLocation =
        selectedLocation === "Semua Lokasi" || club.city === selectedLocation;

      if (!matchLocation) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          club.name.toLowerCase().includes(q) ||
          club.city.toLowerCase().includes(q) ||
          club.basecampVenue.toLowerCase().includes(q) ||
          club.description.toLowerCase().includes(q) ||
          club.sportLabels.some((s) => s.toLowerCase().includes(q))
        );
      }

      return true;
    });
  }, [clubs, selectedLocation, searchQuery]);

  return (
    <div className="flex min-h-screen flex-col text-slate-900 antialiased selection:bg-lime selection:text-emerald-950">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-20 pt-5 sm:px-6 sm:pt-7 lg:px-8">
        <div id="komunitasPage" className="app-panel space-y-6">
          {/* HEADER & FILTER LOKASI */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">
                <span className="size-2 animate-pulse rounded-full bg-emerald-600" />
                {liveSource === "firestore"
                  ? "Direktori Komunitas • Firestore Live"
                  : "Direktori Komunitas KickPro"}
              </span>
              <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                List Komunitas Sepak Bola, Mini Soccer &amp; Futsal
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">
                Temukan komunitas bola aktif berdasarkan lokasi kotamu. Lihat visi komunitas,
                basecamp lapangan, skor fair play, dan jadwal main rutin mereka.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleRefreshClubs}
                disabled={syncing}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 disabled:opacity-60"
              >
                <RefreshCw
                  className={`size-3.5 ${syncing ? "animate-spin" : ""}`}
                  aria-hidden="true"
                />
                <span>{syncing ? "Menyinkronkan..." : "Perbarui"}</span>
              </button>

              <Link
                href="/auth?mode=register&role=admin"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-950 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-emerald-900"
              >
                <ShieldCheck className="size-4 text-lime" aria-hidden="true" />
                <span>Buat Komunitas</span>
              </Link>
            </div>
          </div>

          {/* FILTER LOKASI BAR */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="grid gap-3 md:grid-cols-12 md:items-center">
              <div className="relative md:col-span-6">
                <Search
                  className="absolute left-3.5 top-3.5 size-4 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari komunitas (mis. Garuda Muda FC, Senayan United, Pancoran)..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-9 text-xs font-medium outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    aria-label="Hapus pencarian"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              <div className="md:col-span-6">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 transition focus-within:border-emerald-500 focus-within:bg-white">
                  <MapPin className="size-4 shrink-0 text-emerald-700" aria-hidden="true" />
                  <span className="text-xs font-bold text-slate-500">Filter Lokasi:</span>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    aria-label="Filter komunitas berdasarkan lokasi"
                    className="w-full cursor-pointer bg-transparent text-xs font-extrabold text-slate-800 outline-none"
                  >
                    {LOCATION_OPTIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* QUICK LOCATION PILLS */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {LOCATION_OPTIONS.map((loc) => {
                  const active = selectedLocation === loc;
                  return (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setSelectedLocation(loc)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                        active
                          ? "bg-emerald-950 text-lime shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {loc}
                    </button>
                  );
                })}
              </div>

              <span className="text-xs text-slate-500">
                Menampilkan{" "}
                <strong className="text-emerald-800">{filteredClubs.length} komunitas</strong>
              </span>
            </div>
          </div>

          {/* LIST KOMUNITAS DARI SEED DATA (clubs/club-garuda-muda & clubs/club-senayan-united) */}
          {filteredClubs.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredClubs.map((club) => {
                const initials = club.name
                  .split(" ")
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase();

                return (
                  <article
                    key={club.id}
                    className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl sm:p-7"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                          <span className="flex size-13 shrink-0 items-center justify-center rounded-2xl bg-emerald-950 font-display text-lg font-black text-lime shadow-sm">
                            {initials}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h2 className="font-display text-xl font-extrabold text-slate-900 group-hover:text-emerald-800">
                                {club.name}
                              </h2>
                              <BadgeCheck
                                className="size-4 shrink-0 text-emerald-600"
                                aria-hidden="true"
                              />
                            </div>
                            <p className="mt-0.5 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                              <MapPin className="size-3.5" aria-hidden="true" />
                              <span>{club.city}</span>
                              <span className="text-slate-300">•</span>
                              <span className="rounded bg-lime/40 px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-emerald-950">
                                {club.levelLabel}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap justify-end gap-1">
                          {club.sportLabels.map((sport) => (
                            <span
                              key={sport}
                              className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold uppercase text-slate-700"
                            >
                              {sport}
                            </span>
                          ))}
                        </div>
                      </div>

                      <p className="mt-4 text-xs leading-relaxed text-slate-600 sm:text-sm">
                        {club.description}
                      </p>

                      {club.vision && (
                        <div className="bg-emerald-50/70 mt-3 rounded-2xl border border-emerald-100 p-3 text-xs text-emerald-950">
                          <span className="font-extrabold">Visi Komunitas: </span>
                          <span className="italic">&ldquo;{club.vision}&rdquo;</span>
                        </div>
                      )}

                      {/* STATS BAR DARI SEED */}
                      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-xl bg-slate-50 p-2.5">
                          <p className="flex items-center justify-center gap-1 font-display text-sm font-black text-emerald-900">
                            <Star className="size-3.5 fill-amber-400 text-amber-400" />
                            {club.fairPlayScore.toFixed(1)}
                          </p>
                          <p className="text-[10px] font-semibold text-slate-500">
                            Fair Play ({club.fairPlayCount} ulasan)
                          </p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-2.5">
                          <p className="flex items-center justify-center gap-1 font-display text-sm font-black text-slate-900">
                            <Trophy className="size-3.5 text-emerald-700" />
                            {club.totalMatchesPlayed}x
                          </p>
                          <p className="text-[10px] font-semibold text-slate-500">
                            Total Pertandingan
                          </p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-2.5">
                          <p className="flex items-center justify-center gap-1 font-display text-sm font-black text-slate-900">
                            <Users className="size-3.5 text-emerald-700" />
                            {club.avgAge ?? 27} Thn
                          </p>
                          <p className="text-[10px] font-semibold text-slate-500">Rata-rata Usia</p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 rounded-2xl bg-slate-50 p-3.5 text-xs text-slate-700">
                        <div className="flex items-start justify-between gap-2">
                          <span className="shrink-0 text-slate-500">Basecamp Venue:</span>
                          <span className="text-right font-bold text-slate-900">
                            {club.basecampVenue}
                          </span>
                        </div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="shrink-0 text-slate-500">Jadwal Rutin:</span>
                          <span className="inline-flex items-center gap-1 text-right font-bold text-emerald-800">
                            <CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />
                            {club.scheduleSummary}
                          </span>
                        </div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="shrink-0 text-slate-500">Pengurus / PIC:</span>
                          <span className="text-right font-bold text-slate-900">
                            {club.hostName}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <span className="bg-emerald-50/70 inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-semibold text-emerald-900">
                          <Check className="size-3 text-emerald-600" aria-hidden="true" />
                          {club.activeEventsCount} Jadwal Mabar Terbuka Minggu Ini
                        </span>
                        <span className="bg-emerald-50/70 inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-semibold text-emerald-900">
                          <Check className="size-3 text-emerald-600" aria-hidden="true" />
                          Manifest &amp; Kas QRIS Aktif
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-2.5 border-t border-slate-100 pt-4 sm:flex-row">
                      <Link
                        href={`/undangan/${club.primaryEventSlug}`}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-950 px-4 py-3 text-xs font-extrabold text-white transition hover:bg-emerald-900"
                      >
                        <span>Lihat Manifest &amp; Mabar</span>
                        <ArrowRight className="size-3.5" aria-hidden="true" />
                      </Link>
                      <Link
                        href={`/club/${club.id}`}
                        className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-extrabold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
                      >
                        <span>Dashboard Klub</span>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="bg-slate-50/80 rounded-3xl border border-dashed border-slate-300 p-10 text-center">
              <h3 className="font-display text-lg font-extrabold text-slate-800">
                Belum ada komunitas di lokasi {selectedLocation}
              </h3>
              <p className="mx-auto mt-1 max-w-md text-xs text-slate-500">
                Saat ini komunitas pada seed data berlokasi di Jakarta Selatan (Garuda Muda FC) dan
                Jakarta Pusat (Senayan United).
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedLocation("Semua Lokasi");
                  setSearchQuery("");
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-950 px-4 py-2 text-xs font-bold text-white"
              >
                Tampilkan Semua Lokasi
              </button>
            </div>
          )}

          {/* BANNER AJAKAN BIKIN KOMUNITAS */}
          <section className="from-emerald-950 relative overflow-hidden rounded-3xl bg-gradient-to-br to-slate-900 p-6 text-white shadow-soft sm:p-8">
            <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div className="max-w-2xl">
                <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-lime px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-950">
                  <Sparkles className="size-3" aria-hidden="true" />
                  Ekosistem Komunitas Sepak Bola
                </span>
                <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                  Komunitasmu belum terdaftar di direktori KickPro?
                </h2>
                <p className="mt-2 text-sm leading-6 text-emerald-100/80">
                  Buat halaman resmi komunitasmu sekarang, kelola manifest slot pemain otomatis, dan
                  jangkau pemain baru di lokasimu.
                </p>
              </div>
              <Link
                href="/auth?mode=register&role=admin"
                className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-lime px-6 py-3.5 text-xs font-extrabold uppercase tracking-wider text-emerald-950 shadow-glow transition hover:bg-[#d6fa42]"
              >
                <span>Buat Tim / Komunitas</span>
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
