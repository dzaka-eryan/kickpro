import { readFileSync } from "node:fs";
import path from "node:path";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

const PROJECT_ID = "demo-kickpro";
const RULES_PATH = path.resolve(process.cwd(), "firestore.rules");

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync(RULES_PATH, "utf8"),
      host: "127.0.0.1",
      port: 8080,
    },
  });
});

afterAll(async () => {
  if (testEnv) {
    await testEnv.cleanup();
  }
});

beforeEach(async () => {
  await testEnv.clearFirestore();

  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    const now = Timestamp.now();

    await setDoc(doc(db, "users", "user-admin"), {
      name: "Budi Santoso",
      phoneNumber: "+6281210000001",
      city: "Jakarta Selatan",
      position: "MF",
      preferredFoot: "right",
      attendanceScore: 100,
      stats: { matchesPlayed: 5, minutesPlayed: 300, mvpCount: 1, noShowCount: 0 },
      platformRole: "user",
      createdAt: now,
    });

    await setDoc(doc(db, "users", "user-player"), {
      name: "Andi Wijaya",
      phoneNumber: "+6281210000004",
      city: "Jakarta Selatan",
      position: "GK",
      preferredFoot: "right",
      attendanceScore: 85,
      stats: { matchesPlayed: 2, minutesPlayed: 120, mvpCount: 0, noShowCount: 0 },
      platformRole: "user",
      createdAt: now,
    });

    await setDoc(doc(db, "clubs", "club-garuda"), {
      name: "Garuda Muda FC",
      slug: "garuda-muda-fc",
      city: "Jakarta Selatan",
      description: "Komunitas mini soccer Jakarta Selatan",
      vision: "Main fun dan sehat",
      sportTypes: ["mini_soccer"],
      level: "fun",
      walletBalance: 450000,
      escrowBalance: 0,
      totalMatchesPlayed: 12,
      fairPlayScore: 4.9,
      fairPlayCount: 10,
      subscription: { plan: "free", validUntil: null },
      createdAt: now,
    });

    await setDoc(doc(db, "clubs", "club-garuda", "members", "user-admin"), {
      userId: "user-admin",
      role: "head_admin",
      status: "active",
      joinedAt: now,
    });

    await setDoc(doc(db, "clubs", "club-garuda", "members", "user-treasurer"), {
      userId: "user-treasurer",
      role: "treasurer",
      status: "active",
      joinedAt: now,
    });

    await setDoc(doc(db, "clubs", "club-garuda", "members", "user-player"), {
      userId: "user-player",
      role: "member",
      status: "active",
      joinedAt: now,
    });

    await setDoc(doc(db, "clubs", "club-garuda", "ledger", "entry-1"), {
      type: "event_income",
      direction: "in",
      amount: 65000,
      balanceAfter: 450000,
      refType: "event",
      refId: "event-1",
      note: "Iuran slot #1",
      createdBy: "system",
      createdAt: now,
    });

    await setDoc(doc(db, "events", "event-1"), {
      clubId: "club-garuda",
      title: "Mabar Jumat Malam",
      sportType: "mini_soccer",
      level: "fun",
      venueName: "Pancoran Soccer Field",
      venueAddress: "Jl. Gatot Subroto, Jakarta",
      venueGeo: { lat: -6.2442, lng: 106.8427, geohash: "qqguv5" },
      startAt: now,
      endAt: now,
      eventDate: "2026-11-20",
      startTime: "19:00",
      endTime: "21:00",
      teamCount: 2,
      playersPerTeam: 7,
      totalSlots: 14,
      pricePerSlot: 65000,
      platformFee: 2500,
      filledSlots: 1,
      lockedSlots: 0,
      status: "open",
      createdAt: now,
    });

    await setDoc(doc(db, "events", "event-1", "slots", "slot-1"), {
      slotNumber: 1,
      teamId: "team-1",
      position: "MF",
      status: "available",
      lockedByUserId: null,
      lockExpiresAt: null,
      userId: null,
      playerName: null,
      playerPhone: null,
      paymentId: null,
      ticketCode: null,
      checkedInAt: null,
    });

    await setDoc(doc(db, "payments", "pay-1"), {
      type: "slot",
      userId: "user-player",
      clubId: "club-garuda",
      refPath: "events/event-1/slots/slot-1",
      amount: 65000,
      platformFee: 2500,
      grossAmount: 67500,
      pgProvider: "mock",
      pgInvoiceId: "inv-1",
      pgStatus: "PENDING",
      status: "pending",
      idempotencyKey: "event-1_slot-1_user-player",
      createdAt: now,
    });
  });
});

