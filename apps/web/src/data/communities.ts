import type { ClubDoc, EventDoc, EventSlotDoc, SportType } from "@kickpro/shared";

export type CommunitySlotStatus = "available" | "locked" | "paid";

export interface CommunitySlot {
  id: number;
  status: CommunitySlotStatus;
  name: string;
}

export interface CommunityEvent {
  id: string;
  slug: string;
  clubId?: string;
  communityName: string;
  tagline: string;
  description: string;
  sport: string;
  type: string;
  venue: string;
  city: string;
  address: string;
  date: string;
  time: string;
  timePeriod: "Pagi" | "Siang" | "Sore" | "Malam";
  duration: string;
  price: number;
  totalSlots: number;
  hostName: string;
  hostRole: string;
  hostPhone?: string;
  rules: string[];
  facilities: string[];
  slots: CommunitySlot[];
  status: "open" | "almost_full" | "closed";
  badge?: string;
}

export interface CommunityProfile {
  id: string;
  slug: string;
  name: string;
  city: string;
  description: string;
  vision: string;
  sportLabels: string[];
  levelLabel: string;
  avgAge: number | null;
  totalMatchesPlayed: number;
  fairPlayScore: number;
  fairPlayCount: number;
  hostName: string;
  hostRole: string;
  basecampVenue: string;
  scheduleSummary: string;
  primaryEventSlug: string;
  activeEventsCount: number;
}

export interface SparringTeam {
  name: string;
  code: string;
  color: string;
  location: string;
  level: string;
  schedule: string;
  venue: string;
  splitNote: string;
}

export const initialSparringTeams: SparringTeam[] = [
  {
    name: "Garuda Muda FC",
    code: "GM",
    color: "bg-emerald-50 text-emerald-800",
    location: "Jakarta Selatan",
    level: "fun",
    schedule: "Sabtu • 20.00 WIB",
    venue: "Arena Mini Soccer Kemang",
    splitNote: "Split bill 50:50 untuk sewa lapangan & wasit. Total sewa Rp1.200.000.",
  },
  {
    name: "Senayan United",
    code: "SU",
    color: "bg-blue-50 text-blue-700",
    location: "Jakarta Pusat",
    level: "competitive",
    schedule: "Sabtu • 20.00 WIB",
    venue: "Lapangan Mini Soccer ABC Senayan",
    splitNote: "Split bill 50:50 untuk sewa lapangan & wasit. Estimasi per tim Rp650.000.",
  },
];

const SEED_PLAYERS = [
  { userId: "user-budi", name: "Budi Santoso", phone: "+6281210000001" },
  { userId: "user-andi", name: "Andi Wijaya", phone: "+6281210000004" },
  { userId: "user-dimas", name: "Dimas Pratama", phone: "+6281210000002" },
  { userId: "user-rizky", name: "Rizky Ramadhan", phone: "+6281210000003" },
  { userId: "user-fajar", name: "Fajar Nugroho", phone: "+6281210000005" },
];

function buildSeedSlots(totalSlots: number, filledSlots: number, lockedSlots: number): CommunitySlot[] {
  const slots: CommunitySlot[] = [];
  for (let i = 1; i <= totalSlots; i++) {
    if (i <= filledSlots) {
      const player = SEED_PLAYERS[(i - 1) % SEED_PLAYERS.length]!;
      slots.push({
        id: i,
        status: "paid",
        name: player.name,
      });
    } else if (i <= filledSlots + lockedSlots) {
      slots.push({
        id: i,
        status: "locked",
        name: "Fajar Nugroho",
      });
    } else {
      slots.push({
        id: i,
        status: "available",
        name: "",
      });
    }
  }
  return slots;
}

