import { z } from "zod";
import {
  DEFAULT_ATTENDANCE_SCORE,
  DEFAULT_PLATFORM_FEE_IDR,
  DEFAULT_REFUND_UNTIL_HOURS,
  DEFAULT_SPARRING_ADMIN_FEE_IDR,
  DEFAULT_SPARRING_CANCEL_DEADLINE_HOURS,
} from "./constants";
import {
  ChallengeStatusSchema,
  ClubRoleSchema,
  EventStatusSchema,
  ExpenseCategorySchema,
  JoinRequestStatusSchema,
  LedgerDirectionSchema,
  LedgerRefTypeSchema,
  MemberStatusSchema,
  PaymentMethodSchema,
  PaymentStatusSchema,
  PaymentTypeSchema,
  PayoutStatusSchema,
  PlatformRoleSchema,
  PlayerPositionSchema,
  PreferredFootSchema,
  SkillLevelSchema,
  SlotStatusSchema,
  SparringFormatSchema,
  SparringStatusSchema,
  SportTypeSchema,
  SubscriptionPlanSchema,
} from "./enums";

/**
 * Timestamp ISO-8601 string (e.g. "2026-11-20T19:00:00.000Z" atau "+07:00").
 * Saat disimpan di Firestore dikonversi ke Firestore Timestamp oleh converter.
 */
export const IsoTimestampSchema = z.string().datetime({ offset: true });

export const IntegerRupiahSchema = z.number().int().nonnegative();

export const GeoPointDataSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  geohash: z.string().min(4).max(12),
});
export type GeoPointData = z.infer<typeof GeoPointDataSchema>;

// =============================================================================
// users/{userId}
// =============================================================================
export const UserStatsSchema = z.object({
  matchesPlayed: z.number().int().nonnegative().default(0),
  minutesPlayed: z.number().int().nonnegative().default(0),
  mvpCount: z.number().int().nonnegative().default(0),
  noShowCount: z.number().int().nonnegative().default(0),
});
export type UserStats = z.infer<typeof UserStatsSchema>;

export const UserDocSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(2).max(80),
  phoneNumber: z.string().regex(/^\+62[0-9]{8,13}$/, "Nomor HP harus format E.164 +62"),
  photoUrl: z.string().url().nullable().default(null),
  city: z.string().min(2).max(80),
  geo: GeoPointDataSchema.nullable().default(null),
  position: PlayerPositionSchema,
  preferredFoot: PreferredFootSchema,
  favoriteNumber: z.number().int().min(1).max(99).nullable().default(null),
  attendanceScore: z.number().int().min(0).max(100).default(DEFAULT_ATTENDANCE_SCORE),
  stats: UserStatsSchema.default({
    matchesPlayed: 0,
    minutesPlayed: 0,
    mvpCount: 0,
    noShowCount: 0,
  }),
  platformRole: PlatformRoleSchema.default("user"),
  fcmTokens: z.array(z.string()).default([]),
  createdAt: IsoTimestampSchema,
});
export type UserDoc = z.infer<typeof UserDocSchema>;

// =============================================================================
// clubs/{clubId} & subcollections
// =============================================================================
export const ClubSubscriptionSchema = z.object({
  plan: SubscriptionPlanSchema.default("free"),
  validUntil: IsoTimestampSchema.nullable().default(null),
});
export type ClubSubscription = z.infer<typeof ClubSubscriptionSchema>;

export const ClubDocSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(3).max(80),
  slug: z
    .string()
    .min(3)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan tanda hubung"),
  logoUrl: z.string().url().nullable().default(null),
  city: z.string().min(2).max(80),
  geo: GeoPointDataSchema.nullable().default(null),
  description: z.string().max(1000).default(""),
  vision: z.string().max(500).default(""),
  sportTypes: z.array(SportTypeSchema).min(1),
  level: SkillLevelSchema.default("fun"),
  avgAge: z.number().int().min(12).max(70).nullable().default(null),
  walletBalance: z.number().int().nonnegative().default(0),
  escrowBalance: z.number().int().nonnegative().default(0),
  totalMatchesPlayed: z.number().int().nonnegative().default(0),
  fairPlayScore: z.number().min(1).max(5).default(5),
  fairPlayCount: z.number().int().nonnegative().default(0),
  subscription: ClubSubscriptionSchema.default({
    plan: "free",
    validUntil: null,
  }),
  pgSubAccountId: z.string().nullable().default(null),
  createdAt: IsoTimestampSchema,
});
export type ClubDoc = z.infer<typeof ClubDocSchema>;

