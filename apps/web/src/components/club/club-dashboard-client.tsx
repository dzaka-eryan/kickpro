"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CalendarPlus,
  Check,
  Clock3,
  Copy,
  Link2,
  MapPin,
  Plus,
  QrCode,
  Quote,
  Share2,
  Trophy,
  Users,
} from "lucide-react";
import { formatRupiah } from "@kickpro/shared";
import {
  formatDateIndo,
  initialClubProfiles,
  initialCommunities,
  saveCustomCommunityEvent,
  type CommunityEvent,
  type CommunitySlot,
} from "@/data/communities";
import { ClubLayout } from "@/components/layout/club-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

interface LocalClubEvent {
  id: string;
  slug: string;
  title: string;
  venueName: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  sport: string;
  totalSlots: number;
  filledSlots: number;
  pricePerSlot: number;
}

interface StoredClubData {
  id: string;
  name: string;
  captainName: string;
  phone: string;
  logoUrl: string | null;
  city: string;
  sports: string[];
  motto: string;
  events: LocalClubEvent[];
}

function slugifyText(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "jadwal-mabar"
  );
}

function resolveTimePeriodFromHour(startTime: string): CommunityEvent["timePeriod"] {
  const hour = Number.parseInt(startTime.split(":")[0] ?? "19", 10);
  if (hour < 11) return "Pagi";
  if (hour < 15) return "Siang";
  if (hour < 18) return "Sore";
  return "Malam";
}

