"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Link2,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { formatRupiah, type EventDoc } from "@kickpro/shared";
import {
  eventDocToCommunityEvent,
  formatDateIndo,
  initialCommunities,
  loadCustomCommunityEvents,
  type CommunityEvent,
} from "@/data/communities";
import { fetchOpenEventsClient } from "@/lib/firebase/client";
import { useToast } from "@/components/ui/toast";

function mergeCommunities(
  firestoreEvents: EventDoc[],
  customEvents: CommunityEvent[] = [],
): CommunityEvent[] {
  const base =
    firestoreEvents.length > 0
      ? firestoreEvents.map((ev) => eventDocToCommunityEvent(ev))
      : initialCommunities;
  const seen = new Set(customEvents.map((c) => c.slug));
  return [...customEvents, ...base.filter((b) => !seen.has(b.slug))];
}

export function LiveEventsShowcase({
  initialEvents,
  serverSource,
}: {
  initialEvents?: EventDoc[];
  serverSource?: "firestore" | "unavailable";
}) {
  const { toast } = useToast();
  const [communities, setCommunities] = React.useState<CommunityEvent[]>(() =>
    mergeCommunities(initialEvents ?? []),
  );
  const [liveSource, setLiveSource] = React.useState<"firestore" | "unavailable">(
    serverSource ?? "unavailable",
  );
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedLocation, setSelectedLocation] = React.useState("Semua Lokasi");
  const [selectedScheduleDate, setSelectedScheduleDate] = React.useState("Semua Jadwal");
  const [selectedTimePeriod, setSelectedTimePeriod] = React.useState("Semua Waktu");
  const [onlyOpen, setOnlyOpen] = React.useState(true);
  const [syncing, setSyncing] = React.useState(false);

  React.useEffect(() => {
    const customEvents = loadCustomCommunityEvents();
    if (customEvents.length > 0) {
      setCommunities((prev) => {
        const seen = new Set(customEvents.map((c) => c.slug));
        return [...customEvents, ...prev.filter((p) => !seen.has(p.slug))];
      });
    }

    let active = true;
    fetchOpenEventsClient(10)
      .then((freshEvents) => {
        if (!active) return;
        const latestCustom = loadCustomCommunityEvents();
        if (freshEvents.length > 0) {
          setCommunities(mergeCommunities(freshEvents, latestCustom));
          setLiveSource("firestore");
        }
      })
      .catch(() => {
        // Fallback to initialCommunities silently when emulator/firestore is offline
      });
    return () => {
      active = false;
    };
  }, []);

  const scheduleDates = React.useMemo(() => {
    const uniqueDates = Array.from(new Set(communities.map((c) => c.date))).sort();
    return uniqueDates;
  }, [communities]);

  const filteredCommunities = React.useMemo(() => {
    return communities.filter((item) => {
      if (onlyOpen && item.status === "closed") {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = item.communityName.toLowerCase().includes(query);
        const matchesVenue = item.venue.toLowerCase().includes(query);
        const matchesCity = item.city.toLowerCase().includes(query);
        const matchesTagline = item.tagline.toLowerCase().includes(query);
        const matchesSport = item.sport.toLowerCase().includes(query);
        if (!matchesName && !matchesVenue && !matchesCity && !matchesTagline && !matchesSport) {
          return false;
        }
      }

      if (selectedLocation !== "Semua Lokasi" && item.city !== selectedLocation) {
        return false;
      }

      if (selectedScheduleDate !== "Semua Jadwal" && item.date !== selectedScheduleDate) {
        return false;
      }

      if (selectedTimePeriod !== "Semua Waktu" && item.timePeriod !== selectedTimePeriod) {
        return false;
      }

      return true;
    });
  }, [
    communities,
    searchQuery,
    selectedLocation,
    selectedScheduleDate,
    selectedTimePeriod,
    onlyOpen,
  ]);

  async function handleRefreshFromClient() {
    setSyncing(true);
    try {
      const freshEvents = await fetchOpenEventsClient(10);
      setCommunities(mergeCommunities(freshEvents));
      toast({
        title: "Jadwal mabar diperbarui",
        description:
          freshEvents.length > 0
            ? `${freshEvents.length} jadwal mabar aktif berhasil disinkronkan.`
            : "Menampilkan daftar jadwal mabar pilihan.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Jadwal sudah paling baru",
        description: "Menampilkan daftar jadwal mabar aktif yang tersedia.",
        variant: "default",
      });
    } finally {
      setSyncing(false);
    }
  }

  function copyCommunityLink(slug: string, name: string) {
    const url = `${window.location.origin}/event/${slug}`;
    try {
      void navigator.clipboard.writeText(url);
    } catch {
      // Clipboard API fallback omitted
    }
    toast({
      title: `Link jadwal ${name} disalin`,
      description: `kickpro.id/event/${slug}`,
      variant: "success",
    });
  }

  function resetFilters() {
    setSearchQuery("");
    setSelectedLocation("Semua Lokasi");
    setSelectedScheduleDate("Semua Jadwal");
    setSelectedTimePeriod("Semua Waktu");
    setOnlyOpen(true);
    toast({
      title: "Filter lokasi & jadwal direset",
      variant: "default",
    });
  }

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedLocation !== "Semua Lokasi" ||
    selectedScheduleDate !== "Semua Jadwal" ||
    selectedTimePeriod !== "Semua Waktu" ||
    !onlyOpen;

  return (
    <div id="mabarPage" className="app-panel space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">
              <span className="size-2 animate-pulse rounded-full bg-emerald-600" />
              {liveSource === "firestore"
                ? "Main Bareng • Jadwal Live"
                : "Main Bareng • Cari Jadwal Mabar"}
            </span>
          </div>
          <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Cari Mabar Berdasarkan Lokasi &amp; Jadwal
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Temukan jadwal main bareng sepak bola, mini soccer, dan futsal terdekat. Filter
            berdasarkan lokasi dan jadwal waktu main, lalu amankan slotmu di manifest pemain.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-emerald-300">
            <input
              type="checkbox"
              checked={onlyOpen}
              onChange={(e) => setOnlyOpen(e.target.checked)}
              className="size-4 rounded text-emerald-600 accent-emerald-600 focus:ring-emerald-500"
            />
            <span>Hanya yang tersedia slot</span>
          </label>

          <button
            type="button"
            onClick={handleRefreshFromClient}
            disabled={syncing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 disabled:opacity-60"
          >
            <RefreshCw className={`size-3.5 ${syncing ? "animate-spin" : ""}`} aria-hidden="true" />
            <span>{syncing ? "Menyinkronkan..." : "Perbarui"}</span>
          </button>
        </div>
      </div>

      {/* FILTER BAR: LOKASI & JADWAL */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 md:grid-cols-12 md:items-center">
          <div className="relative md:col-span-4">
            <Search className="absolute left-3.5 top-3.5 size-4 text-slate-400" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari lapangan, sesi mabar, atau kota..."
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

          {/* FILTER LOKASI */}
          <div className="md:col-span-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 transition focus-within:border-emerald-500 focus-within:bg-white">
              <MapPin className="size-4 shrink-0 text-emerald-700" aria-hidden="true" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                aria-label="Filter lokasi mabar"
                className="w-full cursor-pointer bg-transparent text-xs font-bold text-slate-700 outline-none"
              >
                <option value="Semua Lokasi">Semua Lokasi</option>
                <option value="Jakarta Selatan">Jakarta Selatan</option>
                <option value="Jakarta Pusat">Jakarta Pusat</option>
                <option value="Jakarta Barat">Jakarta Barat</option>
                <option value="Tangerang Selatan">Tangerang Selatan</option>
                <option value="Depok">Depok</option>
              </select>
            </div>
          </div>

          {/* FILTER JADWAL (HARI / TANGGAL) */}
          <div className="md:col-span-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 transition focus-within:border-emerald-500 focus-within:bg-white">
              <CalendarDays className="size-4 shrink-0 text-emerald-700" aria-hidden="true" />
              <select
                value={selectedScheduleDate}
                onChange={(e) => setSelectedScheduleDate(e.target.value)}
                aria-label="Filter jadwal hari dan tanggal"
                className="w-full cursor-pointer bg-transparent text-xs font-bold text-slate-700 outline-none"
              >
                <option value="Semua Jadwal">Semua Hari / Tanggal</option>
                {scheduleDates.map((dateStr) => (
                  <option key={dateStr} value={dateStr}>
                    {formatDateIndo(dateStr)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* FILTER JADWAL WAKTU */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 transition focus-within:border-emerald-500 focus-within:bg-white">
              <Clock3 className="size-4 shrink-0 text-emerald-700" aria-hidden="true" />
              <select
                value={selectedTimePeriod}
                onChange={(e) => setSelectedTimePeriod(e.target.value)}
                aria-label="Filter waktu jadwal"
                className="w-full cursor-pointer bg-transparent text-xs font-bold text-slate-700 outline-none"
              >
                <option value="Semua Waktu">Semua Jam</option>
                <option value="Pagi">Pagi (06-11 WIB)</option>
                <option value="Siang">Siang (11-15 WIB)</option>
                <option value="Sore">Sore (15-18 WIB)</option>
                <option value="Malam">Malam (18-23 WIB)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
          <div>
            Menampilkan{" "}
            <span className="font-extrabold text-emerald-800">
              {filteredCommunities.length} jadwal mabar
            </span>{" "}
            sesuai filter lokasi &amp; jadwal
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="font-bold text-emerald-700 hover:underline"
            >
              Reset filter lokasi &amp; jadwal
            </button>
          )}
        </div>
      </div>

      {/* ISI LIST MABAR */}
      {filteredCommunities.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredCommunities.map((item) => {
            const availableSlots = item.slots.filter((s) => s.status === "available").length;
            const filledSlots = item.totalSlots - availableSlots;
            const isHighlighted =
              item.slug === "eryan-soccer" || item.slug === "event-jumat-malam";

            return (
              <article
                key={item.id}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border bg-white p-5 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
                  isHighlighted ? "ring-emerald-500/20 border-emerald-300 ring-2" : "border-slate-200"
                }`}
              >
                <div>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-800">
                      <span className="size-1.5 animate-pulse rounded-full bg-emerald-600" />
                      Sisa {availableSlots} Slot ({filledSlots}/{item.totalSlots})
                    </span>

                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold uppercase text-slate-600">
                      {item.sport} • {item.type}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h2 className="font-display text-lg font-extrabold text-slate-900 transition group-hover:text-emerald-800">
                          {item.communityName}
                        </h2>
                        {item.badge && (
                          <span className="bg-lime/40 rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-emerald-950">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{item.tagline}</p>
                    </div>
                  </div>

                  {/* DETAIL LOKASI & JADWAL */}
                  <div className="mt-4 space-y-2 rounded-2xl bg-slate-50 p-3.5 text-xs text-slate-700">
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 shrink-0 text-emerald-700" aria-hidden="true" />
                      <span className="truncate font-semibold">
                        {item.venue} <span className="text-slate-500">• {item.city}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <CalendarDays className="size-4 shrink-0 text-emerald-700" aria-hidden="true" />
                      <span className="font-semibold">{formatDateIndo(item.date)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock3 className="size-4 shrink-0 text-emerald-700" aria-hidden="true" />
                      <span>
                        <span className="font-bold text-slate-800">{item.time}</span>{" "}
                        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                          {item.timePeriod}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="size-4 shrink-0 text-emerald-700" aria-hidden="true" />
                      <span>
                        Manifest: <strong>{filledSlots} terisi</strong> dari {item.totalSlots} slot
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {item.facilities.slice(0, 3).map((facility) => (
                      <span
                        key={facility}
                        className="bg-emerald-50/60 inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-medium text-emerald-900"
                      >
                        <Check className="size-2.5 text-emerald-600" aria-hidden="true" />
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4">
                  <div className="mb-3 flex items-baseline justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-400">Tiket / Slot</p>
                      <p className="font-display text-lg font-black text-emerald-900">
                        {formatRupiah(item.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Host / PIC</p>
                      <p className="text-xs font-bold text-slate-700">{item.hostName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/event/${item.slug}`}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-950 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-900"
                    >
                      <span>Pilih Slot Mabar</span>
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => copyCommunityLink(item.slug, item.communityName)}
                      className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                      title={`Salin link jadwal /event/${item.slug}`}
                      aria-label={`Salin link jadwal ${item.communityName}`}
                    >
                      <Link2 className="size-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-50/80 rounded-3xl border border-dashed border-slate-300 p-10 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
            <Search className="size-6 text-slate-400" aria-hidden="true" />
          </div>
          <h3 className="mt-4 font-display text-lg font-extrabold text-slate-800">
            Jadwal mabar tidak ditemukan
          </h3>
          <p className="mx-auto mt-1 max-w-md text-xs text-slate-500">
            Belum ada jadwal mabar yang cocok dengan filter lokasi &amp; jadwal tersebut. Coba ubah
            filter lokasi atau pilih semua jadwal.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-950 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-900"
          >
            Reset Filter
          </button>
        </div>
      )}

      {/* CTA BUAT PROFILE ATAU KOMUNITAS */}
      <div className="border-lime/40 from-emerald-950 rounded-3xl border bg-gradient-to-r to-emerald-900 p-5 text-white shadow-soft sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-lime text-emerald-950 shadow-glow">
              <Sparkles className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-lime">
                Ingin Buka Jadwal Mabar Sendiri?
              </p>
              <h2 className="mt-0.5 text-base font-extrabold sm:text-lg">
                Buat halaman komunitas &amp; bagikan link manifest otomatis ke grup WA
              </h2>
              <p className="mt-1 max-w-xl text-xs leading-relaxed text-emerald-100/75">
                Daftarkan tim atau komunitasmu di KickPro supaya jadwal mabar rutinmu muncul di
                halaman Main Bareng dan mudah ditemukan pemain sekitar.
              </p>
            </div>
          </div>
          <Link
            href="/auth?mode=register&role=admin"
            className="hover:bg-lime/90 flex shrink-0 items-center justify-center gap-2 rounded-xl bg-lime px-4 py-3 text-xs font-extrabold text-emerald-950 shadow-sm transition"
          >
            <span>Bikin Tim / Komunitas</span>
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
