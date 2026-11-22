import { describe, expect, it } from "vitest";
import { adminConverters, clientConverters } from "../converters";

function makeFakeTimestamp(iso: string) {
  const date = new Date(iso);
  return {
    toDate: () => date,
  };
}

describe("Firebase typed converters (T-003)", () => {
  const rawEventDoc = {
    clubId: "club-garuda-muda",
    title: "Mabar Fun Mini Soccer Jumat Malam",
    sportType: "mini_soccer",
    level: "fun",
    venueName: "Pancoran Soccer Field",
    venueAddress: "Jl. Gatot Subroto Kav. 72, Jakarta Selatan",
    venueGeo: { lat: -6.2442, lng: 106.8427, geohash: "qqguv5" },
    bookingProofUrl: null,
    startAt: makeFakeTimestamp("2026-11-20T12:00:00.000Z"),
    endAt: makeFakeTimestamp("2026-11-20T14:00:00.000Z"),
    eventDate: "2026-11-20",
    startTime: "19:00",
    endTime: "21:00",
    teamCount: 2,
    playersPerTeam: 7,
    totalSlots: 14,
    pricePerSlot: 65000,
    platformFee: 2500,
    filledSlots: 2,
    lockedSlots: 1,
    status: "open",
    cancellationPolicy: { refundUntilHours: 24 },
    createdAt: makeFakeTimestamp("2026-11-15T10:00:00.000Z"),
  };

  it("converts Firestore Timestamp fields into typed EventDoc via clientConverters.event", () => {
    const fakeSnapshot = {
      id: "event-jumat-malam",
      data: () => rawEventDoc,
    } as unknown as Parameters<typeof clientConverters.event.fromFirestore>[0];

    const parsed = clientConverters.event.fromFirestore(fakeSnapshot, {});
    expect(parsed.id).toBe("event-jumat-malam");
    expect(parsed.startAt).toBe("2026-11-20T12:00:00.000Z");
    expect(parsed.pricePerSlot).toBe(65000);
    expect(parsed.status).toBe("open");
  });

  it("converts Firestore Timestamp fields into typed EventDoc via adminConverters.event", () => {
    const fakeAdminSnapshot = {
      id: "event-jumat-malam",
      data: () => rawEventDoc,
    } as unknown as Parameters<typeof adminConverters.event.fromFirestore>[0];

    const parsed = adminConverters.event.fromFirestore(fakeAdminSnapshot);
    expect(parsed.id).toBe("event-jumat-malam");
    expect(parsed.endAt).toBe("2026-11-20T14:00:00.000Z");
    expect(parsed.totalSlots).toBe(14);
  });
});
