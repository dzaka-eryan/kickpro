"use client";

import * as React from "react";
import {
  Bell,
  Bug,
  Calendar,
  MapPin,
  Shield,
  Users,
  Wallet,
} from "lucide-react";
import { formatRupiah } from "@kickpro/shared";
import { captureWebError } from "@/lib/sentry";
import { ClubSidebarContent } from "@/components/layout/club-layout";
import { PlayerBottomNav } from "@/components/layout/player-layout";
import {
  Badge,
  EventStatusBadge,
  SlotStatusBadge,
  SparringStatusBadge,
} from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

const COLOR_TOKENS = [
  { name: "Primary (Emerald Stadion)", hex: "#03251B", swatchClass: "bg-emerald-950 text-white" },
  { name: "Accent (Kick Lime)", hex: "#C9F31D", swatchClass: "bg-lime text-emerald-950" },
  { name: "Secondary", hex: "#E2E8F0", swatchClass: "bg-secondary text-slate-900" },
  { name: "Destructive", hex: "#C62828", swatchClass: "bg-destructive text-white" },
];

const POSITIONS = [
  { code: "GK", label: "Kiper (GK)" },
  { code: "DF", label: "Bek (DF)" },
  { code: "MF", label: "Gelandang (MF)" },
  { code: "FW", label: "Penyerang (FW)" },
] as const;

