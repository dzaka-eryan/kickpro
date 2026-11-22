import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import type { EventStatus, SlotStatus, SparringStatus } from "@kickpro/shared";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border bg-card text-foreground",
        available: "border-emerald-200 bg-emerald-50 text-emerald-800",
        locked: "border-amber-300 bg-amber-50 text-amber-900",
        paid: "border-blue-200 bg-blue-50 text-blue-800",
        checkedIn: "border-transparent bg-emerald-700 text-white",
        danger: "border-rose-200 bg-rose-50 text-rose-800",
        lime: "border-lime-400 bg-accent text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

const SLOT_STATUS_CONFIG: Record<
  SlotStatus,
  { label: string; variant: BadgeProps["variant"] }
> = {
  available: { label: "Tersedia", variant: "available" },
  locked: { label: "Terkunci (10m)", variant: "locked" },
  paid: { label: "Terisi", variant: "paid" },
  checked_in: { label: "Hadir", variant: "checkedIn" },
  no_show: { label: "No-Show", variant: "danger" },
};

export function SlotStatusBadge({ status }: { status: SlotStatus }) {
  const cfg = SLOT_STATUS_CONFIG[status];
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

const EVENT_STATUS_CONFIG: Record<
  EventStatus,
  { label: string; variant: BadgeProps["variant"] }
> = {
  draft: { label: "Draft", variant: "secondary" },
  open: { label: "Terbuka", variant: "available" },
  full: { label: "Penuh", variant: "locked" },
  completed: { label: "Selesai", variant: "paid" },
  cancelled: { label: "Dibatalkan", variant: "danger" },
};

export function EventStatusBadge({ status }: { status: EventStatus }) {
  const cfg = EVENT_STATUS_CONFIG[status];
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

const SPARRING_STATUS_CONFIG: Record<
  SparringStatus,
  { label: string; variant: BadgeProps["variant"] }
> = {
  open: { label: "Cari Lawan", variant: "available" },
  challenge_pending: { label: "Ada Tantangan", variant: "locked" },
  negotiating: { label: "Negosiasi Jadwal", variant: "paid" },
  awaiting_deposit: { label: "Menunggu Deposit", variant: "locked" },
  confirmed: { label: "Confirmed", variant: "checkedIn" },
  completed: { label: "Selesai", variant: "secondary" },
  cancelled: { label: "Dibatalkan", variant: "danger" },
  disputed: { label: "Dispute", variant: "danger" },
};

export function SparringStatusBadge({ status }: { status: SparringStatus }) {
  const cfg = SPARRING_STATUS_CONFIG[status];
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

export { Badge, badgeVariants };