export const ClubMemberDocSchema = z.object({
  id: z.string().min(1).optional(),
  userId: z.string().min(1),
  role: ClubRoleSchema,
  status: MemberStatusSchema.default("active"),
  joinedAt: IsoTimestampSchema,
});
export type ClubMemberDoc = z.infer<typeof ClubMemberDocSchema>;

export const JoinRequestDocSchema = z.object({
  id: z.string().min(1).optional(),
  userId: z.string().min(1),
  message: z.string().max(300).default(""),
  status: JoinRequestStatusSchema.default("pending"),
  createdAt: IsoTimestampSchema,
});
export type JoinRequestDoc = z.infer<typeof JoinRequestDocSchema>;

export const LedgerEntryDocSchema = z.object({
  id: z.string().min(1).optional(),
  type: z.string().min(1).max(60),
  category: ExpenseCategorySchema.nullable().default(null),
  direction: LedgerDirectionSchema,
  amount: z.number().int().positive(),
  balanceAfter: z.number().int().nonnegative(),
  refType: LedgerRefTypeSchema,
  refId: z.string().min(1),
  note: z.string().max(300).default(""),
  attachmentUrl: z.string().url().nullable().default(null),
  createdBy: z.string().min(1),
  createdAt: IsoTimestampSchema,
});
export type LedgerEntryDoc = z.infer<typeof LedgerEntryDocSchema>;

export const PayoutDocSchema = z.object({
  id: z.string().min(1).optional(),
  amount: z.number().int().positive(),
  bankCode: z.string().min(2).max(20),
  accountNumber: z.string().min(6).max(30),
  accountHolderName: z.string().min(2).max(100),
  status: PayoutStatusSchema.default("pending"),
  pgPayoutId: z.string().nullable().default(null),
  requestedBy: z.string().min(1),
  createdAt: IsoTimestampSchema,
});
export type PayoutDoc = z.infer<typeof PayoutDocSchema>;

export const GalleryPhotoDocSchema = z.object({
  id: z.string().min(1).optional(),
  imageUrl: z.string().url(),
  caption: z.string().max(200).default(""),
  uploadedBy: z.string().min(1),
  createdAt: IsoTimestampSchema,
});
export type GalleryPhotoDoc = z.infer<typeof GalleryPhotoDocSchema>;

// =============================================================================
// events/{eventId}, teams/{teamId}, slots/{slotId}
// =============================================================================
export const CancellationPolicySchema = z.object({
  refundUntilHours: z.number().int().nonnegative().default(DEFAULT_REFUND_UNTIL_HOURS),
});
export type CancellationPolicy = z.infer<typeof CancellationPolicySchema>;

export const EventDocSchema = z.object({
  id: z.string().min(1).optional(),
  clubId: z.string().min(1),
  title: z.string().min(5).max(120),
  sportType: SportTypeSchema,
  level: SkillLevelSchema.default("fun"),
  venueName: z.string().min(3).max(120),
  venueAddress: z.string().min(5).max(240),
  venueGeo: GeoPointDataSchema,
  bookingProofUrl: z.string().url().nullable().default(null),
  startAt: IsoTimestampSchema,
  endAt: IsoTimestampSchema,
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal YYYY-MM-DD"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Format jam HH:mm"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Format jam HH:mm"),
  teamCount: z.number().int().min(2).max(8),
  playersPerTeam: z.number().int().min(4).max(15),
  totalSlots: z.number().int().positive(),
  pricePerSlot: IntegerRupiahSchema,
  platformFee: IntegerRupiahSchema.default(DEFAULT_PLATFORM_FEE_IDR),
  filledSlots: z.number().int().nonnegative().default(0),
  lockedSlots: z.number().int().nonnegative().default(0),
  status: EventStatusSchema.default("open"),
  cancellationPolicy: CancellationPolicySchema.default({
    refundUntilHours: DEFAULT_REFUND_UNTIL_HOURS,
  }),
  createdAt: IsoTimestampSchema,
});
export type EventDoc = z.infer<typeof EventDocSchema>;

