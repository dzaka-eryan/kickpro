import { getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import {
  COLLECTION_NAMES,
  ClubDocSchema,
  ClubMemberDocSchema,
  DEFAULT_PLATFORM_FEE_IDR,
  DEFAULT_SPARRING_ADMIN_FEE_IDR,
  DEFAULT_TEAM_PRESETS,
  EventDocSchema,
  EventSlotDocSchema,
  EventTeamDocSchema,
  LedgerEntryDocSchema,
  SLOT_LOCK_DURATION_MS,
  SparringMatchDocSchema,
  UserDocSchema,
  calculateTotalSlots,
} from "@kickpro/shared";

process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099";
process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";

function toTs(iso: string | null): Timestamp | null {
  return iso ? Timestamp.fromDate(new Date(iso)) : null;
}

function normalizeTimestamps(value: unknown): unknown {
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  if (Array.isArray(value)) {
    return value.map((item) => normalizeTimestamps(item));
  }
  if (typeof value === "object" && value !== null) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = normalizeTimestamps(v);
    }
    return out;
  }
  return value;
}

async function resolveTargetProjects(): Promise<string[]> {
  if (process.env.FIREBASE_PROJECT_ID) {
    return [process.env.FIREBASE_PROJECT_ID];
  }

  try {
    const res = await fetch("http://127.0.0.1:4400/emulators", {
      signal: AbortSignal.timeout(1500),
    });
    if (res.ok) {
      const info = (await res.json()) as { projectId?: string };
      if (info.projectId) {
        return [info.projectId];
      }
    }
  } catch {
    // Emulator Hub tidak terjangkau atau tidak membalas projectId
  }

  return ["demo-kickpro", "kickpro-staging"];
}

function getOrCreateAdminApp(projectId: string): App {
  const existing = getApps().find((app) => app.name === projectId);
  if (existing) {
    return existing;
  }
  return initializeApp({ projectId }, projectId);
}

async function seedAuthUsers(auth: Auth): Promise<boolean> {
  const authUsers = [
    {
      uid: "user-budi",
      displayName: "Budi Santoso",
      phoneNumber: "+6281210000001",
      email: "budi@kickpro.test",
    },
    {
      uid: "user-dimas",
      displayName: "Dimas Pratama",
      phoneNumber: "+6281210000002",
      email: "dimas@kickpro.test",
    },
    {
      uid: "user-rizky",
      displayName: "Rizky Ramadhan",
      phoneNumber: "+6281210000003",
      email: "rizky@kickpro.test",
    },
    {
      uid: "user-andi",
      displayName: "Andi Wijaya",
      phoneNumber: "+6281210000004",
      email: "andi@kickpro.test",
    },
    {
      uid: "user-fajar",
      displayName: "Fajar Nugroho",
      phoneNumber: "+6281210000005",
      email: "fajar@kickpro.test",
    },
  ];

  try {
    for (const u of authUsers) {
      try {
        await auth.getUser(u.uid);
        await auth.updateUser(u.uid, {
          displayName: u.displayName,
          phoneNumber: u.phoneNumber,
          email: u.email,
        });
      } catch (err) {
        const code = (err as { code?: string })?.code;
        if (code === "auth/user-not-found") {
          await auth.createUser({
            uid: u.uid,
            displayName: u.displayName,
            phoneNumber: u.phoneNumber,
            email: u.email,
            password: "Password123!",
          });
        } else {
          throw err;
        }
      }
    }
    return true;
  } catch (err) {
    console.info(
      `[INFO] Auth Emulator (${process.env.FIREBASE_AUTH_EMULATOR_HOST}) tidak aktif/terjangkau, melewati seeding Auth (${err instanceof Error ? err.message : String(err)}). Melanjutkan seeding Firestore...`,
    );
    return false;
  }
}

