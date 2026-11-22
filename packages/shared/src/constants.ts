/**
 * Konstanta bisnis dan konfigurasi platform KickPro.
 * Semua nominal uang disimpan sebagai integer rupiah (IDR).
 */

export const FIREBASE_DEFAULT_REGION = "asia-southeast2" as const;
export const DEFAULT_TIMEZONE = "Asia/Jakarta" as const;

export const SLOT_LOCK_DURATION_MINUTES = 10 as const;
export const SLOT_LOCK_DURATION_MS = SLOT_LOCK_DURATION_MINUTES * 60 * 1000;

export const PLATFORM_FEE_MIN_IDR = 2000 as const;
export const PLATFORM_FEE_MAX_IDR = 3000 as const;
export const DEFAULT_PLATFORM_FEE_IDR = 2500 as const;

export const SPARRING_ADMIN_FEE_MIN_IDR = 15000 as const;
export const SPARRING_ADMIN_FEE_MAX_IDR = 25000 as const;
export const DEFAULT_SPARRING_ADMIN_FEE_IDR = 20000 as const;

export const DEFAULT_SPARRING_CANCEL_DEADLINE_HOURS = 24 as const;
export const DEFAULT_REFUND_UNTIL_HOURS = 24 as const;
export const DEFAULT_ATTENDANCE_SCORE = 100 as const;
export const CLUB_PASS_MONTHLY_IDR = 99000 as const;

export const MAX_ACTIVE_LOCKS_PER_USER_PER_EVENT = 1 as const;
export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;

export interface TeamPreset {
  readonly name: string;
  readonly color: string;
}

export const DEFAULT_TEAM_PRESETS: readonly TeamPreset[] = [
  { name: "Tim Merah", color: "#EF4444" },
  { name: "Tim Biru", color: "#3B82F6" },
  { name: "Tim Hijau", color: "#10B981" },
  { name: "Tim Kuning", color: "#EAB308" },
  { name: "Tim Putih", color: "#F8FAFC" },
  { name: "Tim Hitam", color: "#1E293B" },
] as const;

export const COLLECTION_NAMES = {
  users: "users",
  clubs: "clubs",
  members: "members",
  joinRequests: "joinRequests",
  ledger: "ledger",
  payouts: "payouts",
  gallery: "gallery",
  events: "events",
  teams: "teams",
  slots: "slots",
  payments: "payments",
  sparringMatches: "sparring_matches",
  challenges: "challenges",
  proposals: "proposals",
  ratings: "ratings",
  notifications: "notifications",
  items: "items",
} as const;