export function DesignShowcase() {
  const { toast } = useToast();
  const [selectedPosition, setSelectedPosition] = React.useState<string>("MF");

  function handleTestSentry() {
    const testErr = new Error("KickPro Web intentional Sentry test error (T-008)");
    captureWebError(testErr, { page: "/design", trigger: "manual_button" });
    toast({
      title: "Event error terkirim ke monitor",
      description: "Periksa console dev atau dashboard Sentry untuk detail source map.",
      variant: "warning",
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-black text-primary-foreground">
              K
            </span>
            <span className="text-base font-extrabold text-slate-900">KickPro Design System</span>
          </div>
          <Badge variant="lime">Dev Showcase · T-006</Badge>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-10 px-4 py-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            KickPro UI Kit &amp; Layout Mobile-First
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Referensi komponen dasar, token warna brand, status badge, dan navigasi Player/Club
            Mode dengan target kontras WCAG AA.
          </p>
        </div>

        {/* 1. Palet Warna & Tipografi */}
        <section aria-labelledby="tokens-heading" className="space-y-4">
          <h2 id="tokens-heading" className="text-xl font-bold text-slate-900">
            1. Token Warna &amp; Tipografi
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {COLOR_TOKENS.map((token) => (
              <div
                key={token.name}
                className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
              >
                <div className={`flex h-16 items-end p-3 text-xs font-bold ${token.swatchClass}`}>
                  {token.hex}
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-slate-900">{token.name}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Varian Button */}
        <section aria-labelledby="buttons-heading" className="space-y-4">
          <h2 id="buttons-heading" className="text-xl font-bold text-slate-900">
            2. Komponen Button
          </h2>
          <Card>
            <CardContent className="flex flex-wrap items-center gap-3 p-5">
              <Button variant="default">Primary Emerald</Button>
              <Button variant="lime">Kick Lime CTA</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Batalkan Event</Button>
              <Button size="sm">Ukuran SM</Button>
              <Button size="lg">Ukuran LG</Button>
            </CardContent>
          </Card>
        </section>

        {/* 3. Status Badge */}
        <section aria-labelledby="badges-heading" className="space-y-4">
          <h2 id="badges-heading" className="text-xl font-bold text-slate-900">
            3. Badge Status Slot, Event &amp; Sparring
          </h2>
          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Slot:
                </span>
                <SlotStatusBadge status="available" />
                <SlotStatusBadge status="locked" />
                <SlotStatusBadge status="paid" />
                <SlotStatusBadge status="checked_in" />
                <SlotStatusBadge status="no_show" />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Event:
                </span>
                <EventStatusBadge status="open" />
                <EventStatusBadge status="full" />
                <EventStatusBadge status="completed" />
                <EventStatusBadge status="cancelled" />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Sparring:
                </span>
                <SparringStatusBadge status="open" />
                <SparringStatusBadge status="awaiting_deposit" />
                <SparringStatusBadge status="confirmed" />
                <SparringStatusBadge status="disputed" />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 4. Kartu Kontekstual */}
        <section aria-labelledby="cards-heading" className="space-y-4">
          <h2 id="cards-heading" className="text-xl font-bold text-slate-900">
            4. Kartu Mabar, Dompet Klub &amp; Player Card
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle>Mabar Mini Soccer Jumat</CardTitle>
                  <EventStatusBadge status="open" />
                </div>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Pancoran Soccer Field</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="flex items-center gap-1.5 text-slate-700">
                  <Calendar className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                  <span>Jumat, 19:00–21:00 WIB</span>
                </p>
                <p className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <Users className="h-4 w-4" aria-hidden="true" />
                  <span>11/14 slot terisi · {formatRupiah(65000)}</span>
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Pilih Slot</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Dompet Garuda Muda</CardTitle>
                  <Wallet className="h-5 w-5 text-emerald-700" aria-hidden="true" />
                </div>
                <CardDescription>Saldo kas siap dicairkan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-2xl font-extrabold text-emerald-800">
                  {formatRupiah(1450000)}
                </p>
                <p className="text-xs text-slate-600">Escrow aktif: {formatRupiah(600000)}</p>
              </CardContent>
              <CardFooter className="gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Buku Kas
                </Button>
                <Button size="sm" className="flex-1">
                  Payout
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Budi Santoso · #8</CardTitle>
                  <Shield className="h-5 w-5 text-emerald-700" aria-hidden="true" />
                </div>
                <CardDescription>Gelandang (MF) · Kaki Kanan</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-lg bg-slate-100 p-2">
                  <p className="font-bold text-slate-900">100%</p>
                  <p className="text-slate-600">Disiplin</p>
                </div>
                <div className="rounded-lg bg-slate-100 p-2">
                  <p className="font-bold text-slate-900">24</p>
                  <p className="text-slate-600">Main</p>
                </div>
                <div className="rounded-lg bg-slate-100 p-2">
                  <p className="font-bold text-slate-900">4</p>
                  <p className="text-slate-600">MVP</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 5. Dialog, Sheet, Skeleton, Toast & Sentry */}
        <section aria-labelledby="overlays-heading" className="space-y-4">
          <h2 id="overlays-heading" className="text-xl font-bold text-slate-900">
            5. Dialog, Bottom Sheet, Skeleton, Toast &amp; Monitoring
          </h2>
          <Card>
            <CardContent className="grid gap-6 p-5 md:grid-cols-2">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-900">Interaksi Overlay &amp; Notifikasi</p>
                <div className="flex flex-wrap gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="default">Buka Dialog Lock Slot</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Kunci Slot #4 (Tim Merah)?</DialogTitle>
                        <DialogDescription>
                          Slot akan dikunci eksklusif selama 10 menit agar tidak diambil pemain lain
                          saat kamu menyelesaikan pembayaran.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">
                        Total bayar: <strong>{formatRupiah(67500)}</strong> (termasuk biaya layanan{" "}
                        {formatRupiah(2500)}).
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Batal</Button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button
                            onClick={() =>
                              toast({
                                title: "Slot berhasil dikunci",
                                description: "Selesaikan checkout sebelum timer 10:00 habis.",
                                variant: "success",
                              })
                            }
                          >
                            Kunci Sekarang
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline">
                        Bottom Sheet Posisi ({selectedPosition})
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom">
                      <SheetHeader>
                        <SheetTitle>Pilih Preferensi Posisi</SheetTitle>
                        <SheetDescription>
                          Posisi membantu host menyeimbangkan komposisi tim saat mabar.
                        </SheetDescription>
                      </SheetHeader>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        {POSITIONS.map((pos) => (
                          <SheetClose asChild key={pos.code}>
                            <Button
                              variant={selectedPosition === pos.code ? "default" : "outline"}
                              onClick={() => setSelectedPosition(pos.code)}
                            >
                              {pos.label}
                            </Button>
                          </SheetClose>
                        ))}
                      </div>
                    </SheetContent>
                  </Sheet>

                  <Button
                    variant="secondary"
                    onClick={() =>
                      toast({
                        title: "Pembayaran QRIS terverifikasi",
                        description: "Tiket QR mabar kamu sudah terbit.",
                        variant: "success",
                      })
                    }
                  >
                    <Bell className="h-4 w-4" aria-hidden="true" />
                    <span>Tampilkan Toast</span>
                  </Button>

                  <Button variant="destructive" onClick={handleTestSentry}>
                    <Bug className="h-4 w-4" aria-hidden="true" />
                    <span>Uji Error Sentry</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-900">Skeleton Loading State</p>
                <div className="space-y-2.5 rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-44" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-60" />
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 6. Preview Layout Player Mode & Club Mode */}
        <section aria-labelledby="layouts-heading" className="space-y-4">
          <h2 id="layouts-heading" className="text-xl font-bold text-slate-900">
            6. Preview Navigasi Player Mode &amp; Club Mode
          </h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Player Mode (Bottom Navigation)</CardTitle>
                <CardDescription>
                  Navigasi ibu jari mobile-first untuk Jelajah, Sparring, Tiket, Klub, dan Profil.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="border-t border-border bg-slate-50 px-4 py-8 text-center text-xs text-slate-600">
                  Area konten mobile Player Mode
                </div>
                <PlayerBottomNav activeHref="/explore" embedded />
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Club / Host Mode (Sidebar Navigation)</CardTitle>
                <CardDescription>
                  Sidebar terstruktur untuk Head Admin, Treasurer, dan Event Host.
                </CardDescription>
              </CardHeader>
              <CardContent className="border-t border-border p-5">
                <ClubSidebarContent
                  clubId="club-garuda-muda"
                  clubName="Garuda Muda FC"
                  activeSection="dashboard"
                />
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