function getRelativeDateString(daysAhead: number): string {
  const d = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

/**
 * Daftar jadwal mabar sesuai data `scripts/seed.ts`:
 * 1. event-jumat-malam (Garuda Muda FC - Mini Soccer 7v7, Pancoran Soccer Field, Jakarta Selatan, 14 slot)
 * 2. event-rabu-kemang (Garuda Muda FC - Futsal 5v5, Planet Futsal Kemang, Jakarta Selatan, 15 slot)
 * 3. event-sabtu-senayan (Senayan United - Mini Soccer 8v8, Lapangan Mini Soccer ABC Senayan, Jakarta Pusat, 16 slot)
 */
export const initialCommunities: CommunityEvent[] = [
  {
    id: "event-jumat-malam",
    slug: "event-jumat-malam",
    clubId: "club-garuda-muda",
    communityName: "Mabar Fun Mini Soccer Jumat Malam",
    tagline: "Mini Soccer 7v7 · Garuda Muda FC",
    description:
      "Komunitas mini soccer dan sparring rutin di area Pancoran & Kemang setiap Jumat malam. Main sehat, fair play, dan transparansi kas untuk semua anggota.",
    sport: "Mini Soccer",
    type: "Open Play (7v7 • 2 Tim)",
    venue: "Pancoran Soccer Field",
    city: "Jakarta Selatan",
    address: "Jl. Gatot Subroto Kav. 72, Pancoran, Jakarta Selatan",
    date: getRelativeDateString(3),
    time: "19:00 - 21:00 WIB",
    timePeriod: "Malam",
    duration: "2 Jam",
    price: 65000,
    totalSlots: 14,
    hostName: "Budi Santoso",
    hostRole: "Head Admin Garuda Muda FC",
    hostPhone: "+6281210000001",
    badge: "Fun Play",
    rules: [
      "Hadir 15 menit sebelum kick-off (18:45 WIB)",
      "Rompi 2 tim (Tim Merah & Tim Putih) disiapkan oleh host",
      "Jaga sportivitas, fair play, dan hindari tekel berbahaya",
    ],
    facilities: [
      "Lapangan Pancoran Soccer Field terkonfirmasi",
      "Rompi tim & bola pertandingan",
      "Air mineral disediakan host",
    ],
    status: "open",
    slots: buildSeedSlots(14, 2, 1),
  },
  {
    id: "event-rabu-kemang",
    slug: "event-rabu-kemang",
    clubId: "club-garuda-muda",
    communityName: "Futsal Rutin Rabu Malam — Fun & Keringetan",
    tagline: "Futsal 5v5 · Garuda Muda FC",
    description:
      "Sesi futsal rutin pertengahan minggu oleh Garuda Muda FC di Planet Futsal Kemang. Pembagian 3 tim rotasi rapi dan pembayaran QRIS instan.",
    sport: "Futsal",
    type: "Open Play (5v5 • 3 Tim)",
    venue: "Planet Futsal Kemang",
    city: "Jakarta Selatan",
    address: "Jl. Kemang Raya No. 18, Mampang, Jakarta Selatan",
    date: getRelativeDateString(2),
    time: "19:30 - 21:30 WIB",
    timePeriod: "Malam",
    duration: "2 Jam",
    price: 45000,
    totalSlots: 15,
    hostName: "Rizky Ramadhan",
    hostRole: "Event Host Garuda Muda FC",
    hostPhone: "+6281210000003",
    badge: "Pemula",
    rules: [
      "Hadir 15 menit sebelum kick-off",
      "Gunakan sepatu futsal non-marking",
      "Rotasi 3 tim adil (Tim Merah, Tim Putih, Tim Biru)",
    ],
    facilities: [
      "Lapangan Planet Futsal Kemang terkonfirmasi",
      "Rompi 3 tim & bola futsal standar",
      "Air mineral disediakan host",
    ],
    status: "open",
    slots: buildSeedSlots(15, 9, 0),
  },
  {
    id: "event-sabtu-senayan",
    slug: "event-sabtu-senayan",
    clubId: "club-senayan-united",
    communityName: "Saturday Night Mini Soccer 8v8 — Senayan",
    tagline: "Mini Soccer 8v8 · Senayan United",
    description:
      "Klub sepak bola & mini soccer kompetitif seputaran GBK Senayan. Menjaga kebugaran dan silaturahmi lewat kompetisi sehat setiap akhir pekan.",
    sport: "Mini Soccer",
    type: "Open Play (8v8 • 2 Tim)",
    venue: "Lapangan Mini Soccer ABC Senayan",
    city: "Jakarta Pusat",
    address: "Kompleks GBK Senayan, Tanah Abang, Jakarta Pusat",
    date: getRelativeDateString(4),
    time: "20:00 - 22:00 WIB",
    timePeriod: "Malam",
    duration: "2 Jam",
    price: 85000,
    totalSlots: 16,
    hostName: "Andi Wijaya",
    hostRole: "Captain Senayan United",
    hostPhone: "+6281210000004",
    badge: "Kompetitif",
    rules: [
      "Hadir 15 menit sebelum kick-off",
      "Rompi 2 tim disiapkan oleh host",
      "Permainan tempo kompetitif tetap junjung tinggi fair play",
    ],
    facilities: [
      "Lapangan Mini Soccer ABC Senayan terkonfirmasi",
      "Rompi tim & bola pertandingan",
      "Air mineral disediakan host",
    ],
    status: "open",
    slots: buildSeedSlots(16, 13, 1),
  },
];

/**
 * Daftar Komunitas / Klub sesuai data `scripts/seed.ts` (`club-garuda-muda` & `club-senayan-united`)
 */
export const initialClubProfiles: CommunityProfile[] = [
  {
    id: "club-garuda-muda",
    slug: "garuda-muda-fc",
    name: "Garuda Muda FC",
    city: "Jakarta Selatan",
    description:
      "Komunitas mini soccer dan sparring rutin di area Pancoran & Kemang setiap Jumat malam.",
    vision: "Main sehat, fair play, dan transparansi kas untuk semua anggota.",
    sportLabels: ["Mini Soccer", "Futsal"],
    levelLabel: "Fun Play",
    avgAge: 27,
    totalMatchesPlayed: 18,
    fairPlayScore: 4.9,
    fairPlayCount: 14,
    hostName: "Budi Santoso",
    hostRole: "Head Admin (bersama Dimas Pratama & Rizky Ramadhan)",
    basecampVenue: "Pancoran Soccer Field & Planet Futsal Kemang",
    scheduleSummary: "Rabu 19:30 WIB (Futsal) & Jumat 19:00 WIB (Mini Soccer)",
    primaryEventSlug: "event-jumat-malam",
    activeEventsCount: 2,
  },
  {
    id: "club-senayan-united",
    slug: "senayan-united",
    name: "Senayan United",
    city: "Jakarta Pusat",
    description: "Klub sepak bola & mini soccer kompetitif seputaran GBK Senayan.",
    vision: "Menjaga kebugaran dan silaturahmi lewat kompetisi sehat.",
    sportLabels: ["Mini Soccer", "Sepak Bola"],
    levelLabel: "Kompetitif",
    avgAge: 29,
    totalMatchesPlayed: 25,
    fairPlayScore: 4.8,
    fairPlayCount: 20,
    hostName: "Andi Wijaya",
    hostRole: "Captain Senayan United",
    basecampVenue: "Lapangan Mini Soccer ABC Senayan (GBK)",
    scheduleSummary: "Sabtu 20:00 - 22:00 WIB (Mini Soccer 8v8)",
    primaryEventSlug: "event-sabtu-senayan",
    activeEventsCount: 1,
  },
];

const SPORT_LABELS: Record<SportType, string> = {
  mini_soccer: "Mini Soccer",
  futsal: "Futsal",
  football: "Sepak Bola",
};

const LEVEL_LABELS: Record<ClubDoc["level"], string> = {
  beginner: "Pemula",
  fun: "Fun Play",
  competitive: "Kompetitif",
};

function resolveCityFromAddress(address: string): string {
  const lower = address.toLowerCase();
  if (lower.includes("jakarta selatan")) return "Jakarta Selatan";
  if (lower.includes("jakarta pusat")) return "Jakarta Pusat";
  if (lower.includes("tangerang selatan") || lower.includes("bintaro") || lower.includes("bsd")) {
    return "Tangerang Selatan";
  }
  if (lower.includes("depok")) return "Depok";
  if (lower.includes("jakarta barat")) return "Jakarta Barat";
  return "Jakarta Selatan";
}

function resolveTimePeriod(startTime: string): CommunityEvent["timePeriod"] {
  const hour = Number.parseInt(startTime.split(":")[0] ?? "19", 10);
  if (hour < 11) return "Pagi";
  if (hour < 15) return "Siang";
  if (hour < 18) return "Sore";
  return "Malam";
}

export function buildSlotsFromEvent(
  event: EventDoc,
  firestoreSlots?: EventSlotDoc[],
): CommunitySlot[] {
  if (firestoreSlots && firestoreSlots.length > 0) {
    return firestoreSlots.map((slot) => ({
      id: slot.slotNumber,
      status:
        slot.status === "paid" || slot.status === "checked_in"
          ? "paid"
          : slot.status === "locked"
            ? "locked"
            : "available",
      name:
        slot.playerName ??
        (slot.status === "locked" ? "Fajar Nugroho (Checkout)" : ""),
    }));
  }

  return buildSeedSlots(event.totalSlots, event.filledSlots, event.lockedSlots);
}

export function eventDocToCommunityEvent(
  event: EventDoc,
  firestoreSlots?: EventSlotDoc[],
): CommunityEvent {
  const slug = event.id ?? "event-jumat-malam";
  const isSenayan = event.clubId === "club-senayan-united";
  const isRabuFutsal = slug === "event-rabu-kemang";

  return {
    id: slug,
    slug,
    clubId: event.clubId,
    communityName: event.title,
    tagline: `${SPORT_LABELS[event.sportType]} ${event.playersPerTeam}v${event.playersPerTeam} · ${isSenayan ? "Senayan United" : "Garuda Muda FC"}`,
    description: isSenayan
      ? "Klub sepak bola & mini soccer kompetitif seputaran GBK Senayan. Menjaga kebugaran dan silaturahmi lewat kompetisi sehat."
      : `Sesi terbuka oleh Garuda Muda FC di ${event.venueName}. Pembagian ${event.teamCount} tim rapi dan pembayaran QRIS instan.`,
    sport: SPORT_LABELS[event.sportType],
    type: `Open Play (${event.playersPerTeam}v${event.playersPerTeam} • ${event.teamCount} Tim)`,
    venue: event.venueName,
    city: resolveCityFromAddress(event.venueAddress),
    address: event.venueAddress,
    date: event.eventDate,
    time: `${event.startTime} - ${event.endTime} WIB`,
    timePeriod: resolveTimePeriod(event.startTime),
    duration: "2 Jam",
    price: event.pricePerSlot,
    totalSlots: event.totalSlots,
    hostName: isSenayan ? "Andi Wijaya" : isRabuFutsal ? "Rizky Ramadhan" : "Budi Santoso",
    hostRole: isSenayan
      ? "Captain Senayan United"
      : isRabuFutsal
        ? "Event Host Garuda Muda FC"
        : "Head Admin Garuda Muda FC",
    hostPhone: isSenayan
      ? "+6281210000004"
      : isRabuFutsal
        ? "+6281210000003"
        : "+6281210000001",
    badge: LEVEL_LABELS[event.level],
    rules: [
      "Hadir 15 menit sebelum kick-off",
      `Rompi ${event.teamCount} tim disiapkan oleh host`,
      "Jaga sportivitas dan hindari tekel berbahaya",
    ],
    facilities: [
      `Lapangan ${event.venueName} terkonfirmasi`,
      "Rompi tim & bola pertandingan",
      "Air mineral disediakan host",
    ],
    slots: buildSlotsFromEvent(event, firestoreSlots),
    status: event.status === "open" ? "open" : "closed",
  };
}

export function clubDocToCommunityProfile(club: ClubDoc): CommunityProfile {
  const id = club.id ?? club.slug;
  const isSenayan = id === "club-senayan-united" || club.slug === "senayan-united";
  return {
    id,
    slug: club.slug,
    name: club.name,
    city: club.city,
    description: club.description,
    vision: club.vision,
    sportLabels: club.sportTypes.map((st) => SPORT_LABELS[st]),
    levelLabel: LEVEL_LABELS[club.level],
    avgAge: club.avgAge,
    totalMatchesPlayed: club.totalMatchesPlayed,
    fairPlayScore: club.fairPlayScore,
    fairPlayCount: club.fairPlayCount,
    hostName: isSenayan ? "Andi Wijaya" : "Budi Santoso",
    hostRole: isSenayan
      ? "Captain Senayan United"
      : "Head Admin (bersama Dimas Pratama & Rizky Ramadhan)",
    basecampVenue: isSenayan
      ? "Lapangan Mini Soccer ABC Senayan (GBK)"
      : "Pancoran Soccer Field & Planet Futsal Kemang",
    scheduleSummary: isSenayan
      ? "Sabtu 20:00 - 22:00 WIB (Mini Soccer 8v8)"
      : "Rabu 19:30 WIB (Futsal) & Jumat 19:00 WIB (Mini Soccer)",
    primaryEventSlug: isSenayan ? "event-sabtu-senayan" : "event-jumat-malam",
    activeEventsCount: isSenayan ? 1 : 2,
  };
}

export function resolveCommunityBySlug(slug: string): CommunityEvent {
  if (slug === "garuda-muda-fc" || slug === "club-garuda-muda" || slug === "eryan-soccer") {
    return initialCommunities[0]!;
  }
  if (slug === "senayan-united" || slug === "club-senayan-united") {
    return initialCommunities[2] ?? initialCommunities[0]!;
  }
  const found = initialCommunities.find((c) => c.slug === slug);
  if (found) {
    return found;
  }

  // Fallback dinamis berdasarkan slug (mis. "cipondoh-fc" -> "Cipondoh FC")
  const humanizedName = slug
    .replace(/^club-/, "")
    .replace(/^event-/, "")
    .split("-")
    .filter(Boolean)
    .map((w) => (w.toLowerCase() === "fc" ? "FC" : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ") || "Komunitas Mabar";

  const base = initialCommunities[0]!;
  return {
    ...base,
    id: slug,
    slug,
    communityName: `Mabar Rutin ${humanizedName}`,
    tagline: `Mini Soccer · ${humanizedName}`,
    description: `Jadwal main bareng resmi ${humanizedName}. Pilih nomor slot yang tersedia dan selesaikan pendaftaran via QRIS.`,
    hostName: `Kapten ${humanizedName}`,
    hostRole: `Head Admin ${humanizedName}`,
  };
}

export const CUSTOM_EVENTS_STORAGE_KEY = "kickpro_custom_events";

export function loadCustomCommunityEvents(): CommunityEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CUSTOM_EVENTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CommunityEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomCommunityEvent(event: CommunityEvent): void {
  if (typeof window === "undefined") return;
  try {
    const existing = loadCustomCommunityEvents().filter((e) => e.slug !== event.slug);
    const updated = [event, ...existing];
    window.localStorage.setItem(CUSTOM_EVENTS_STORAGE_KEY, JSON.stringify(updated));
    window.localStorage.setItem(`kickpro_event_${event.slug}`, JSON.stringify(event));
    void fetch("/api/custom-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event }),
    }).catch(() => {
      // Ignore network error
    });
  } catch {
    // Ignore storage quota error
  }
}

export function getCustomCommunityEventBySlug(slug: string): CommunityEvent | null {
  if (typeof window === "undefined") return null;
  try {
    const direct = window.localStorage.getItem(`kickpro_event_${slug}`);
    if (direct) {
      return JSON.parse(direct) as CommunityEvent;
    }
    const list = loadCustomCommunityEvents();
    const fromList = list.find((e) => e.slug === slug || e.id === slug);
    if (fromList) {
      return fromList;
    }

    // Fallback: cari di data klub yang tersimpan di localStorage (untuk jadwal yang dibuat sebelumnya)
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key || (!key.startsWith("kickpro_club_") && key !== "kickpro_latest_club")) {
        continue;
      }
      const rawClub = window.localStorage.getItem(key);
      if (!rawClub) continue;
      const club = JSON.parse(rawClub) as {
        id?: string;
        name?: string;
        captainName?: string;
        phone?: string;
        city?: string;
        sports?: string[];
        motto?: string;
        events?: Array<{
          id: string;
          slug?: string;
          title: string;
          venueName: string;
          eventDate: string;
          startTime: string;
          endTime: string;
          sport: string;
          totalSlots: number;
          filledSlots: number;
          pricePerSlot: number;
        }>;
      };
      const matchedEv = (club.events ?? []).find(
        (ev) => ev.slug === slug || ev.id === slug || club.id === `club-${slug}`,
      );
      if (matchedEv) {
        const clubName = club.name ?? "Komunitas FC";
        const captainName = club.captainName ?? `Kapten ${clubName}`;
        const city = club.city ?? "Jakarta Selatan";
        const sport = matchedEv.sport || club.sports?.[0] || "Mini Soccer";
        const totalSlots = matchedEv.totalSlots || 14;
        const filledSlots = matchedEv.filledSlots || 1;
        const slots: CommunitySlot[] = Array.from({ length: totalSlots }, (_, idx) => ({
          id: idx + 1,
          status: idx < filledSlots ? "paid" : "available",
          name: idx === 0 ? captainName : idx < filledSlots ? `Pemain ${idx + 1}` : "",
        }));
        const synthesized: CommunityEvent = {
          id: slug,
          slug,
          clubId: club.id,
          communityName: matchedEv.title || `Mabar Rutin ${clubName}`,
          tagline: `${sport} · ${clubName}`,
          description:
            club.motto ||
            `Jadwal main bareng resmi ${clubName}. Pilih nomor slot yang tersedia dan selesaikan pendaftaran via QRIS.`,
          sport,
          type: `Open Play (${clubName})`,
          venue: matchedEv.venueName || `Lapangan Basecamp ${city}`,
          city,
          address: `${matchedEv.venueName}, ${city}`,
          date: matchedEv.eventDate,
          time: `${matchedEv.startTime} - ${matchedEv.endTime} WIB`,
          timePeriod: resolveTimePeriod(matchedEv.startTime),
          duration: "2 Jam",
          price: matchedEv.pricePerSlot || 65000,
          totalSlots,
          hostName: captainName,
          hostRole: `Kapten / Admin ${clubName}`,
          hostPhone: club.phone,
          badge: "Jadwal Baru",
          rules: [
            "Hadir 15 menit sebelum kick-off",
            `Rompi tim disiapkan oleh ${clubName}`,
            "Jaga sportivitas, fair play, dan hindari tekel berbahaya",
          ],
          facilities: [
            `Lapangan ${matchedEv.venueName} terkonfirmasi`,
            "Rompi tim & bola pertandingan",
            "Air mineral disediakan host",
          ],
          slots,
          status: "open",
        };
        saveCustomCommunityEvent(synthesized);
        return synthesized;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function encodeScheduleShareParams(ev: {
  title: string;
  clubName: string;
  venue: string;
  city: string;
  date: string;
  start: string;
  end: string;
  sport: string;
  slots: number;
  price: number;
  host: string;
  motto?: string;
}): string {
  const params = new URLSearchParams({
    title: ev.title,
    club: ev.clubName,
    venue: ev.venue,
    city: ev.city,
    date: ev.date,
    start: ev.start,
    end: ev.end,
    sport: ev.sport,
    slots: String(ev.slots),
    price: String(ev.price),
    host: ev.host,
  });
  if (ev.motto) {
    params.set("motto", ev.motto);
  }
  return params.toString();
}

export function decodeScheduleFromSearchParams(
  slug: string,
  searchParams: { get: (key: string) => string | null },
): CommunityEvent | null {
  const title = searchParams.get("title");
  const clubName = searchParams.get("club");
  if (!title && !clubName) return null;

  const resolvedClub = clubName ?? "Komunitas FC";
  const resolvedTitle = title ?? `Mabar Rutin ${resolvedClub}`;
  const venue = searchParams.get("venue") ?? "Lapangan Basecamp";
  const city = searchParams.get("city") ?? "Jakarta Selatan";
  const date = searchParams.get("date") ?? getRelativeDateString(3);
  const start = searchParams.get("start") ?? "19:00";
  const end = searchParams.get("end") ?? "21:00";
  const sport = searchParams.get("sport") ?? "Mini Soccer";
  const totalSlots = Number.parseInt(searchParams.get("slots") ?? "14", 10) || 14;
  const price = Number.parseInt(searchParams.get("price") ?? "65000", 10) || 65000;
  const hostName = searchParams.get("host") ?? `Kapten ${resolvedClub}`;
  const motto =
    searchParams.get("motto") ??
    `Jadwal main bareng resmi ${resolvedClub}. Pilih nomor slot yang tersedia dan selesaikan pendaftaran via QRIS.`;

  const slots: CommunitySlot[] = Array.from({ length: totalSlots }, (_, idx) => ({
    id: idx + 1,
    status: idx === 0 ? "paid" : "available",
    name: idx === 0 ? hostName : "",
  }));

  return {
    id: slug,
    slug,
    communityName: resolvedTitle,
    tagline: `${sport} · ${resolvedClub}`,
    description: motto,
    sport,
    type: `Open Play (${resolvedClub})`,
    venue,
    city,
    address: `${venue}, ${city}`,
    date,
    time: `${start} - ${end} WIB`,
    timePeriod: resolveTimePeriod(start),
    duration: "2 Jam",
    price,
    totalSlots,
    hostName,
    hostRole: `Kapten / Admin ${resolvedClub}`,
    badge: "Jadwal Komunitas",
    rules: [
      "Hadir 15 menit sebelum kick-off",
      `Rompi tim disiapkan oleh ${resolvedClub}`,
      "Jaga sportivitas, fair play, dan hindari tekel berbahaya",
    ],
    facilities: [
      `Lapangan ${venue} terkonfirmasi`,
      "Rompi tim & bola pertandingan",
      "Air mineral disediakan host",
    ],
    slots,
    status: "open",
  };
}

export function formatDateIndo(dateString: string): string {
  const date = new Date(`${dateString}T00:00:00+07:00`);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}