describe("KickPro Firestore Security Rules (T-005)", () => {
  it("denies reads and writes to unknown collections by default", async () => {
    const authed = testEnv.authenticatedContext("user-player").firestore();
    await assertFails(getDoc(doc(authed, "secret_admin_notes", "doc-1")));
    await assertFails(setDoc(doc(authed, "secret_admin_notes", "doc-1"), { hello: "world" }));
  });

  it("prevents regular users and head_admin from modifying club walletBalance or escrowBalance", async () => {
    const playerDb = testEnv.authenticatedContext("user-player").firestore();
    const adminDb = testEnv.authenticatedContext("user-admin").firestore();

    await assertFails(
      updateDoc(doc(playerDb, "clubs", "club-garuda"), { walletBalance: 99999999 }),
    );
    await assertFails(
      updateDoc(doc(adminDb, "clubs", "club-garuda"), { walletBalance: 99999999 }),
    );
    await assertFails(
      updateDoc(doc(adminDb, "clubs", "club-garuda"), { escrowBalance: 500000 }),
    );
  });

  it("allows head_admin to update non-financial club profile, but denies member or treasurer", async () => {
    const adminDb = testEnv.authenticatedContext("user-admin").firestore();
    const treasurerDb = testEnv.authenticatedContext("user-treasurer").firestore();
    const playerDb = testEnv.authenticatedContext("user-player").firestore();

    await assertSucceeds(
      updateDoc(doc(adminDb, "clubs", "club-garuda"), {
        description: "Komunitas mabar rutin setiap Jumat malam",
      }),
    );

    await assertFails(
      updateDoc(doc(treasurerDb, "clubs", "club-garuda"), {
        description: "Diubah bendahara",
      }),
    );

    await assertFails(
      updateDoc(doc(playerDb, "clubs", "club-garuda"), {
        description: "Diubah member",
      }),
    );
  });

  it("denies any client write to slots.status (must go through Admin SDK)", async () => {
    const playerDb = testEnv.authenticatedContext("user-player").firestore();
    const adminDb = testEnv.authenticatedContext("user-admin").firestore();

    await assertFails(
      updateDoc(doc(playerDb, "events", "event-1", "slots", "slot-1"), {
        status: "paid",
        userId: "user-player",
      }),
    );

    await assertFails(
      updateDoc(doc(adminDb, "events", "event-1", "slots", "slot-1"), {
        status: "locked",
        lockedByUserId: "user-admin",
      }),
    );

    await assertFails(
      setDoc(doc(playerDb, "events", "event-1", "slots", "slot-99"), {
        slotNumber: 99,
        teamId: "team-1",
        status: "available",
      }),
    );
  });

  it("enforces ledger immutability and restricts reads to active club members", async () => {
    const memberDb = testEnv.authenticatedContext("user-player").firestore();
    const outsiderDb = testEnv.authenticatedContext("user-outsider").firestore();

    await assertSucceeds(getDoc(doc(memberDb, "clubs", "club-garuda", "ledger", "entry-1")));
    await assertFails(getDoc(doc(outsiderDb, "clubs", "club-garuda", "ledger", "entry-1")));

    await assertFails(
      setDoc(doc(collection(memberDb, "clubs", "club-garuda", "ledger")), {
        direction: "in",
        amount: 100000,
      }),
    );
  });

  it("allows users to create and update their own profile, but blocks tampering with stats/attendanceScore/platformRole", async () => {
    const newUserDb = testEnv.authenticatedContext("user-new").firestore();
    const playerDb = testEnv.authenticatedContext("user-player").firestore();

    await assertSucceeds(
      setDoc(doc(newUserDb, "users", "user-new"), {
        name: "Fajar Nugroho",
        phoneNumber: "+6281210000005",
        city: "Bandung",
        position: "FW",
        preferredFoot: "left",
        attendanceScore: 100,
        platformRole: "user",
        createdAt: Timestamp.now(),
      }),
    );

    await assertSucceeds(
      updateDoc(doc(playerDb, "users", "user-player"), {
        city: "Depok",
        favoriteNumber: 1,
      }),
    );

    await assertFails(
      updateDoc(doc(playerDb, "users", "user-player"), {
        attendanceScore: 100,
      }),
    );

    await assertFails(
      updateDoc(doc(playerDb, "users", "user-player"), {
        platformRole: "superadmin",
      }),
    );

    await assertFails(
      updateDoc(doc(playerDb, "users", "user-player"), {
        "stats.mvpCount": 99,
      }),
    );
  });

  it("restricts payment reads to payment owner and blocks all client writes", async () => {
    const ownerDb = testEnv.authenticatedContext("user-player").firestore();
    const otherDb = testEnv.authenticatedContext("user-admin").firestore();

    await assertSucceeds(getDoc(doc(ownerDb, "payments", "pay-1")));
    await assertFails(getDoc(doc(otherDb, "payments", "pay-1")));
    await assertFails(updateDoc(doc(ownerDb, "payments", "pay-1"), { status: "paid" }));
  });
});
