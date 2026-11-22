import { z } from "zod";

export const PLAYER_POSITIONS = ["GK", "DF", "MF", "FW"] as const;
export const PlayerPositionSchema = z.enum(PLAYER_POSITIONS);
export type PlayerPosition = z.infer<typeof PlayerPositionSchema>;

export const PREFERRED_FEET = ["left", "right", "both"] as const;
export const PreferredFootSchema = z.enum(PREFERRED_FEET);
export type PreferredFoot = z.infer<typeof PreferredFootSchema>;

export const PLATFORM_ROLES = ["user", "superadmin"] as const;
export const PlatformRoleSchema = z.enum(PLATFORM_ROLES);
export type PlatformRole = z.infer<typeof PlatformRoleSchema>;

export const CLUB_ROLES = ["head_admin", "treasurer", "event_host", "member"] as const;
export const ClubRoleSchema = z.enum(CLUB_ROLES);
export type ClubRole = z.infer<typeof ClubRoleSchema>;

export const MEMBER_STATUSES = ["active", "invited", "suspended"] as const;
export const MemberStatusSchema = z.enum(MEMBER_STATUSES);
export type MemberStatus = z.infer<typeof MemberStatusSchema>;

export const JOIN_REQUEST_STATUSES = ["pending", "approved", "rejected"] as const;
export const JoinRequestStatusSchema = z.enum(JOIN_REQUEST_STATUSES);
export type JoinRequestStatus = z.infer<typeof JoinRequestStatusSchema>;

export const SPORT_TYPES = ["mini_soccer", "futsal", "football"] as const;
export const SportTypeSchema = z.enum(SPORT_TYPES);
export type SportType = z.infer<typeof SportTypeSchema>;

export const SKILL_LEVELS = ["beginner", "fun", "competitive"] as const;
export const SkillLevelSchema = z.enum(SKILL_LEVELS);
export type SkillLevel = z.infer<typeof SkillLevelSchema>;

export const SUBSCRIPTION_PLANS = ["free", "club_pass"] as const;
export const SubscriptionPlanSchema = z.enum(SUBSCRIPTION_PLANS);
export type SubscriptionPlan = z.infer<typeof SubscriptionPlanSchema>;

export const LEDGER_DIRECTIONS = ["in", "out"] as const;
export const LedgerDirectionSchema = z.enum(LEDGER_DIRECTIONS);
export type LedgerDirection = z.infer<typeof LedgerDirectionSchema>;

export const LEDGER_REF_TYPES = ["event", "sparring", "expense", "payout", "fee"] as const;
export const LedgerRefTypeSchema = z.enum(LEDGER_REF_TYPES);
export type LedgerRefType = z.infer<typeof LedgerRefTypeSchema>;

export const EXPENSE_CATEGORIES = [
  "bola",
  "rompi",
  "air_mineral",
  "wasit",
  "fotografer",
  "sewa_lapangan",
  "lainnya",
] as const;
export const ExpenseCategorySchema = z.enum(EXPENSE_CATEGORIES);
export type ExpenseCategory = z.infer<typeof ExpenseCategorySchema>;

export const PAYOUT_STATUSES = ["pending", "processing", "succeeded", "failed", "reversed"] as const;
export const PayoutStatusSchema = z.enum(PAYOUT_STATUSES);
export type PayoutStatus = z.infer<typeof PayoutStatusSchema>;

export const EVENT_STATUSES = ["draft", "open", "full", "completed", "cancelled"] as const;
export const EventStatusSchema = z.enum(EVENT_STATUSES);
export type EventStatus = z.infer<typeof EventStatusSchema>;

export const SLOT_STATUSES = ["available", "locked", "paid", "checked_in", "no_show"] as const;
export const SlotStatusSchema = z.enum(SLOT_STATUSES);
export type SlotStatus = z.infer<typeof SlotStatusSchema>;

export const PAYMENT_TYPES = ["slot", "sparring_deposit", "subscription"] as const;
export const PaymentTypeSchema = z.enum(PAYMENT_TYPES);
export type PaymentType = z.infer<typeof PaymentTypeSchema>;

export const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "expired",
  "refunded",
  "paid_orphan",
] as const;
export const PaymentStatusSchema = z.enum(PAYMENT_STATUSES);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

export const PAYMENT_METHODS = [
  "qris",
  "gopay",
  "ovo",
  "shopeepay",
  "va_bca",
  "va_mandiri",
  "va_bri",
  "va_bni",
] as const;
export const PaymentMethodSchema = z.enum(PAYMENT_METHODS);
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

export const SPARRING_FORMATS = ["7v7", "8v8", "11v11"] as const;
export const SparringFormatSchema = z.enum(SPARRING_FORMATS);
export type SparringFormat = z.infer<typeof SparringFormatSchema>;

export const SPARRING_STATUSES = [
  "open",
  "challenge_pending",
  "negotiating",
  "awaiting_deposit",
  "confirmed",
  "completed",
  "cancelled",
  "disputed",
] as const;
export const SparringStatusSchema = z.enum(SPARRING_STATUSES);
export type SparringStatus = z.infer<typeof SparringStatusSchema>;

export const CHALLENGE_STATUSES = ["pending", "accepted", "rejected"] as const;
export const ChallengeStatusSchema = z.enum(CHALLENGE_STATUSES);
export type ChallengeStatus = z.infer<typeof ChallengeStatusSchema>;