export const EventTeamDocSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(2).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Warna harus format hex #RRGGBB"),
  index: z.number().int().nonnegative(),
});
export type EventTeamDoc = z.infer<typeof EventTeamDocSchema>;

export const EventSlotDocSchema = z.object({
  id: z.string().min(1).optional(),
  slotNumber: z.number().int().positive(),
  teamId: z.string().min(1),
  position: PlayerPositionSchema.nullable().default(null),
  status: SlotStatusSchema.default("available"),
  lockedByUserId: z.string().nullable().default(null),
  lockExpiresAt: IsoTimestampSchema.nullable().default(null),
  userId: z.string().nullable().default(null),
  playerName: z.string().nullable().default(null),
  playerPhone: z.string().nullable().default(null),
  paymentId: z.string().nullable().default(null),
  ticketCode: z.string().nullable().default(null),
  checkedInAt: IsoTimestampSchema.nullable().default(null),
});
export type EventSlotDoc = z.infer<typeof EventSlotDocSchema>;

// =============================================================================
// payments/{paymentId}
// =============================================================================
export const PaymentDocSchema = z.object({
  id: z.string().min(1).optional(),
  type: PaymentTypeSchema,
  userId: z.string().min(1),
  clubId: z.string().min(1),
  refPath: z.string().min(1),
  amount: IntegerRupiahSchema,
  platformFee: IntegerRupiahSchema,
  grossAmount: IntegerRupiahSchema,
  pgProvider: z.string().min(1),
  pgInvoiceId: z.string().min(1),
  pgStatus: z.string().min(1),
  method: PaymentMethodSchema.nullable().default(null),
  status: PaymentStatusSchema.default("pending"),
  idempotencyKey: z.string().min(5),
  paidAt: IsoTimestampSchema.nullable().default(null),
  createdAt: IsoTimestampSchema,
});
export type PaymentDoc = z.infer<typeof PaymentDocSchema>;

// =============================================================================
// sparring_matches/{matchId} & subcollections
// =============================================================================
export const SplitRatioSchema = z
  .object({
    host: z.number().int().min(0).max(100),
    challenger: z.number().int().min(0).max(100),
  })
  .refine((val) => val.host + val.challenger === 100, {
    message: "Total rasio patungan host + challenger harus 100%",
  });
export type SplitRatio = z.infer<typeof SplitRatioSchema>;

export const SparringResultSchema = z.object({
  hostScore: z.number().int().nonnegative().nullable().default(null),
  challengerScore: z.number().int().nonnegative().nullable().default(null),
  confirmedByHost: z.boolean().default(false),
  confirmedByChallenger: z.boolean().default(false),
});
export type SparringResult = z.infer<typeof SparringResultSchema>;

export const SparringMatchDocSchema = z.object({
  id: z.string().min(1).optional(),
  hostClubId: z.string().min(1),
  challengerClubId: z.string().nullable().default(null),
  sportType: SportTypeSchema,
  format: SparringFormatSchema,
  venueName: z.string().min(3).max(120),
  venueAddress: z.string().min(5).max(240),
  venueGeo: GeoPointDataSchema.nullable().default(null),
  bookingProofUrl: z.string().url().nullable().default(null),
  matchDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  matchTime: z.string().regex(/^\d{2}:\d{2}$/),
  startAt: IsoTimestampSchema,
  totalFieldCost: IntegerRupiahSchema,
  splitRatio: SplitRatioSchema.default({ host: 50, challenger: 50 }),
  adminFee: IntegerRupiahSchema.default(DEFAULT_SPARRING_ADMIN_FEE_IDR),
  hasReferee: z.boolean().default(false),
  hasPhotographer: z.boolean().default(false),
  cancelDeadlineHours: z.number().int().positive().default(DEFAULT_SPARRING_CANCEL_DEADLINE_HOURS),
  hostDepositPaid: z.boolean().default(false),
  challengerDepositPaid: z.boolean().default(false),
  status: SparringStatusSchema.default("open"),
  result: SparringResultSchema.default({
    hostScore: null,
    challengerScore: null,
    confirmedByHost: false,
    confirmedByChallenger: false,
  }),
  createdAt: IsoTimestampSchema,
});
export type SparringMatchDoc = z.infer<typeof SparringMatchDocSchema>;

