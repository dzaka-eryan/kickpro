import { describe, expect, it } from "vitest";
import {
  calculateTotalSlots,
  DEFAULT_PLATFORM_FEE_IDR,
  EventDocSchema,
  EventSlotDocSchema,
  FIREBASE_DEFAULT_REGION,
  formatRupiah,
  normalizeIndoPhone,
  SLOT_LOCK_DURATION_MINUTES,
  SplitRatioSchema,
  UserDocSchema,
} from "../index";

describe("@kickpro/shared constants and helpers", () => {
  it("exposes expected region, lock duration, and fee defaults", () => {
    expect(FIREBASE_DEFAULT_REGION).toBe("asia-southeast2");
    expect(SLOT_LOCK_DURATION_MINUTES).toBe(10);
    expect(DEFAULT_PLATFORM_FEE_IDR).toBe(2500);
  });

  it("formats rupiah without decimals", () => {
    expect(formatRupiah(65000)).toBe("Rp65.000");
    expect(formatRupiah(2500)).toBe("Rp2.500");
  });

  it("normalizes Indonesian phone numbers to E.164", () => {
    expect(normalizeIndoPhone("0812-3456-7890")).toBe("+6281234567890");
    expect(normalizeIndoPhone("6281234567890")).toBe("+6281234567890");
    expect(normalizeIndoPhone("+6281234567890")).toBe("+6281234567890");
  });

  it("calculates total slots from team count and players per team", () => {
    expect(calculateTotalSlots(4, 7)).toBe(28);
    expect(() => calculateTotalSlots(0, 7)).toThrow();
  });
});

describe("@kickpro/shared Zod schemas", () => {
  it("validates a valid UserDoc", () => {
    const parsed = UserDocSchema.parse({
      name: "Budi Santoso",
      phoneNumber: "+6281210000001",
      city: "Jakarta Selatan",
      position: "MF",
      preferredFoot: "right",
      favoriteNumber: 8,
      createdAt: "2026-11-15T10:00:00.000Z",
    });

    expect(parsed.attendanceScore).toBe(100);
    expect(parsed.platformRole).toBe("user");
    expect(parsed.stats.matchesPlayed).toBe(0);
  });

  it("rejects non-integer rupiah in EventDoc", () => {
    expect(() =>
      EventDocSchema.parse({
        clubId: "club-1",
        title: "Mabar Mini Soccer",
        sportType: "mini_soccer",
        level: "fun",
        venueName: "Pancoran Soccer Field",
        venueAddress: "Jl. Gatot Subroto Kav. 72, Jakarta",
        venueGeo: { lat: -6.2442, lng: 106.8427, geohash: "qqguv5" },
        startAt: "2026-11-20T12:00:00.000Z",
        endAt: "2026-11-20T14:00:00.000Z",
        eventDate: "2026-11-20",
        startTime: "19:00",
        endTime: "21:00",
        teamCount: 2,
        playersPerTeam: 7,
        totalSlots: 14,
        pricePerSlot: 65000.5,
        createdAt: "2026-11-15T10:00:00.000Z",
      }),
    ).toThrow();
  });

  it("validates SplitRatio sum equals 100", () => {
    expect(SplitRatioSchema.parse({ host: 60, challenger: 40 })).toEqual({
      host: 60,
      challenger: 40,
    });
    expect(() => SplitRatioSchema.parse({ host: 60, challenger: 50 })).toThrow();
  });

  it("validates EventSlotDoc defaults", () => {
    const slot = EventSlotDocSchema.parse({
      slotNumber: 1,
      teamId: "team-1",
    });
    expect(slot.status).toBe("available");
    expect(slot.lockedByUserId).toBeNull();
  });
});
