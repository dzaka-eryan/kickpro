"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  Check,
  CirclePlus,
  Clock3,
  Goal,
  Link2,
  LockKeyhole,
  MapPin,
  MessageCircle,
  QrCode,
  Share2,
  ShieldCheck,
  Sparkles,
  TicketCheck,
  Timer,
  UserRound,
  Users,
  Webhook,
  X,
} from "lucide-react";
import { formatRupiah } from "@kickpro/shared";
import {
  decodeScheduleFromSearchParams,
  eventDocToCommunityEvent,
  formatDateIndo,
  getCustomCommunityEventBySlug,
  saveCustomCommunityEvent,
  type CommunityEvent,
  type CommunitySlot,
} from "@/data/communities";
import { fetchEventWithSlotsClient } from "@/lib/firebase/client";
import { useToast } from "@/components/ui/toast";

export function CommunityInvitationClient({
  initialCommunity,
}: {
  initialCommunity: CommunityEvent;
}) {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [community, setCommunity] = React.useState<CommunityEvent>(initialCommunity);
  const [slots, setSlots] = React.useState<CommunitySlot[]>(initialCommunity.slots);
  const [selectedSlot, setSelectedSlot] = React.useState<number | null>(null);

  React.useEffect(() => {
    // 1. Cek apakah sudah tersimpan di localStorage (termasuk migrasi dari data klub)
    const customEvent = getCustomCommunityEventBySlug(initialCommunity.slug);
    if (customEvent) {
      setCommunity(customEvent);
      setSlots(customEvent.slots);
      return;
    }

    // 2. Cek apakah URL memiliki query parameter jadwal (backward-compatibility)
    const decodedFromUrl = decodeScheduleFromSearchParams(initialCommunity.slug, searchParams);
    if (decodedFromUrl) {
      saveCustomCommunityEvent(decodedFromUrl);
      setCommunity(decodedFromUrl);
      setSlots(decodedFromUrl.slots);
      return;
    }

    // 3. Cek dari API server store (.custom-events.json) atau Firestore Emulator
    let active = true;
    fetch(`/api/custom-events?slug=${encodeURIComponent(initialCommunity.slug)}`)
      .then((r) => (r.ok ? (r.json() as Promise<{ event: CommunityEvent | null }>) : null))
      .then((data) => {
        if (!active) return;
        if (data?.event) {
          saveCustomCommunityEvent(data.event);
          setCommunity(data.event);
          setSlots(data.event.slots);
          return;
        }
        return fetchEventWithSlotsClient(initialCommunity.slug).then((res) => {
          if (!active || !res) return;
          const mapped = eventDocToCommunityEvent(res.event, res.slots);
          setCommunity(mapped);
          setSlots(mapped.slots);
        });
      })
      .catch(() => {
        // Fallback to initial seed community when emulator is offline
      });
    return () => {
      active = false;
    };
  }, [initialCommunity.slug, searchParams]);

  const [checkoutOpen, setCheckoutOpen] = React.useState(false);
  const [checkoutStep, setCheckoutStep] = React.useState<"form" | "qris" | "success">("form");
  const [playerName, setPlayerName] = React.useState("");
  const [playerPhone, setPlayerPhone] = React.useState("");
  const [secondsLeft, setSecondsLeft] = React.useState(600);
  const [isVerifyingPayment, setIsVerifyingPayment] = React.useState(false);

  const availableSlotsCount = slots.filter((s) => s.status === "available").length;
  const paidSlotsCount = slots.filter((s) => s.status === "paid").length;
  const displaySlug = `kickpro.id/event/${community.slug}`;

  const closeCheckout = React.useCallback(() => {
    setCheckoutOpen(false);
    document.body.style.overflow = "";
  }, []);

  React.useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  React.useEffect(() => {
    if (!checkoutOpen || checkoutStep !== "qris") {
      return;
    }
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          closeCheckout();
          toast({
            title: "Waktu booking habis, silakan pilih ulang",
            variant: "warning",
          });
          return 600;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [checkoutOpen, checkoutStep, closeCheckout, toast]);

  React.useEffect(() => {
    if (!checkoutOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeCheckout();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [checkoutOpen, closeCheckout]);

  function handleSlotClick(id: number) {
    const slot = slots.find((s) => s.id === id);
    if (!slot || slot.status !== "available") return;
    setSelectedSlot((prev) => (prev === id ? null : id));
  }

  function openCheckout() {
    if (selectedSlot === null) return;
    setCheckoutStep("form");
    setSecondsLeft(600);
    setCheckoutOpen(true);
    document.body.style.overflow = "hidden";
  }

  function handleShowQris(e: React.FormEvent) {
    e.preventDefault();
    setCheckoutStep("qris");
    setSecondsLeft(600);
  }

  function handleSimulatePayment() {
    setIsVerifyingPayment(true);
    setTimeout(() => {
      const bookedSlotId = selectedSlot;
      if (bookedSlotId !== null) {
        setSlots((prev) => {
          const updatedSlots = prev.map((s) =>
            s.id === bookedSlotId
              ? { ...s, status: "paid" as const, name: playerName.trim() || "Pemain Baru" }
              : s,
          );
          if (getCustomCommunityEventBySlug(community.slug)) {
            saveCustomCommunityEvent({
              ...community,
              slots: updatedSlots,
            });
          }
          return updatedSlots;
        });
      }
      setIsVerifyingPayment(false);
      setCheckoutStep("success");
      setSelectedSlot(null);

      setTimeout(() => {
        closeCheckout();
        if (bookedSlotId !== null) {
          toast({
            title: `Pembayaran terverifikasi — slot #${String(bookedSlotId).padStart(2, "0")} lunas`,
            variant: "success",
          });
        }
      }, 1900);
    }, 1200);
  }

  async function copyInviteLink() {
    const inviteUrl = `${window.location.origin}/event/${community.slug}`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
    } catch {
      // ignore fallback error
    }
    toast({
      title: `Link pendaftaran ${community.communityName} berhasil disalin`,
      variant: "success",
    });
  }

  function shareToWhatsApp() {
    const inviteUrl = `${window.location.origin}/event/${community.slug}`;
    const text = encodeURIComponent(
      `⚽ *UNDANGAN MABAR ${community.communityName.toUpperCase()}*\n\n` +
        `Halo bro, yuk gabung mabar bareng kita!\n` +
        `📍 *Lokasi:* ${community.venue} (${community.city})\n` +
        `📅 *Hari/Tgl:* ${formatDateIndo(community.date)}\n` +
        `⏰ *Jam:* ${community.time}\n` +
        `💰 *Biaya:* ${formatRupiah(community.price)}/pemain\n` +
        `⚡ *Sisa Slot:* ${availableSlotsCount} slot lagi\n\n` +
        `Pilih slot & bayar otomatis di link ini:\n` +
        `${inviteUrl}`,
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  }

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedCountdown = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div id="communityInvitationPage" className="app-panel">
      {/* TOP NAVIGATION */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/explore"
          className="group inline-flex items-center gap-2 text-xs font-bold text-slate-500 transition hover:text-emerald-700"
        >
          <ArrowLeft className="size-4 transition group-hover:-translate-x-1" aria-hidden="true" />
          <span>Kembali ke Semua Mabar</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={copyInviteLink}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
            title="Salin link undangan ini"
          >
            <Link2 className="size-3.5 text-emerald-700" aria-hidden="true" />
            <span className="font-mono text-[11px] text-slate-500">{displaySlug}</span>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
              Salin
            </span>
          </button>

          <button
            type="button"
            onClick={shareToWhatsApp}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-500"
          >
            <Share2 className="size-3.5" aria-hidden="true" />
            <span>Share WA</span>
          </button>
        </div>
      </div>

      {/* INVITATION WELCOME CALLOUT */}
      <div className="border-emerald-200/80 to-lime/15 relative mb-6 overflow-hidden rounded-3xl border bg-gradient-to-r from-emerald-50 via-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <img
              src="/solokickpro.png"
              alt="KickPro"
              className="border-slate-200/60 size-12 shrink-0 rounded-2xl border bg-emerald-950 object-contain p-1 shadow-glow"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-lime">
                  <Sparkles className="size-3" aria-hidden="true" />
                  Undangan Mabar
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800">
                  <BadgeCheck className="size-3.5 text-emerald-600" aria-hidden="true" />
                  Official Community
                </span>
              </div>
              <h1 className="mt-1 font-display text-xl font-extrabold text-slate-900 sm:text-2xl">
                Kamu diundang bermain oleh{" "}
                <span className="text-emerald-800">{community.communityName}</span>
              </h1>
              <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                {community.tagline}. Diselenggarakan oleh{" "}
                <span className="font-bold text-slate-800">{community.hostName}</span> (
                {community.hostRole}).
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
            <span className="bg-emerald-100/70 inline-flex items-center gap-1.5 rounded-full border border-emerald-300 px-3 py-1 text-xs font-bold text-emerald-900">
              <span className="size-2 animate-pulse rounded-full bg-emerald-600" />
              Sisa {availableSlotsCount} dari {community.totalSlots} Slot
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              {paidSlotsCount} pemain sudah konfirmasi
            </span>
          </div>
        </div>
      </div>

      {/* EVENT BANNER */}
      <section className="relative mb-6 overflow-hidden rounded-3xl bg-emerald-950 p-5 text-white shadow-soft sm:p-7">
        <div className="border-lime/10 pointer-events-none absolute -right-12 -top-14 size-60 rounded-full border-[30px]" />
        <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-lime px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-950">
                {community.type}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold text-emerald-100">
                {community.sport}
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold text-emerald-100">
                <span className="size-1.5 rounded-full bg-lime" />
                {community.timePeriod} • {community.duration}
              </span>
            </div>
            <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
              {community.communityName} — Weekly Match
            </h2>
            <p className="text-emerald-100/80 mt-2 flex items-center gap-2 text-sm font-medium">
              <MapPin className="size-4 shrink-0 text-lime" aria-hidden="true" />
              <span>
                {community.venue}{" "}
                <span className="opacity-60">({community.city})</span>
              </span>
            </p>
            <p className="text-emerald-100/60 mt-1 pl-6 text-xs">{community.address}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold">
                <CalendarDays className="size-4 text-lime" aria-hidden="true" />
                <span>{formatDateIndo(community.date)}</span>
              </span>
              <span className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold">
                <Clock3 className="size-4 text-lime" aria-hidden="true" />
                <span>{community.time}</span>
              </span>
              <span className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold">
                <Users className="size-4 text-lime" aria-hidden="true" />
                <span>Kuota: {community.totalSlots} Pemain</span>
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur md:min-w-48">
            <p className="text-emerald-100/65 text-xs font-semibold">Biaya mabar per pemain</p>
            <p className="mt-1 font-display text-2xl font-extrabold text-lime">
              {formatRupiah(community.price)}
            </p>
            <p className="text-emerald-100/55 mt-1 text-[10px] font-medium">
              Termasuk sewa lapangan, wasit &amp; QRIS
            </p>
          </div>
        </div>
      </section>

      {/* SLOT PICKER + SIDEBAR */}
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                  Amankan Posisi
                </p>
                <h2 className="font-display text-xl font-extrabold tracking-tight">
                  Pilih Slot Pemain
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Klik nomor slot yang masih tersedia untuk melanjutkan pendaftaran.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-emerald-500" />
                  Tersedia
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-amber-400" />
                  Diproses
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-slate-500" />
                  Lunas
                </span>
              </div>
            </div>

            <div className="bg-emerald-50/70 mb-4 flex items-center gap-3 rounded-xl border border-emerald-100 p-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-700 shadow-sm">
                <Goal className="size-4" aria-hidden="true" />
              </div>
              <p className="text-xs font-medium leading-5 text-emerald-900">
                Bebas pilih nomor slot. Pembagian tim merata dilakukan oleh{" "}
                {community.hostName} sebelum kick-off.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {slots.map((slot) => {
                const isSelected = selectedSlot === slot.id;
                let cardClass =
                  "available border-emerald-100 bg-emerald-50/40 text-slate-900 hover:border-emerald-400";
                let statusLabel = "Tersedia";
                let detail = "Pilih slot";
                let disabled = false;

                if (slot.status === "locked") {
                  cardClass = "locked border-amber-200 bg-amber-50 text-amber-900";
                  statusLabel = "Diproses";
                  detail = "Sedang dikunci";
                  disabled = true;
                } else if (slot.status === "paid") {
                  cardClass = "paid border-slate-300 bg-slate-200/70 text-slate-500";
                  statusLabel = "Lunas";
                  detail = slot.name;
                  disabled = true;
                } else if (isSelected) {
                  cardClass =
                    "selected text-emerald-950 ring-2 ring-emerald-600 bg-lime/30 border-emerald-600";
                  statusLabel = "Dipilih";
                  detail = "Slot kamu";
                }

                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleSlotClick(slot.id)}
                    className={`slot-card ${cardClass} flex flex-col items-start justify-between rounded-2xl border p-3 text-left transition disabled:cursor-not-allowed`}
                    aria-label={`Slot ${slot.id}, ${statusLabel}`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                        #{String(slot.id).padStart(2, "0")}
                      </span>
                      {slot.status === "locked" && <Clock3 className="size-4" aria-hidden="true" />}
                      {slot.status === "paid" && (
                        <LockKeyhole className="size-4" aria-hidden="true" />
                      )}
                      {slot.status === "available" && !isSelected && (
                        <CirclePlus className="size-4 text-emerald-700" aria-hidden="true" />
                      )}
                      {isSelected && (
                        <Check className="size-4 text-emerald-950" aria-hidden="true" />
                      )}
                    </div>
                    <div className="mt-2">
                      <p className="text-xs font-extrabold">{statusLabel}</p>
                      <p className="mt-0.5 max-w-full truncate text-[9px] font-semibold opacity-70">
                        {detail}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
              <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                <Sparkles className="size-4 text-emerald-700" aria-hidden="true" />
                Fasilitas Mabar
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Disediakan khusus untuk semua pemain di sesi ini:
              </p>
              <ul className="mt-3 space-y-2.5">
                {community.facilities.map((facility) => (
                  <li
                    key={facility}
                    className="flex items-start gap-2.5 text-xs font-medium text-slate-700"
                  >
                    <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <Check className="size-3" aria-hidden="true" />
                    </span>
                    <span>{facility}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
              <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                <ShieldCheck className="size-4 text-emerald-700" aria-hidden="true" />
                Aturan &amp; Kode Etik
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Harap ditaati agar permainan tetap seru dan kondusif:
              </p>
              <ul className="mt-3 space-y-2.5">
                {community.rules.map((rule) => (
                  <li
                    key={rule}
                    className="flex items-start gap-2.5 text-xs font-medium text-slate-700"
                  >
                    <span className="mt-1.5 flex size-1.5 shrink-0 rounded-full bg-emerald-600" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-900 font-display text-lg font-black text-lime">
                {community.communityName.substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-extrabold text-slate-900">
                  {community.communityName}
                </h3>
                <p className="text-[11px] font-medium text-slate-500">
                  {community.city} • {community.sport}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-600">{community.description}</p>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
              <span>Captain / PIC:</span>
              <span className="font-bold text-slate-800">{community.hostName}</span>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
            <div className="mb-4 flex items-center gap-3">
              <span className="bg-lime/40 flex size-10 items-center justify-center rounded-xl text-emerald-950">
                <ShieldCheck className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-sm font-extrabold">Booking terlindungi</h3>
                <p className="mt-0.5 text-[11px] text-slate-500">Konfirmasi real-time QRIS</p>
              </div>
            </div>
            <ul className="space-y-3 text-xs font-medium text-slate-600">
              <li className="flex gap-2">
                <Check className="size-4 shrink-0 text-emerald-600" aria-hidden="true" />
                Slot langsung terkunci 10 menit
              </li>
              <li className="flex gap-2">
                <Check className="size-4 shrink-0 text-emerald-600" aria-hidden="true" />
                Pembayaran otomatis via QRIS
              </li>
              <li className="flex gap-2">
                <Check className="size-4 shrink-0 text-emerald-600" aria-hidden="true" />
                Masuk manifest pemain resmi
              </li>
            </ul>
          </div>

          <div className="rounded-3xl bg-lime p-5 text-emerald-950">
            <MessageCircle className="size-5" aria-hidden="true" />
            <p className="mt-4 font-display text-lg font-extrabold">Ada pertanyaan jadwal?</p>
            <p className="mt-1 text-xs font-medium leading-5">
              Hubungi langsung {community.hostName} untuk info kostum, parkir, atau
              konfirmasi tim.
            </p>
            <button
              type="button"
              onClick={() =>
                toast({
                  title: `Membuka WhatsApp ${community.hostName} (simulasi)`,
                  variant: "default",
                })
              }
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-950 px-4 py-3 text-xs font-bold text-white transition hover:bg-emerald-900"
            >
              <span>Hubungi {community.hostName}</span>
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        </aside>
      </div>

      {/* FLOATING BOOKING BAR */}
      {selectedSlot !== null && (
        <div
          id="bookingBar"
          className="bg-white/95 fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 p-3 shadow-[0_-14px_40px_rgba(15,23,42,.12)] backdrop-blur-xl"
        >
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Pilihanmu
              </p>
              <div className="mt-0.5 flex items-baseline gap-2">
                <p className="font-display text-sm font-extrabold sm:text-base">
                  Slot #{String(selectedSlot).padStart(2, "0")}
                </p>
                <span className="text-slate-300">•</span>
                <p className="text-xs font-bold text-emerald-700 sm:text-sm">
                  {formatRupiah(community.price)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={openCheckout}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-lime px-4 py-3 text-xs font-extrabold text-emerald-950 shadow-glow transition hover:bg-[#d6fa42] sm:px-6 sm:text-sm"
            >
              <span>Lanjut Pembayaran</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-5">
          <div
            onClick={closeCheckout}
            className="backdrop-enter bg-slate-950/60 absolute inset-0 cursor-default backdrop-blur-sm"
            aria-label="Tutup modal"
          />
          <div
            className="modal-enter relative max-h-[94vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-lg sm:rounded-3xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-title"
          >
            <div className="bg-white/95 sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 px-5 py-4 backdrop-blur">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                  Secure checkout
                </p>
                <h2 id="checkout-title" className="mt-0.5 text-lg font-extrabold">
                  Selesaikan booking
                </h2>
              </div>
              <button
                type="button"
                onClick={closeCheckout}
                className="flex size-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                aria-label="Tutup"
              >
                <X className="size-4" />
              </button>
            </div>

            {checkoutStep !== "success" ? (
              <div className="p-5">
                <div className="mb-5 flex items-center justify-between rounded-2xl bg-emerald-950 p-4 text-white">
                  <div>
                    <p className="text-emerald-200/60 text-[10px] font-bold uppercase tracking-wider">
                      {community.communityName}
                    </p>
                    <p className="mt-1 font-display text-xl font-extrabold">
                      Pemain #{String(selectedSlot).padStart(2, "0")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-200/60 text-[10px] font-bold uppercase tracking-wider">
                      Total
                    </p>
                    <p className="mt-1 font-display text-xl font-extrabold text-lime">
                      {formatRupiah(community.price)}
                    </p>
                  </div>
                </div>

                {checkoutStep === "form" && (
                  <form onSubmit={handleShowQris} className="space-y-4">
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-bold text-slate-700">
                        Nama lengkap
                      </span>
                      <div className="relative">
                        <UserRound
                          className="absolute left-3.5 top-3.5 size-4 text-slate-400"
                          aria-hidden="true"
                        />
                        <input
                          required
                          value={playerName}
                          onChange={(e) => setPlayerName(e.target.value)}
                          placeholder="Nama yang muncul di slot"
                          className="focus:ring-emerald-500/10 w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4"
                        />
                      </div>
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-bold text-slate-700">
                        Nomor WhatsApp
                      </span>
                      <div className="relative">
                        <span className="absolute left-3.5 top-3.5 text-xs font-bold text-slate-400">
                          +62
                        </span>
                        <input
                          required
                          inputMode="numeric"
                          minLength={8}
                          value={playerPhone}
                          onChange={(e) => setPlayerPhone(e.target.value)}
                          placeholder="812 3456 7890"
                          className="focus:ring-emerald-500/10 w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4"
                        />
                      </div>
                    </label>
                    <button
                      type="submit"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-lime px-4 py-3.5 text-sm font-extrabold text-emerald-950 shadow-glow"
                    >
                      <span>Tampilkan QRIS</span>
                      <QrCode className="size-4" aria-hidden="true" />
                    </button>
                  </form>
                )}

                {checkoutStep === "qris" && (
                  <div>
                    <div className="mb-4 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                      <span className="flex items-center gap-2 text-xs font-bold text-amber-800">
                        <Timer className="size-4" aria-hidden="true" />
                        Slot Terkunci
                      </span>
                      <span className="font-mono text-sm font-extrabold text-amber-900">
                        {formattedCountdown}
                      </span>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                      <div className="mb-3 flex items-center justify-center gap-2">
                        <span className="rounded bg-red-600 px-1.5 py-1 text-[10px] font-black italic tracking-tight text-white">
                          QRIS
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Pembayaran instan
                        </span>
                      </div>
                      <div className="relative mx-auto size-44 overflow-hidden rounded-xl border-8 border-white bg-white shadow-md">
                        <div className="qr-pattern absolute inset-0" />
                        <div className="absolute left-1/2 top-1/2 z-10 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-lg border-2 border-white bg-emerald-950 p-1 shadow-sm">
                          <img
                            src="/solokickpro.png"
                            alt="KickPro"
                            className="size-full object-contain"
                          />
                        </div>
                      </div>
                      <p className="mt-4 text-xs font-medium text-slate-500">
                        Scan QR dengan aplikasi pembayaran apa pun
                      </p>
                      <p className="mt-1 font-display text-xl font-extrabold text-slate-900">
                        {formatRupiah(community.price)}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isVerifyingPayment}
                      onClick={handleSimulatePayment}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-950 px-4 py-3.5 text-sm font-extrabold text-white transition hover:bg-emerald-900 disabled:opacity-75"
                    >
                      {isVerifyingPayment ? (
                        <>
                          <span className="spinner" />
                          <span>Memverifikasi pembayaran...</span>
                        </>
                      ) : (
                        <>
                          <Webhook className="size-4" aria-hidden="true" />
                          <span>Saya Sudah Bayar</span>
                          <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-bold">
                            SIMULASI WEBHOOK
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <svg
                    className="size-10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    aria-hidden="true"
                  >
                    <path
                      className="success-check"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m5 12 4 4L19 6"
                    />
                  </svg>
                </div>
                <h2 className="mt-5 text-2xl font-extrabold">Pembayaran berhasil</h2>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">
                  Slotmu sudah aman. Detail permainan telah dikirim ke nomor WhatsApp.
                </p>
                <div className="bg-lime/30 mx-auto mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-emerald-900">
                  <TicketCheck className="size-4" aria-hidden="true" />
                  Status: Lunas
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