export function ClubDashboardClient({ clubId }: { clubId: string }) {
  const { toast } = useToast();
  const seedClub = initialClubProfiles.find((c) => c.id === clubId || c.slug === clubId);
  const seedEvents = React.useMemo<LocalClubEvent[]>(() => {
    if (!seedClub) return [];
    return initialCommunities
      .filter((ev) => ev.clubId === seedClub.id)
      .map((ev) => ({
        id: ev.slug,
        slug: ev.slug,
        title: ev.communityName,
        venueName: ev.venue,
        eventDate: ev.date,
        startTime: ev.time.split(" - ")[0] ?? "19:00",
        endTime: (ev.time.split(" - ")[1] ?? "21:00 WIB").replace(" WIB", ""),
        sport: ev.sport,
        totalSlots: ev.totalSlots,
        filledSlots: ev.slots.filter((s) => s.status === "paid").length,
        pricePerSlot: ev.price,
      }));
  }, [seedClub]);

  const defaultClubName = React.useMemo(() => {
    if (seedClub) return seedClub.name;
    return (
      clubId
        .replace(/^club-/, "")
        .split("-")
        .filter(Boolean)
        .map((w) => (w.toLowerCase() === "fc" ? "FC" : w.charAt(0).toUpperCase() + w.slice(1)))
        .join(" ") || "Komunitas Baru FC"
    );
  }, [clubId, seedClub]);

  const [clubInfo, setClubInfo] = React.useState<StoredClubData>(() => ({
    id: clubId,
    name: defaultClubName,
    captainName: seedClub?.hostName ?? `Kapten ${defaultClubName}`,
    phone: "+6281210000001",
    logoUrl: null,
    city: seedClub?.city ?? "Jakarta Selatan",
    sports: seedClub?.sportLabels ?? ["Mini Soccer"],
    motto:
      seedClub?.vision ??
      "Lebih dari sekedar fun football, membangun ekosistem sepak bola dari komunitas.",
    events: seedEvents,
  }));

  const [createOpen, setCreateOpen] = React.useState(false);
  const [copiedSlug, setCopiedSlug] = React.useState<string | null>(null);
  const [eventTitle, setEventTitle] = React.useState("");
  const [venueName, setVenueName] = React.useState("");
  const [eventDate, setEventDate] = React.useState(() =>
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  );
  const [startTime, setStartTime] = React.useState("19:00");
  const [endTime, setEndTime] = React.useState("21:00");
  const [totalSlots, setTotalSlots] = React.useState("14");
  const [pricePerSlot, setPricePerSlot] = React.useState("65000");

  React.useEffect(() => {
    try {
      const raw =
        window.localStorage.getItem(`kickpro_club_${clubId}`) ??
        (!seedClub ? window.localStorage.getItem("kickpro_latest_club") : null);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredClubData;
        const cleanClubSlug = slugifyText(parsed.name || defaultClubName);
        const normalizedEvents = (parsed.events ?? []).map((ev, idx) => {
          const resolvedSlug =
            ev.slug && !ev.slug.startsWith("event-17")
              ? ev.slug
              : idx === 0
                ? cleanClubSlug
                : `${cleanClubSlug}-${idx + 1}`;
          const sportLabel = ev.sport || parsed.sports?.[0] || "Mini Soccer";
          const totalSlotsCount = ev.totalSlots || 14;
          const filledCount = ev.filledSlots || 1;
          const syncedCommunityEvent: CommunityEvent = {
            id: resolvedSlug,
            slug: resolvedSlug,
            clubId: parsed.id,
            communityName: ev.title || `Mabar Rutin ${parsed.name}`,
            tagline: `${sportLabel} · ${parsed.name}`,
            description:
              parsed.motto ||
              `Jadwal main bareng resmi ${parsed.name}. Pilih nomor slot yang tersedia dan selesaikan pendaftaran via QRIS.`,
            sport: sportLabel,
            type: `Open Play (${parsed.name})`,
            venue: ev.venueName || `Lapangan Basecamp ${parsed.city}`,
            city: parsed.city || "Jakarta Selatan",
            address: `${ev.venueName}, ${parsed.city}`,
            date: ev.eventDate,
            time: `${ev.startTime} - ${ev.endTime} WIB`,
            timePeriod: resolveTimePeriodFromHour(ev.startTime),
            duration: "2 Jam",
            price: ev.pricePerSlot || 65000,
            totalSlots: totalSlotsCount,
            hostName: parsed.captainName || `Kapten ${parsed.name}`,
            hostRole: `Kapten / Admin ${parsed.name}`,
            hostPhone: parsed.phone,
            badge: "Jadwal Baru",
            rules: [
              "Hadir 15 menit sebelum kick-off",
              `Rompi tim disiapkan oleh ${parsed.name}`,
              "Jaga sportivitas, fair play, dan hindari tekel berbahaya",
            ],
            facilities: [
              `Lapangan ${ev.venueName} terkonfirmasi`,
              "Rompi tim & bola pertandingan",
              "Air mineral disediakan host",
            ],
            slots: Array.from({ length: totalSlotsCount }, (_, sIdx) => ({
              id: sIdx + 1,
              status: sIdx < filledCount ? "paid" : "available",
              name:
                sIdx === 0
                  ? parsed.captainName || "Kapten"
                  : sIdx < filledCount
                    ? `Pemain ${sIdx + 1}`
                    : "",
            })),
            status: "open",
          };
          saveCustomCommunityEvent(syncedCommunityEvent);
          return {
            ...ev,
            id: resolvedSlug,
            slug: resolvedSlug,
          };
        });
        const updatedClub = {
          ...parsed,
          events: normalizedEvents,
        };
        setClubInfo(updatedClub);
        window.localStorage.setItem(`kickpro_club_${clubId}`, JSON.stringify(updatedClub));
      }
    } catch {
      // Ignore parse error
    }
  }, [clubId, seedClub, defaultClubName]);

  function handleCreateSchedule(e: React.FormEvent) {
    e.preventDefault();
    const cleanClubSlug = slugifyText(clubInfo.name);
    const titleText = eventTitle.trim() || `Mabar Rutin ${clubInfo.name}`;
    const eventSlug =
      clubInfo.events.length === 0
        ? cleanClubSlug
        : `${cleanClubSlug}-${slugifyText(titleText)}-${String(Date.now()).slice(-4)}`;

    const slotsCount = Number.parseInt(totalSlots, 10) || 14;
    const priceValue = Number.parseInt(pricePerSlot, 10) || 65000;
    const sportLabel = clubInfo.sports[0] ?? "Mini Soccer";
    const venueLabel = venueName.trim() || `Lapangan Basecamp ${clubInfo.city}`;

    const initialSlots: CommunitySlot[] = Array.from({ length: slotsCount }, (_, idx) => ({
      id: idx + 1,
      status: idx === 0 ? "paid" : "available",
      name: idx === 0 ? clubInfo.captainName : "",
    }));

    const fullCommunityEvent: CommunityEvent = {
      id: eventSlug,
      slug: eventSlug,
      clubId: clubInfo.id,
      communityName: titleText,
      tagline: `${sportLabel} · ${clubInfo.name}`,
      description: clubInfo.motto,
      sport: sportLabel,
      type: `Open Play (${clubInfo.name})`,
      venue: venueLabel,
      city: clubInfo.city,
      address: `${venueLabel}, ${clubInfo.city}`,
      date: eventDate,
      time: `${startTime} - ${endTime} WIB`,
      timePeriod: resolveTimePeriodFromHour(startTime),
      duration: "2 Jam",
      price: priceValue,
      totalSlots: slotsCount,
      hostName: clubInfo.captainName,
      hostRole: `Kapten / Admin ${clubInfo.name}`,
      hostPhone: clubInfo.phone,
      badge: "Jadwal Baru",
      rules: [
        "Hadir 15 menit sebelum kick-off",
        `Rompi tim disiapkan oleh ${clubInfo.name}`,
        "Jaga sportivitas, fair play, dan hindari tekel berbahaya",
      ],
      facilities: [
        `Lapangan ${venueLabel} terkonfirmasi`,
        "Rompi tim & bola pertandingan",
        "Air mineral disediakan host",
      ],
      slots: initialSlots,
      status: "open",
    };

    saveCustomCommunityEvent(fullCommunityEvent);

    const newEvent: LocalClubEvent = {
      id: eventSlug,
      slug: eventSlug,
      title: titleText,
      venueName: venueLabel,
      eventDate,
      startTime,
      endTime,
      sport: sportLabel,
      totalSlots: slotsCount,
      filledSlots: 1,
      pricePerSlot: priceValue,
    };

    const updated: StoredClubData = {
      ...clubInfo,
      events: [newEvent, ...clubInfo.events],
    };
    setClubInfo(updated);

    try {
      window.localStorage.setItem(`kickpro_club_${clubId}`, JSON.stringify(updated));
      window.localStorage.setItem("kickpro_latest_club", JSON.stringify(updated));
    } catch {
      // Ignore storage error
    }

    setCreateOpen(false);
    setEventTitle("");
    setVenueName("");
    toast({
      title: "Jadwal & Manifest Slot berhasil dibuka!",
      description: `Link pendaftaran /event/${eventSlug} siap disalin & dibagikan ke pemain.`,
      variant: "success",
    });
  }

  function buildScheduleInvitePath(ev: LocalClubEvent): string {
    return `/event/${ev.slug}`;
  }

  async function handleCopyScheduleLink(ev: LocalClubEvent) {
    const url = `${window.location.origin}${buildScheduleInvitePath(ev)}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Ignore clipboard fallback
    }
    setCopiedSlug(ev.slug);
    setTimeout(() => {
      setCopiedSlug((prev) => (prev === ev.slug ? null : prev));
    }, 2500);
    toast({
      title: `Link pendaftaran ${ev.title} berhasil disalin!`,
      description: `${window.location.origin}/event/${ev.slug}`,
      variant: "success",
    });
  }

  function handleShareWhatsApp(ev: LocalClubEvent) {
    const url = `${window.location.origin}${buildScheduleInvitePath(ev)}`;
    const text = encodeURIComponent(
      `⚽ *UNDANGAN MABAR ${clubInfo.name.toUpperCase()}*\n` +
        `*${ev.title}*\n\n` +
        `📍 *Venue:* ${ev.venueName} (${clubInfo.city})\n` +
        `📅 *Tanggal:* ${formatDateIndo(ev.eventDate)}\n` +
        `⏰ *Jam:* ${ev.startTime} - ${ev.endTime} WIB\n` +
        `💰 *Biaya:* ${formatRupiah(ev.pricePerSlot)} / Slot\n\n` +
        `Daftar & pilih nomor slotmu langsung di link ini:\n${url}`,
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  }

  const walletBalance = seedClub ? 450000 : 0;

  return (
    <ClubLayout
      clubId={clubId}
      clubName={clubInfo.name}
      clubLogoUrl={clubInfo.logoUrl}
      activeSection="dashboard"
    >
      <div className="space-y-6">
        {/* HEADER IDENTITAS KOMUNITAS */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-start gap-4">
              {clubInfo.logoUrl ? (
                <img
                  src={clubInfo.logoUrl}
                  alt={clubInfo.name}
                  className="size-16 shrink-0 rounded-2xl border border-slate-200 object-cover shadow-sm"
                />
              ) : (
                <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-950 font-display text-xl font-black text-lime shadow-sm">
                  {clubInfo.name
                    .split(" ")
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()}
                </div>
              )}

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900">
                    {clubInfo.name}
                  </h1>
                  <Badge variant="available">Head Admin</Badge>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-bold text-emerald-700">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" aria-hidden="true" />
                    Basecamp: {clubInfo.city}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center gap-1">
                    <Trophy className="size-3.5" aria-hidden="true" />
                    {clubInfo.sports.join(", ")}
                  </span>
                </div>

                {clubInfo.motto && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs italic text-slate-600">
                    <Quote className="size-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
                    <span>&ldquo;{clubInfo.motto}&rdquo;</span>
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-950 px-4 py-3 text-xs font-extrabold text-white shadow-sm transition hover:bg-emerald-900"
            >
              <Plus className="size-4 text-lime" aria-hidden="true" />
              <span>Buka Jadwal &amp; Manifest Slot</span>
            </button>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Saldo Dompet Klub</CardDescription>
              <CardTitle className="text-2xl text-emerald-800">
                {formatRupiah(walletBalance)}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-600">
              Otomatis bertambah dari pembayaran slot QRIS
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Jadwal &amp; Manifest Aktif</CardDescription>
              <CardTitle className="text-2xl">{clubInfo.events.length} Jadwal</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-600">
              {clubInfo.events.length > 0
                ? clubInfo.events[0]!.title
                : "Belum ada jadwal mabar yang dibuka"}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Kapten &amp; Kota Basecamp</CardDescription>
              <CardTitle className="text-lg">{clubInfo.captainName}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-600">
              {clubInfo.city} • {clubInfo.sports.join(" / ")}
            </CardContent>
          </Card>
        </div>

        {/* DAFTAR JADWAL & MANIFEST SLOT (EMPTY STATE JIKA BELUM ADA LISTNYA) */}
        <section id="events" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-extrabold text-slate-900">
                Daftar Jadwal &amp; Manifest Slot
              </h2>
              <p className="text-xs text-slate-500">
                Salin link jadwal mabar dan bagikan ke pemain agar mereka bisa langsung daftar &amp;
                pilih slot.
              </p>
            </div>
          </div>

          {clubInfo.events.length === 0 ? (
            <div className="from-emerald-950 relative overflow-hidden rounded-3xl border-2 border-emerald-900 bg-gradient-to-br to-slate-950 p-8 text-center text-white shadow-soft sm:p-12">
              <div className="bg-lime/10 pointer-events-none absolute -right-16 -top-16 size-56 rounded-full blur-2xl" />

              <div className="relative mx-auto max-w-lg">
                <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-lime text-emerald-950 shadow-glow">
                  <CalendarPlus className="size-8" aria-hidden="true" />
                </div>

                <span className="mt-4 inline-block rounded-full bg-white/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-lime">
                  Belum Ada List Jadwal Mabar
                </span>

                <h3 className="mt-3 font-display text-2xl font-black text-white sm:text-3xl">
                  Buka Jadwal &amp; Manifest Slot Pertamamu
                </h3>

                <p className="mt-2 text-xs leading-relaxed text-emerald-100/80 sm:text-sm">
                  Komunitas <strong>{clubInfo.name}</strong> ({clubInfo.city}) sudah siap! Sekarang
                  buat jadwal mabar pertamamu agar anggota bisa langsung memilih nomor slot dan
                  membayar patungan lapangan via QRIS.
                </p>

                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setCreateOpen(true)}
                    className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-lime px-7 py-4 text-xs font-black uppercase tracking-wider text-emerald-950 shadow-glow transition hover:scale-105 hover:bg-[#d6fa42] sm:text-sm"
                  >
                    <CalendarPlus className="size-5" aria-hidden="true" />
                    <span>Buka Jadwal &amp; Manifest Slot</span>
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {clubInfo.events.map((ev) => {
                const isCopied = copiedSlug === ev.slug;
                return (
                  <article
                    key={ev.id}
                    className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-soft"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold text-emerald-800">
                          Buka Pendaftaran • {ev.filledSlots}/{ev.totalSlots} Slot
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold uppercase text-slate-700">
                          {ev.sport}
                        </span>
                      </div>

                      <h3 className="mt-3 font-display text-lg font-extrabold text-slate-900">
                        {ev.title}
                      </h3>
                      <p className="mt-0.5 text-xs font-semibold text-emerald-700">
                        Komunitas: {clubInfo.name}
                      </p>

                      <div className="mt-3 space-y-1.5 rounded-2xl bg-slate-50 p-3 text-xs text-slate-700">
                        <p className="flex items-center gap-2 font-semibold">
                          <MapPin className="size-3.5 text-emerald-700" aria-hidden="true" />
                          <span>
                            {ev.venueName} ({clubInfo.city})
                          </span>
                        </p>
                        <p className="flex items-center gap-2">
                          <CalendarDays className="size-3.5 text-emerald-700" aria-hidden="true" />
                          <span>{formatDateIndo(ev.eventDate)}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <Clock3 className="size-3.5 text-emerald-700" aria-hidden="true" />
                          <span>
                            {ev.startTime} - {ev.endTime} WIB
                          </span>
                        </p>
                        <p className="flex items-center gap-2 font-bold text-emerald-800">
                          <QrCode className="size-3.5 text-emerald-700" aria-hidden="true" />
                          <span>{formatRupiah(ev.pricePerSlot)} / Slot</span>
                        </p>
                      </div>

                      {/* BOX COPY LINK UNDANGAN PENDAFTARAN PEMAIN */}
                      <div className="border-emerald-200/80 bg-emerald-50/50 mt-3 rounded-2xl border p-3">
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                          Link Pendaftaran Pemain:
                        </p>
                        <div className="mt-1.5 flex items-center justify-between gap-2">
                          <span className="truncate font-mono text-xs font-bold text-slate-700">
                            /event/{ev.slug}
                          </span>
                          <div className="flex shrink-0 items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleCopyScheduleLink(ev)}
                              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-extrabold transition ${
                                isCopied
                                  ? "bg-emerald-700 text-white"
                                  : "bg-white text-emerald-900 shadow-xs hover:bg-emerald-100"
                              }`}
                            >
                              {isCopied ? (
                                <>
                                  <Check className="size-3.5" aria-hidden="true" />
                                  <span>Tersalin</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="size-3.5" aria-hidden="true" />
                                  <span>Copy Link</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleShareWhatsApp(ev)}
                              className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-500"
                              title="Bagikan ke WhatsApp"
                            >
                              <Share2 className="size-3.5" aria-hidden="true" />
                              <span>WA</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
                      <Link
                        href={buildScheduleInvitePath(ev)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-950 px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-emerald-900"
                      >
                        <Users className="size-3.5" aria-hidden="true" />
                        <span>Buka Halaman Daftar Pemain ({clubInfo.name})</span>
                        <ArrowRight className="size-3.5" aria-hidden="true" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* DIALOG BUKA JADWAL & MANIFEST SLOT */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buka Jadwal &amp; Manifest Slot</DialogTitle>
            <DialogDescription>
              Atur jadwal mabar untuk komunitas {clubInfo.name}. Setelah dibuat, link pendaftaran
              pemain dapat langsung di-copy dan dibagikan.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSchedule} className="space-y-3.5">
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-slate-700">Judul Sesi Mabar</span>
              <input
                required
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder={`Mis. Mabar Rutin ${clubInfo.name}`}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-600 focus:bg-white"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-bold text-slate-700">
                Nama Lapangan / Venue ({clubInfo.city})
              </span>
              <input
                required
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                placeholder="Mis. Pancoran Soccer Field / Arena Mini Soccer"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-600 focus:bg-white"
              />
            </label>

            <div className="grid grid-cols-3 gap-2.5">
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-slate-700">Tanggal</span>
                <input
                  required
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-600 focus:bg-white"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-slate-700">Jam Mulai</span>
                <input
                  required
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-600 focus:bg-white"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-slate-700">Jam Selesai</span>
                <input
                  required
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-600 focus:bg-white"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-slate-700">
                  Total Kuota Slot Pemain
                </span>
                <input
                  required
                  type="number"
                  min={8}
                  max={44}
                  value={totalSlots}
                  onChange={(e) => setTotalSlots(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-emerald-600 focus:bg-white"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-slate-700">
                  Biaya per Slot (Rp)
                </span>
                <input
                  required
                  type="number"
                  min={10000}
                  step={5000}
                  value={pricePerSlot}
                  onChange={(e) => setPricePerSlot(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-emerald-600 focus:bg-white"
                />
              </label>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Batal
              </Button>
              <Button type="submit" variant="lime">
                <Link2 className="mr-1.5 size-4" aria-hidden="true" />
                Aktifkan Jadwal &amp; Buat Link
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </ClubLayout>
  );
}