export const SparringChallengeDocSchema = z.object({
  id: z.string().min(1).optional(),
  clubId: z.string().min(1),
  message: z.string().max(400).default(""),
  status: ChallengeStatusSchema.default("pending"),
  createdAt: IsoTimestampSchema,
});
export type SparringChallengeDoc = z.infer<typeof SparringChallengeDocSchema>;

export const SparringProposalOptionSchema = z.object({
  venue: z.string().min(2).max(150),
  startAt: IsoTimestampSchema,
  geo: GeoPointDataSchema.nullable().default(null),
});
export type SparringProposalOption = z.infer<typeof SparringProposalOptionSchema>;

export const SparringProposalDocSchema = z.object({
  id: z.string().min(1).optional(),
  clubId: z.string().min(1),
  options: z.array(SparringProposalOptionSchema).min(1).max(10),
  createdAt: IsoTimestampSchema,
});
export type SparringProposalDoc = z.infer<typeof SparringProposalDocSchema>;

export const SparringRatingDocSchema = z.object({
  id: z.string().min(1).optional(),
  clubId: z.string().min(1),
  fairPlay: z.number().int().min(1).max(5),
  comment: z.string().max(500).default(""),
  createdAt: IsoTimestampSchema,
});
export type SparringRatingDoc = z.infer<typeof SparringRatingDocSchema>;

// =============================================================================
// notifications/{userId}/items/{id}
// =============================================================================
export const NotificationItemDocSchema = z.object({
  id: z.string().min(1).optional(),
  type: z.string().min(1).max(60),
  title: z.string().min(1).max(120),
  body: z.string().min(1).max(400),
  linkUrl: z.string().nullable().default(null),
  isRead: z.boolean().default(false),
  readAt: IsoTimestampSchema.nullable().default(null),
  createdAt: IsoTimestampSchema,
});
export type NotificationItemDoc = z.infer<typeof NotificationItemDocSchema>;

// =============================================================================
// Helper utilitas bersama
// =============================================================================

/**
 * Format angka integer rupiah menjadi tampilan IDR (contoh: Rp65.000).
 */
export function formatRupiah(amount: number): string {
  const safeAmount = Math.trunc(amount);
  const formatted = new Intl.NumberFormat("id-ID").format(safeAmount);
  return `Rp${formatted}`;
}

/**
 * Normalisasi nomor HP Indonesia menjadi format E.164 (+62...).
 * Contoh: "0812-3456-7890" -> "+6281234567890"
 */
export function normalizeIndoPhone(rawPhone: string): string {
  const digitsOnly = rawPhone.replace(/[^\d+]/g, "");
  if (digitsOnly.startsWith("+62")) {
    return digitsOnly;
  }
  if (digitsOnly.startsWith("62")) {
    return `+${digitsOnly}`;
  }
  if (digitsOnly.startsWith("0")) {
    return `+62${digitsOnly.slice(1)}`;
  }
  return `+62${digitsOnly}`;
}

/**
 * Hitung total slot otomatis dari jumlah tim × pemain per tim.
 */
export function calculateTotalSlots(teamCount: number, playersPerTeam: number): number {
  if (!Number.isInteger(teamCount) || !Number.isInteger(playersPerTeam)) {
    throw new Error("Jumlah tim dan pemain per tim harus bilangan bulat");
  }
  if (teamCount <= 0 || playersPerTeam <= 0) {
    throw new Error("Jumlah tim dan pemain per tim harus lebih besar dari 0");
  }
  return teamCount * playersPerTeam;
}
