"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleDotDashed,
  ImagePlus,
  KeyRound,
  LockKeyhole,
  MapPin,
  Quote,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserRound,
} from "lucide-react";
import { setClientSession, type CommunitySession } from "@/lib/auth/session-client";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { useToast } from "@/components/ui/toast";

const CITY_OPTIONS = [
  "Jakarta Selatan",
  "Jakarta Pusat",
  "Jakarta Barat",
  "Jakarta Timur",
  "Jakarta Utara",
  "Tangerang Selatan",
  "Tangerang",
  "Depok",
  "Bekasi",
  "Bogor",
] as const;

const SPORT_OPTIONS = ["Sepak Bola", "Mini Soccer", "Futsal"] as const;

interface LocalStoredClub {
  id: string;
  name: string;
  captainName: string;
  phone: string;
  logoUrl: string | null;
  city: string;
  sports: string[];
  motto: string;
  events?: unknown[];
}

function findLocalStoredClubs(): LocalStoredClub[] {
  if (typeof window === "undefined") return [];
  const results: LocalStoredClub[] = [];
  const seenIds = new Set<string>();
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key || (!key.startsWith("kickpro_club_") && key !== "kickpro_latest_club")) {
        continue;
      }
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as LocalStoredClub;
      if (parsed && parsed.id && parsed.name && !seenIds.has(parsed.id)) {
        seenIds.add(parsed.id);
        results.push(parsed);
      }
    }
  } catch {
    // Ignore storage read error
  }
  return results;
}

function AuthFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const initialMode = searchParams.get("mode") === "register" ? "register" : "login";
  const [mode, setMode] = React.useState<"login" | "register">(initialMode);
  const [step, setStep] = React.useState<"account" | "setup-community">("account");
  const [submitting, setSubmitting] = React.useState(false);

  // Step 1 fields (Khusus Komunitas)
  const [fullName, setFullName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [communityName, setCommunityName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [localClubs, setLocalClubs] = React.useState<LocalStoredClub[]>([]);

  // Step 2 (Setup Komunitas) fields
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null);
  const [logoFileName, setLogoFileName] = React.useState<string>("");
  const [basecampCity, setBasecampCity] = React.useState<string>("Jakarta Selatan");
  const [selectedSports, setSelectedSports] = React.useState<string[]>(["Mini Soccer"]);
  const [motto, setMotto] = React.useState<string>("");

  React.useEffect(() => {
    const paramMode = searchParams.get("mode");
    if (paramMode === "register" || paramMode === "login") {
      setMode(paramMode);
    }
  }, [searchParams]);

  React.useEffect(() => {
    setLocalClubs(findLocalStoredClubs());
  }, []);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setLogoPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  function toggleSport(sport: string) {
    setSelectedSports((prev) => {
      if (prev.includes(sport)) {
        return prev.length > 1 ? prev.filter((s) => s !== sport) : prev;
      }
      return [...prev, sport];
    });
  }

function normalizeLocalPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("62")) return digits.slice(2);
  if (digits.startsWith("0")) return digits.slice(1);
  return digits;
}