async function seedProject(projectId: string) {
  const app = getOrCreateAdminApp(projectId);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const now = new Date();
  const nowIso = now.toISOString();

  console.log(`\nSeeding Firebase Emulator untuk project "${projectId}"...`);

  const authSeeded = await seedAuthUsers(auth);

  // 1. Seed Users
  const users = [
    {
      uid: "user-budi",
      data: UserDocSchema.parse({
        name: "Budi Santoso",
        phoneNumber: "+6281210000001",
        city: "Jakarta Selatan",
        geo: { lat: -6.2615, lng: 106.8106, geohash: "qqguu2" },
        position: "MF",
        preferredFoot: "right",
        favoriteNumber: 8,
        attendanceScore: 100,
        stats: { matchesPlayed: 24, minutesPlayed: 1440, mvpCount: 4, noShowCount: 0 },
        createdAt: nowIso,
      }),
    },
    {
      uid: "user-dimas",
      data: UserDocSchema.parse({
        name: "Dimas Pratama",
        phoneNumber: "+6281210000002",
        city: "Jakarta Selatan",
        geo: { lat: -6.2615, lng: 106.8106, geohash: "qqguu2" },
        position: "DF",
        preferredFoot: "left",
        favoriteNumber: 4,
        attendanceScore: 98,
        stats: { matchesPlayed: 19, minutesPlayed: 1140, mvpCount: 1, noShowCount: 0 },
        createdAt: nowIso,
      }),
    },
    {
      uid: "user-rizky",
      data: UserDocSchema.parse({
        name: "Rizky Ramadhan",
        phoneNumber: "+6281210000003",
        city: "Jakarta Selatan",
        geo: { lat: -6.2615, lng: 106.8106, geohash: "qqguu2" },
        position: "FW",
        preferredFoot: "right",
        favoriteNumber: 10,
        attendanceScore: 96,
        stats: { matchesPlayed: 30, minutesPlayed: 1800, mvpCount: 7, noShowCount: 1 },
        createdAt: nowIso,
      }),
    },
    {
      uid: "user-andi",
      data: UserDocSchema.parse({
        name: "Andi Wijaya",
        phoneNumber: "+6281210000004",
        city: "Jakarta Pusat",
        geo: { lat: -6.1865, lng: 106.8341, geohash: "qqguy1" },
        position: "GK",
        preferredFoot: "both",
        favoriteNumber: 1,
        attendanceScore: 100,
        stats: { matchesPlayed: 15, minutesPlayed: 900, mvpCount: 3, noShowCount: 0 },
        createdAt: nowIso,
      }),
    },
    {
      uid: "user-fajar",
      data: UserDocSchema.parse({
        name: "Fajar Nugroho",
        phoneNumber: "+6281210000005",
        city: "Jakarta Barat",
        geo: { lat: -6.1674, lng: 106.7637, geohash: "qqgun8" },
        position: "FW",
        preferredFoot: "right",
        favoriteNumber: 9,
        attendanceScore: 95,
        stats: { matchesPlayed: 11, minutesPlayed: 660, mvpCount: 2, noShowCount: 0 },
        createdAt: nowIso,
      }),
    },
  ];

  for (const u of users) {
    await db
      .collection(COLLECTION_NAMES.users)
      .doc(u.uid)
      .set({
        ...u.data,
        createdAt: toTs(u.data.createdAt),
      });
  }

  // 2. Seed Clubs
  const garudaClub = ClubDocSchema.parse({
    name: "Garuda Muda FC",
    slug: "garuda-muda-fc",
    city: "Jakarta Selatan",
    geo: { lat: -6.2615, lng: 106.8106, geohash: "qqguu2" },
    description:
      "Komunitas mini soccer dan sparring rutin di area Pancoran & Kemang setiap Jumat malam.",
    vision: "Main sehat, fair play, dan transparansi kas untuk semua anggota.",
    sportTypes: ["mini_soccer", "futsal"],
    level: "fun",
    avgAge: 27,
    walletBalance: 450000,
    escrowBalance: 0,
    totalMatchesPlayed: 18,
    fairPlayScore: 4.9,
    fairPlayCount: 14,
    createdAt: nowIso,
  });

  const senayanClub = ClubDocSchema.parse({
    name: "Senayan United",
    slug: "senayan-united",
    city: "Jakarta Pusat",
    geo: { lat: -6.2186, lng: 106.8026, geohash: "qqguuv" },
    description: "Klub sepak bola & mini soccer kompetitif seputaran GBK Senayan.",
    vision: "Menjaga kebugaran dan silaturahmi lewat kompetisi sehat.",
    sportTypes: ["mini_soccer", "football"],
    level: "competitive",
    avgAge: 29,
    walletBalance: 750000,
    escrowBalance: 0,
    totalMatchesPlayed: 25,
    fairPlayScore: 4.8,
    fairPlayCount: 20,
    createdAt: nowIso,
  });

  await db
    .collection(COLLECTION_NAMES.clubs)
    .doc("club-garuda-muda")
    .set({
      ...garudaClub,
      createdAt: toTs(garudaClub.createdAt),
    });

  await db
    .collection(COLLECTION_NAMES.clubs)
    .doc("club-senayan-united")
    .set({
      ...senayanClub,
      createdAt: toTs(senayanClub.createdAt),
    });

  // Members of Garuda Muda FC (4 roles)
  const garudaMembers = [
    { userId: "user-budi", role: "head_admin" as const },
    { userId: "user-dimas", role: "treasurer" as const },
    { userId: "user-rizky", role: "event_host" as const },
    { userId: "user-andi", role: "member" as const },
  ];

  for (const m of garudaMembers) {
    const parsedMember = ClubMemberDocSchema.parse({
      userId: m.userId,
      role: m.role,
      status: "active",
      joinedAt: nowIso,
    });
    await db
      .collection(COLLECTION_NAMES.clubs)
      .doc("club-garuda-muda")
      .collection(COLLECTION_NAMES.members)
      .doc(m.userId)
      .set({
        ...parsedMember,
        joinedAt: toTs(parsedMember.joinedAt),
      });
  }

  // Ledger entries for Garuda Muda FC
  const ledgerEntries = [
    {
      id: "ledger-1",
      entry: LedgerEntryDocSchema.parse({
        type: "event_income",
        direction: "in",
        amount: 500000,
        balanceAfter: 500000,
        refType: "event",
        refId: "event-jumat-malam",
        note: "Pemasukan kas awal mabar mingguan",
        createdBy: "system",
        createdAt: nowIso,
      }),
    },
    {
      id: "ledger-2",
      entry: LedgerEntryDocSchema.parse({
        type: "manual_expense",
        category: "rompi",
        direction: "out",
        amount: 50000,
        balanceAfter: 450000,
        refType: "expense",
        refId: "exp-rompi-01",
        note: "Cuci & tambah 2 rompi tim",
        createdBy: "user-dimas",
        createdAt: nowIso,
      }),
    },
  ];

  for (const item of ledgerEntries) {
    await db
      .collection(COLLECTION_NAMES.clubs)
      .doc("club-garuda-muda")
      .collection(COLLECTION_NAMES.ledger)
      .doc(item.id)
      .set({
        ...item.entry,
        createdAt: toTs(item.entry.createdAt),
      });
  }

  // 3. Seed Events (Mabar Terbuka: Mini Soccer Jumat, Futsal Rabu, Mini Soccer Sabtu)
  interface SeedEventConfig {
    id: string;
    clubId: string;
    title: string;
    sportType: "mini_soccer" | "futsal" | "football";
    level: "beginner" | "fun" | "competitive";
    venueName: string;
    venueAddress: string;
    venueGeo: { lat: number; lng: number; geohash: string };
    bookingProofUrl: string;
    daysAhead: number;
    startHour: number;
    startMinute: number;
    durationHours: number;
    teamCount: number;
    playersPerTeam: number;
    pricePerSlot: number;
    filledSlots: number;
    lockedSlots: number;
  }

  const seedEventsConfig: SeedEventConfig[] = [
    {
      id: "event-jumat-malam",
      clubId: "club-garuda-muda",
      title: "Mabar Fun Mini Soccer Jumat Malam",
      sportType: "mini_soccer",
      level: "fun",
      venueName: "Pancoran Soccer Field",
      venueAddress: "Jl. Gatot Subroto Kav. 72, Pancoran, Jakarta Selatan",
      venueGeo: { lat: -6.2442, lng: 106.8427, geohash: "qqguv5" },
      bookingProofUrl: "https://storage.googleapis.com/demo-kickpro/bookings/psf-proof.jpg",
      daysAhead: 3,
      startHour: 19,
      startMinute: 0,
      durationHours: 2,
      teamCount: 2,
      playersPerTeam: 7,
      pricePerSlot: 65000,
      filledSlots: 2,
      lockedSlots: 1,
    },
    {
      id: "event-rabu-kemang",
      clubId: "club-garuda-muda",
      title: "Futsal Rutin Rabu Malam — Fun & Keringetan",
      sportType: "futsal",
      level: "beginner",
      venueName: "Planet Futsal Kemang",
      venueAddress: "Jl. Kemang Raya No. 18, Mampang, Jakarta Selatan",
      venueGeo: { lat: -6.2601, lng: 106.8142, geohash: "qqguu3" },
      bookingProofUrl: "https://storage.googleapis.com/demo-kickpro/bookings/kemang-futsal-proof.jpg",
      daysAhead: 2,
      startHour: 19,
      startMinute: 30,
      durationHours: 2,
      teamCount: 3,
      playersPerTeam: 5,
      pricePerSlot: 45000,
      filledSlots: 9,
      lockedSlots: 0,
    },
    {
      id: "event-sabtu-senayan",
      clubId: "club-senayan-united",
      title: "Saturday Night Mini Soccer 8v8 — Senayan",
      sportType: "mini_soccer",
      level: "competitive",
      venueName: "Lapangan Mini Soccer ABC Senayan",
      venueAddress: "Kompleks GBK Senayan, Tanah Abang, Jakarta Pusat",
      venueGeo: { lat: -6.2186, lng: 106.8026, geohash: "qqguuv" },
      bookingProofUrl: "https://storage.googleapis.com/demo-kickpro/bookings/senayan-abc-proof.jpg",
      daysAhead: 4,
      startHour: 20,
      startMinute: 0,
      durationHours: 2,
      teamCount: 2,
      playersPerTeam: 8,
      pricePerSlot: 85000,
      filledSlots: 13,
      lockedSlots: 1,
    },
  ];

  const samplePlayers = [
    { userId: "user-budi", name: "Budi Santoso", phone: "+6281210000001" },
    { userId: "user-andi", name: "Andi Wijaya", phone: "+6281210000004" },
    { userId: "user-dimas", name: "Dimas Pratama", phone: "+6281210000002" },
    { userId: "user-rizky", name: "Rizky Ramadhan", phone: "+6281210000003" },
    { userId: "user-fajar", name: "Fajar Nugroho", phone: "+6281210000005" },
  ];

  const pad2 = (n: number) => String(n).padStart(2, "0");
  const lockExpiryIso = new Date(now.getTime() + SLOT_LOCK_DURATION_MS).toISOString();

  for (const cfg of seedEventsConfig) {
    const eventStart = new Date(now.getTime() + cfg.daysAhead * 24 * 60 * 60 * 1000);
    eventStart.setHours(cfg.startHour, cfg.startMinute, 0, 0);
    const eventEnd = new Date(eventStart.getTime() + cfg.durationHours * 60 * 60 * 1000);
    const eventDateStr = eventStart.toISOString().slice(0, 10);
    const startTimeStr = `${pad2(cfg.startHour)}:${pad2(cfg.startMinute)}`;
    const endTimeStr = `${pad2((cfg.startHour + cfg.durationHours) % 24)}:${pad2(cfg.startMinute)}`;
    const totalSlots = calculateTotalSlots(cfg.teamCount, cfg.playersPerTeam);

    const eventDoc = EventDocSchema.parse({
      clubId: cfg.clubId,
      title: cfg.title,
      sportType: cfg.sportType,
      level: cfg.level,
      venueName: cfg.venueName,
      venueAddress: cfg.venueAddress,
      venueGeo: cfg.venueGeo,
      bookingProofUrl: cfg.bookingProofUrl,
      startAt: eventStart.toISOString(),
      endAt: eventEnd.toISOString(),
      eventDate: eventDateStr,
      startTime: startTimeStr,
      endTime: endTimeStr,
      teamCount: cfg.teamCount,
      playersPerTeam: cfg.playersPerTeam,
      totalSlots,
      pricePerSlot: cfg.pricePerSlot,
      platformFee: DEFAULT_PLATFORM_FEE_IDR,
      filledSlots: cfg.filledSlots,
      lockedSlots: cfg.lockedSlots,
      status: "open",
      cancellationPolicy: { refundUntilHours: 24 },
      createdAt: nowIso,
    });

    const eventRef = db.collection(COLLECTION_NAMES.events).doc(cfg.id);
    await eventRef.set({
      ...eventDoc,
      startAt: toTs(eventDoc.startAt),
      endAt: toTs(eventDoc.endAt),
      createdAt: toTs(eventDoc.createdAt),
    });

    const teamIds: string[] = [];
    for (let i = 0; i < cfg.teamCount; i++) {
      const teamId = `team-${i + 1}`;
      teamIds.push(teamId);
      const preset = DEFAULT_TEAM_PRESETS[i] ?? { name: `Tim ${i + 1}`, color: "#059669" };
      const teamDoc = EventTeamDocSchema.parse({
        name: preset.name,
        color: preset.color,
        index: i,
      });
      await eventRef.collection(COLLECTION_NAMES.teams).doc(teamId).set(teamDoc);
    }

    for (let slotNumber = 1; slotNumber <= totalSlots; slotNumber++) {
      const teamIndex = Math.floor((slotNumber - 1) / cfg.playersPerTeam);
      const teamId = teamIds[teamIndex] ?? "team-1";
      const positionIndex = (slotNumber - 1) % cfg.playersPerTeam;
      const position =
        positionIndex === 0
          ? "GK"
          : positionIndex <= 2
            ? "DF"
            : positionIndex <= 4
              ? "MF"
              : "FW";

      let rawSlot: Record<string, unknown> = {
        slotNumber,
        teamId,
        position,
        status: "available",
      };

      if (slotNumber <= cfg.filledSlots) {
        const player = samplePlayers[(slotNumber - 1) % samplePlayers.length]!;
        rawSlot = {
          ...rawSlot,
          status: "paid",
          userId: player.userId,
          playerName: player.name,
          playerPhone: player.phone,
          paymentId: `pay-${cfg.id}-${slotNumber}`,
          ticketCode: `KP-${cfg.id.slice(-3).toUpperCase()}-${String(slotNumber).padStart(3, "0")}`,
        };
      } else if (slotNumber <= cfg.filledSlots + cfg.lockedSlots) {
        rawSlot = {
          ...rawSlot,
          status: "locked",
          lockedByUserId: "user-fajar",
          lockExpiresAt: lockExpiryIso,
        };
      }

      const parsedSlot = EventSlotDocSchema.parse(rawSlot);
      await eventRef
        .collection(COLLECTION_NAMES.slots)
        .doc(`slot-${slotNumber}`)
        .set({
          ...parsedSlot,
          lockExpiresAt: toTs(parsedSlot.lockExpiresAt),
          checkedInAt: toTs(parsedSlot.checkedInAt),
        });
    }
  }

  // 4. Seed Sparring Match
  const sparringStart = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  sparringStart.setHours(20, 0, 0, 0);

  const sparringDoc = SparringMatchDocSchema.parse({
    hostClubId: "club-garuda-muda",
    sportType: "mini_soccer",
    format: "7v7",
    venueName: "Arena Mini Soccer Kemang",
    venueAddress: "Jl. Kemang Timur No. 45, Jakarta Selatan",
    venueGeo: { lat: -6.2712, lng: 106.8205, geohash: "qqguu1" },
    bookingProofUrl: "https://storage.googleapis.com/demo-kickpro/bookings/kemang-proof.jpg",
    matchDate: sparringStart.toISOString().slice(0, 10),
    matchTime: "20:00",
    startAt: sparringStart.toISOString(),
    totalFieldCost: 1200000,
    splitRatio: { host: 50, challenger: 50 },
    adminFee: DEFAULT_SPARRING_ADMIN_FEE_IDR,
    hasReferee: true,
    hasPhotographer: false,
    cancelDeadlineHours: 24,
    status: "open",
    createdAt: nowIso,
  });

  await db
    .collection(COLLECTION_NAMES.sparringMatches)
    .doc("sparring-kemang-1")
    .set({
      ...sparringDoc,
      startAt: toTs(sparringDoc.startAt),
      createdAt: toTs(sparringDoc.createdAt),
    });

  // Verifikasi baca kembali koleksi `events` memakai EventDocSchema (T-003)
  const eventsSnapshot = await db.collection(COLLECTION_NAMES.events).get();
  const validatedEvents = eventsSnapshot.docs.map((docSnap) => {
    const normalized = normalizeTimestamps(docSnap.data()) as Record<string, unknown>;
    return EventDocSchema.parse({ ...normalized, id: docSnap.id });
  });

  console.log(`Seed project "${projectId}" selesai! Ringkasan:`);
  console.log(`- Auth Emulator: ${authSeeded ? "5 akun terisi" : "dilewati (tidak aktif)"}`);
  console.log("- Firestore Users: 5 (user-budi, user-dimas, user-rizky, user-andi, user-fajar)");
  console.log("- Firestore Clubs: 2 (club-garuda-muda, club-senayan-united) + members & ledger");
  console.log(
    `- Firestore Events: ${validatedEvents.length} (${validatedEvents.map((e) => `${e.id}:${e.totalSlots}slot`).join(", ")})`,
  );
  console.log("- Firestore Sparring: 1 (sparring-kemang-1)");
}

async function main() {
  const projectIds = await resolveTargetProjects();
  for (const projectId of projectIds) {
    await seedProject(projectId);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed gagal:", err);
    process.exit(1);
  });