function isValidLocalPhone(normPhone: string): boolean {
  return /^8[0-9]{7,13}$/.test(normPhone);
}

  async function handleAccountSubmit(e: React.FormEvent) {
    e.preventDefault();

    const cleanInputPhone = normalizeLocalPhone(phone);
    if (!isValidLocalPhone(cleanInputPhone)) {
      toast({
        title: "Nomor WhatsApp Tidak Valid",
        description: "Masukkan nomor WhatsApp aktif diawali angka 8 (contoh: 81234567890).",
        variant: "warning",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Kata Sandi Terlalu Pendek",
        description: "Kata sandi minimal harus terdiri dari 6 karakter.",
        variant: "warning",
      });
      return;
    }

    if (mode === "register") {
      setStep("setup-community");
      toast({
        title: "Akun Kapten siap! Lanjutkan Setup Komunitasmu",
        description: "Lengkapi logo, lokasi kota basecamp, jenis olahraga, dan motto komunitas.",
        variant: "default",
      });
      return;
    }

    // MODE: LOGIN KOMUNITAS DENGAN SESSION TOKEN
    setSubmitting(true);
    try {
      const matchingLocalClub =
        localClubs.find((c) => normalizeLocalPhone(c.phone) === cleanInputPhone) ?? null;

      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          phone,
          password,
          fallbackClub: matchingLocalClub,
        }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        token?: string;
        session?: CommunitySession;
        account?: {
          clubId: string;
          clubName: string;
          captainName: string;
          phone: string;
          logoUrl: string | null;
          city: string;
          sports: string[];
          motto: string;
        };
      };

      if (!res.ok || !data.ok || !data.token || !data.session) {
        toast({
          title: "Gagal Sign In Komunitas",
          description:
            data.error ?? "Pastikan nomor WhatsApp sudah terdaftar atau daftar komunitas baru.",
          variant: "warning",
        });
        return;
      }

      // Simpan Session Token di Client & Cookie HTTP-Only sudah diset oleh Server
      setClientSession(data.token, data.session);

      // Pastikan data komunitas tersinkron di localStorage jika belum ada
      if (data.account) {
        const storageKey = `kickpro_club_${data.account.clubId}`;
        if (!window.localStorage.getItem(storageKey)) {
          const syncedClub = {
            id: data.account.clubId,
            name: data.account.clubName,
            captainName: data.account.captainName,
            phone: `+62${data.account.phone}`,
            logoUrl: data.account.logoUrl,
            city: data.account.city,
            sports: data.account.sports,
            motto: data.account.motto,
            events: [],
          };
          window.localStorage.setItem(storageKey, JSON.stringify(syncedClub));
        }
      }

      toast({
        title: `Berhasil Sign In ke ${data.session.clubName}`,
        description: "Session token aktif. Mengarahkan ke Dashboard Komunitas...",
        variant: "success",
      });
      router.push(`/club/${data.session.clubId}`);
    } catch {
      toast({
        title: "Terjadi kesalahan jaringan saat Sign In",
        variant: "warning",
      });
    } finally {
      setSubmitting(false);
    }
  }

  function handleQuickSelectExistingClub(club: LocalStoredClub) {
    const cleanClubPhone = normalizeLocalPhone(club.phone);
    setPhone(cleanClubPhone);
    toast({
      title: `Nomor ${club.name} dipilih`,
      description: "Silakan masukkan kata sandi akun komunitas Anda untuk masuk.",
      variant: "default",
    });
  }

  async function handleSetupCommunitySubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          clubName: communityName.trim() || "Komunitas Baru FC",
          captainName: fullName.trim() || "Kapten Komunitas",
          phone,
          password,
          logoUrl: logoPreview,
          city: basecampCity,
          sports: selectedSports,
          motto:
            motto.trim() ||
            "Lebih dari sekedar fun football, membangun persaudaraan dari lapangan hijau.",
        }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        token?: string;
        session?: CommunitySession;
        account?: {
          clubId: string;
          clubName: string;
          captainName: string;
          phone: string;
          logoUrl: string | null;
          city: string;
          sports: string[];
          motto: string;
        };
      };

      if (!data.ok || !data.token || !data.session || !data.account) {
        toast({
          title: "Gagal mendaftarkan komunitas",
          variant: "warning",
        });
        return;
      }

      // 1. Simpan Session Token (JWT HMAC-SHA256)
      setClientSession(data.token, data.session);

      // 2. Simpan detail klub ke localStorage
      const clubSetupData = {
        id: data.account.clubId,
        name: data.account.clubName,
        captainName: data.account.captainName,
        phone: `+62${data.account.phone}`,
        logoUrl: data.account.logoUrl,
        city: data.account.city,
        sports: data.account.sports,
        motto: data.account.motto,
        events: [],
        createdAt: new Date().toISOString(),
      };

      window.localStorage.setItem(
        `kickpro_club_${data.account.clubId}`,
        JSON.stringify(clubSetupData),
      );
      window.localStorage.setItem("kickpro_latest_club", JSON.stringify(clubSetupData));

      toast({
        title: `Komunitas ${clubSetupData.name} berhasil dibuat!`,
        description: "Session token aktif. Silakan Buka Jadwal & Manifest Slot pertamamu.",
        variant: "success",
      });

      router.push(`/club/${data.account.clubId}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div id="authPage" className="app-panel mx-auto max-w-5xl">
      <div className="grid items-stretch gap-6 lg:grid-cols-[1.05fr_.95fr]">
        {/* LEFT BRAND PANEL */}
        <section className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-emerald-950 p-6 text-white shadow-soft sm:p-8">
          <div className="border-lime/10 pointer-events-none absolute -right-14 -top-16 size-64 rounded-full border-[32px]" />

          <div className="relative">
            <span className="border-lime/20 bg-lime/10 mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold text-lime">
              <Sparkles className="size-3.5" aria-hidden="true" />
              {step === "setup-community"
                ? "Langkah 2 dari 2 • Setup Komunitas"
                : "Portal Kapten & Komunitas KickPro"}
            </span>
            <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              {step === "setup-community" ? (
                <>
                  Lengkapi Identitas{" "}
                  <span className="text-lime">{communityName || "Komunitasmu"}</span>
                </>
              ) : (
                <>
                  Kelola Jadwal Mabar &amp;{" "}
                  <span className="text-lime">Manifest Slot Komunitasmu.</span>
                </>
              )}
            </h1>
            <p className="text-emerald-100/75 mt-4 text-sm leading-6">
              {step === "setup-community"
                ? "Pasang logo kebanggaan tim, tentukan kota basecamp, pilih jenis olahraga rutin, dan tulis motto komunitasmu sebelum masuk ke Dashboard Klub."
                : "Masuk ke dashboard komunitas yang sudah kamu buat, atau daftarkan tim/komunitas baru untuk mulai membagikan link jadwal mabar."}
            </p>
          </div>

          <div className="relative mt-8 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-emerald-100">
              <span className="flex size-6 items-center justify-center rounded-full bg-lime text-emerald-950">
                <Check className="size-3.5" aria-hidden="true" />
              </span>
              Autentikasi aman dengan HTTP-Only Cookie &amp; Session Token
            </div>
            <div className="flex items-center gap-2.5 text-xs font-semibold text-emerald-100">
              <span className="flex size-6 items-center justify-center rounded-full bg-lime text-emerald-950">
                <Check className="size-3.5" aria-hidden="true" />
              </span>
              Link pendek otomatis (/event/nama-komunitas) siap sebar ke WA
            </div>
            <div className="flex items-center gap-2.5 text-xs font-semibold text-emerald-100">
              <span className="flex size-6 items-center justify-center rounded-full bg-lime text-emerald-950">
                <Check className="size-3.5" aria-hidden="true" />
              </span>
              Manifest slot pemain real-time &amp; verifikasi QRIS otomatis
            </div>
          </div>
        </section>

        {/* RIGHT FORM PANEL */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
          {step === "account" ? (
            <>
              <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`rounded-lg py-2.5 text-xs font-extrabold transition sm:text-sm ${
                    mode === "login"
                      ? "bg-emerald-950 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Sign In Komunitas
                </button>
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className={`rounded-lg py-2.5 text-xs font-extrabold transition sm:text-sm ${
                    mode === "register"
                      ? "bg-emerald-950 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Daftar Komunitas
                </button>
              </div>

              <div className="bg-emerald-50/70 mb-5 flex items-center gap-3 rounded-2xl border border-emerald-200 p-3.5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-950 text-lime shadow-xs">
                  <ShieldCheck className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-extrabold text-emerald-950">
                    {mode === "login"
                      ? "Masuk sebagai Kapten / Admin Komunitas"
                      : "Buat Akun Tim / Komunitas Baru"}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    {mode === "login"
                      ? "Gunakan nomor WhatsApp yang didaftarkan saat membuat komunitas."
                      : "Langkah 1: Buat akun kapten sebelum setup profil komunitas."}
                  </p>
                </div>
              </div>

              {/* JIKA SUDAH PERNAH BUAT KOMUNITAS DI BROWSER INI, TAMPILKAN TOMBOL MASUK CEPAT */}
              {mode === "login" && localClubs.length > 0 && (
                <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    Komunitas yang sudah kamu buat:
                  </p>
                  <div className="mt-2 space-y-2">
                    {localClubs.map((club) => (
                      <div
                        key={club.id}
                        className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-xs font-extrabold text-slate-900">
                            {club.name}
                          </p>
                          <p className="truncate text-[10px] font-medium text-slate-500">
                            {club.captainName} • {club.phone}
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={() => handleQuickSelectExistingClub(club)}
                          className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-emerald-950 px-3 py-1.5 text-[11px] font-extrabold text-lime transition hover:bg-emerald-900"
                        >
                          <KeyRound className="size-3" aria-hidden="true" />
                          <span>Pilih</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleAccountSubmit} className="space-y-4">
                {mode === "register" && (
                  <>
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-bold text-slate-700">
                        Nama Kapten / PIC
                      </span>
                      <div className="relative">
                        <UserRound
                          className="absolute left-3.5 top-3.5 size-4 text-slate-400"
                          aria-hidden="true"
                        />
                        <input
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Mis. Dzaka Eryan Septianto"
                          className="focus:ring-emerald-500/10 w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3.5 text-sm font-medium outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4"
                        />
                      </div>
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-xs font-bold text-slate-700">
                        Nama Tim / Komunitas
                      </span>
                      <div className="relative">
                        <CircleDotDashed
                          className="absolute left-3.5 top-3.5 size-4 text-slate-400"
                          aria-hidden="true"
                        />
                        <input
                          required
                          value={communityName}
                          onChange={(e) => setCommunityName(e.target.value)}
                          placeholder="Mis. Cipondoh FC"
                          className="focus:ring-emerald-500/10 w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3.5 text-sm font-medium outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4"
                        />
                      </div>
                    </label>
                  </>
                )}

                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold text-slate-700">
                    Nomor WhatsApp Kapten
                  </span>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-xs font-bold text-slate-400">
                      +62
                    </span>
                    <input
                      required
                      inputMode="numeric"
                      minLength={8}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="812 3456 7890"
                      className="focus:ring-emerald-500/10 w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-3.5 text-sm font-medium outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold text-slate-700">Kata sandi</span>
                  <div className="relative">
                    <LockKeyhole
                      className="absolute left-3.5 top-3.5 size-4 text-slate-400"
                      aria-hidden="true"
                    />
                    <input
                      required
                      type="password"
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="focus:ring-emerald-500/10 w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3.5 text-sm font-medium outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4"
                    />
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-lime px-5 py-3.5 text-sm font-extrabold text-emerald-950 shadow-glow transition hover:bg-[#d6fa42] disabled:opacity-60"
                >
                  <span>
                    {mode === "login"
                      ? submitting
                        ? "Memverifikasi Session..."
                        : "Sign In ke Dashboard Komunitas"
                      : "Lanjut Setup Komunitas"}
                  </span>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </button>
              </form>
            </>
          ) : (
            /* STEP 2: SETUP KOMUNITAS */
            <div>
              <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">
                    Setup Komunitas Baru
                  </span>
                  <h2 className="font-display text-xl font-extrabold text-slate-900">
                    {communityName || "Tim / Komunitas Kamu"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setStep("account")}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  <ArrowLeft className="size-3.5" aria-hidden="true" />
                  <span>Ubah Akun</span>
                </button>
              </div>

              <form onSubmit={handleSetupCommunitySubmit} className="space-y-4">
                {/* 1. UPLOAD LOGO KOMUNITAS */}
                <div>
                  <span className="mb-1.5 block text-xs font-bold text-slate-700">
                    1. Upload Logo Komunitas
                  </span>
                  <label className="hover:border-emerald-400 flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 p-3.5 transition hover:bg-emerald-50/30">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Preview Logo Komunitas"
                        className="size-14 shrink-0 rounded-xl border border-slate-200 bg-white object-cover shadow-xs"
                      />
                    ) : (
                      <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-950 text-lime shadow-sm">
                        <ImagePlus className="size-6" aria-hidden="true" />
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-extrabold text-slate-900">
                        {logoFileName ? logoFileName : "Pilih file logo tim / komunitas"}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        Format PNG, JPG, atau WEBP (Disarankan rasio 1:1)
                      </p>
                    </div>
                    <span className="shrink-0 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-emerald-800 shadow-xs">
                      {logoPreview ? "Ganti" : "Upload"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="sr-only"
                    />
                  </label>
                </div>

                {/* 2. LOKASI KOTA BASECAMP */}
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold text-slate-700">
                    2. Lokasi Kota Basecamp
                  </span>
                  <div className="relative">
                    <MapPin
                      className="absolute left-3.5 top-3.5 size-4 text-emerald-700"
                      aria-hidden="true"
                    />
                    <select
                      value={basecampCity}
                      onChange={(e) => setBasecampCity(e.target.value)}
                      className="focus:ring-emerald-500/10 w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3.5 text-sm font-bold text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4"
                    >
                      {CITY_OPTIONS.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </label>

                {/* 3. JENIS OLAHRAGA */}
                <div>
                  <span className="mb-1.5 block text-xs font-bold text-slate-700">
                    3. Jenis Olahraga (Bisa pilih lebih dari satu)
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {SPORT_OPTIONS.map((sport) => {
                      const active = selectedSports.includes(sport);
                      return (
                        <button
                          key={sport}
                          type="button"
                          onClick={() => toggleSport(sport)}
                          className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-3 text-center transition ${
                            active
                              ? "border-emerald-600 bg-emerald-950 text-lime shadow-sm"
                              : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <Trophy className="size-4" aria-hidden="true" />
                          <span className="text-xs font-extrabold">{sport}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. MOTTO KOMUNITAS */}
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold text-slate-700">
                    4. Motto Komunitasmu
                  </span>
                  <div className="relative">
                    <Quote
                      className="absolute left-3.5 top-3.5 size-4 text-slate-400"
                      aria-hidden="true"
                    />
                    <textarea
                      required
                      rows={2}
                      value={motto}
                      onChange={(e) => setMotto(e.target.value)}
                      placeholder="Mis. Main sehat, fair play, dan tambah saudara di lapangan hijau!"
                      className="focus:ring-emerald-500/10 w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3.5 text-sm font-medium outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4"
                    />
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-lime px-5 py-3.5 text-sm font-extrabold text-emerald-950 shadow-glow transition hover:bg-[#d6fa42] disabled:opacity-60"
                >
                  <span>
                    {submitting ? "Menyimpan & Membuat Session..." : "Selesai Setup & Masuk Dashboard"}
                  </span>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </button>
              </form>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className="flex min-h-screen flex-col text-slate-900 antialiased selection:bg-lime selection:text-emerald-950">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-20 pt-5 sm:px-6 sm:pt-7 lg:px-8">
        <React.Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-slate-100" />}>
          <AuthFormContent />
        </React.Suspense>
      </main>

      <SiteFooter />
    </div>
  );
}
