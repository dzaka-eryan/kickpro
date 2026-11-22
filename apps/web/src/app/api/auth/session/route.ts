import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createHmac, randomBytes } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { COLLECTION_NAMES, type SportType } from "@kickpro/shared";
import { getFirebaseAdmin } from "@/lib/firebase/admin";

export interface StoredCommunityAccount {
  clubId: string;
  clubSlug: string;
  clubName: string;
  captainName: string;
  phone: string; // normalized digits e.g. "81234567890"
  password: string;
  logoUrl: string | null;
  city: string;
  sports: string[];
  motto: string;
  createdAt: string;
}

export interface SessionPayload {
  clubId: string;
  clubSlug: string;
  clubName: string;
  captainName: string;
  phone: string;
  iat: number;
  exp: number;
  jti: string;
}

const ACCOUNTS_STORE_PATH = path.join(process.cwd(), ".community-accounts.json");
const SESSION_COOKIE_NAME = "kickpro_session";
const SESSION_SECRET = process.env.SESSION_SECRET ?? "kickpro-mvp-community-session-secret-2026";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function normalizePhoneDigits(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("62")) return digits.slice(2);
  if (digits.startsWith("0")) return digits.slice(1);
  return digits;
}

function isValidIndonesianPhoneDigits(normPhone: string): boolean {
  return /^8[0-9]{7,13}$/.test(normPhone);
}

function slugifyName(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "komunitas-baru"
  );
}

function mapUiSportsToFirestore(sports: string[]): SportType[] {
  const mapped: SportType[] = [];
  for (const s of sports) {
    const lower = s.toLowerCase();
    if (lower.includes("futsal")) mapped.push("futsal");
    else if (lower.includes("sepak") || lower === "football") mapped.push("football");
    else mapped.push("mini_soccer");
  }
  return mapped.length > 0 ? Array.from(new Set(mapped)) : ["mini_soccer"];
}

function mapFirestoreSportsToUi(sportTypes: unknown): string[] {
  if (!Array.isArray(sportTypes) || sportTypes.length === 0) return ["Mini Soccer"];
  return sportTypes.map((s) => {
    if (s === "futsal") return "Futsal";
    if (s === "football") return "Sepak Bola";
    if (s === "mini_soccer") return "Mini Soccer";
    return typeof s === "string" ? s : "Mini Soccer";
  });
}

function withFirestoreTimeout<T>(promise: Promise<T>, timeoutMs = 1500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      const timer = setTimeout(() => reject(new Error("Firestore operation timed out")), timeoutMs);
      if (typeof timer === "object" && "unref" in timer) {
        timer.unref();
      }
    }),
  ]);
}

async function findCommunityAccountInFirestore(
  normPhone: string,
): Promise<StoredCommunityAccount | null> {
  try {
    const { adminDb } = getFirebaseAdmin();
    const e164Phone = `+62${normPhone}`;

    // 1. Cek di koleksi `users` berdasarkan phoneNumber (+62...)
    const usersSnap = await withFirestoreTimeout(
      adminDb
        .collection(COLLECTION_NAMES.users)
        .where("phoneNumber", "==", e164Phone)
        .limit(1)
        .get(),
    );

    if (!usersSnap.empty) {
      const userDoc = usersSnap.docs[0]!;
      const userData = userDoc.data() as Record<string, unknown>;
      const userId = userDoc.id;

      // Tentukan clubId dari field userData.clubId atau seed mapping
      let clubId = typeof userData.clubId === "string" ? userData.clubId : "";
      if (!clubId) {
        if (userId === "user-budi" || normPhone === "81210000001") {
          clubId = "club-garuda-muda";
        } else if (userId === "user-andi" || normPhone === "81210000004") {
          clubId = "club-senayan-united";
        }
      }

      if (clubId) {
        const clubSnap = await withFirestoreTimeout(
          adminDb.collection(COLLECTION_NAMES.clubs).doc(clubId).get(),
        );
        if (clubSnap.exists) {
          const clubData = (clubSnap.data() ?? {}) as Record<string, unknown>;
          const clubName =
            typeof clubData.name === "string" ? clubData.name : "Komunitas KickPro";
          const clubSlug =
            typeof clubData.slug === "string" ? clubData.slug : slugifyName(clubName);
          const storedPassword =
            typeof userData.password === "string"
              ? userData.password
              : typeof clubData.password === "string"
                ? clubData.password
                : "Password123!";

          return {
            clubId,
            clubSlug,
            clubName,
            captainName:
              typeof userData.name === "string" ? userData.name : `Kapten ${clubName}`,
            phone: normPhone,
            password: storedPassword,
            logoUrl: typeof clubData.logoUrl === "string" ? clubData.logoUrl : null,
            city:
              typeof clubData.city === "string"
                ? clubData.city
                : typeof userData.city === "string"
                  ? userData.city
                  : "Jakarta Selatan",
            sports: mapFirestoreSportsToUi(clubData.sportTypes ?? clubData.sports),
            motto:
              typeof clubData.vision === "string"
                ? clubData.vision
                : typeof clubData.motto === "string"
                  ? clubData.motto
                  : "",
            createdAt: new Date().toISOString(),
          };
        }
      }
    }

    // 2. Cek juga langsung di koleksi `clubs` berdasarkan captainPhone / phoneNumber
    const clubsSnap = await withFirestoreTimeout(
      adminDb
        .collection(COLLECTION_NAMES.clubs)
        .where("captainPhone", "==", e164Phone)
        .limit(1)
        .get(),
    );

    if (!clubsSnap.empty) {
      const clubDoc = clubsSnap.docs[0]!;
      const clubData = clubDoc.data() as Record<string, unknown>;
      const clubName = typeof clubData.name === "string" ? clubData.name : "Komunitas KickPro";
      return {
        clubId: clubDoc.id,
        clubSlug: typeof clubData.slug === "string" ? clubData.slug : slugifyName(clubName),
        clubName,
        captainName:
          typeof clubData.captainName === "string" ? clubData.captainName : `Kapten ${clubName}`,
        phone: normPhone,
        password: typeof clubData.password === "string" ? clubData.password : "Password123!",
        logoUrl: typeof clubData.logoUrl === "string" ? clubData.logoUrl : null,
        city: typeof clubData.city === "string" ? clubData.city : "Jakarta Selatan",
        sports: mapFirestoreSportsToUi(clubData.sportTypes ?? clubData.sports),
        motto:
          typeof clubData.vision === "string"
            ? clubData.vision
            : typeof clubData.motto === "string"
              ? clubData.motto
              : "",
        createdAt: new Date().toISOString(),
      };
    }
  } catch {
    // Firestore emulator / server tidak terjangkau -> fallback ke penyimpanan lokal
  }
  return null;
}

async function saveCommunityAccountToFirestore(account: StoredCommunityAccount): Promise<boolean> {
  try {
    const { adminDb } = getFirebaseAdmin();
    const e164Phone = `+62${account.phone}`;
    const userId = `user-${account.phone}`;
    const nowIso = account.createdAt || new Date().toISOString();

    await withFirestoreTimeout(
      Promise.all([
        adminDb
          .collection(COLLECTION_NAMES.users)
          .doc(userId)
          .set(
            {
              name: account.captainName,
              phoneNumber: e164Phone,
              photoUrl: null,
              city: account.city,
              geo: null,
              position: "MF",
              preferredFoot: "right",
              favoriteNumber: 10,
              attendanceScore: 100,
              platformRole: "user",
              clubId: account.clubId,
              password: account.password,
              createdAt: nowIso,
            },
            { merge: true },
          ),
        adminDb
          .collection(COLLECTION_NAMES.clubs)
          .doc(account.clubId)
          .set(
            {
              name: account.clubName,
              slug: account.clubSlug,
              logoUrl: account.logoUrl,
              city: account.city,
              geo: null,
              description: account.motto,
              vision: account.motto,
              sportTypes: mapUiSportsToFirestore(account.sports),
              level: "fun",
              avgAge: 25,
              walletBalance: 0,
              escrowBalance: 0,
              totalMatchesPlayed: 0,
              fairPlayScore: 5,
              fairPlayCount: 0,
              captainName: account.captainName,
              captainPhone: e164Phone,
              password: account.password,
              createdAt: nowIso,
            },
            { merge: true },
          ),
        adminDb
          .collection(COLLECTION_NAMES.clubs)
          .doc(account.clubId)
          .collection(COLLECTION_NAMES.members)
          .doc(userId)
          .set(
            {
              userId,
              role: "head_admin",
              status: "active",
              joinedAt: nowIso,
            },
            { merge: true },
          ),
      ]),
    );
    return true;
  } catch {
    return false;
  }
}

const DEFAULT_SEED_ACCOUNTS: StoredCommunityAccount[] = [
  {
    clubId: "club-garuda-muda",
    clubSlug: "garuda-muda-fc",
    clubName: "Garuda Muda FC",
    captainName: "Budi Santoso",
    phone: "81210000001",
    password: "Password123!",
    logoUrl: null,
    city: "Jakarta Selatan",
    sports: ["Mini Soccer", "Futsal"],
    motto: "Main sehat, fair play, dan transparansi kas untuk semua anggota.",
    createdAt: new Date().toISOString(),
  },
  {
    clubId: "club-senayan-united",
    clubSlug: "senayan-united",
    clubName: "Senayan United",
    captainName: "Andi Wijaya",
    phone: "81210000004",
    password: "Password123!",
    logoUrl: null,
    city: "Jakarta Pusat",
    sports: ["Mini Soccer", "Sepak Bola"],
    motto: "Menjaga kebugaran dan silaturahmi lewat kompetisi sehat.",
    createdAt: new Date().toISOString(),
  },
];

async function readAccounts(): Promise<StoredCommunityAccount[]> {
  try {
    const raw = await fs.readFile(ACCOUNTS_STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as StoredCommunityAccount[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // Use defaults
  }
  return DEFAULT_SEED_ACCOUNTS;
}

async function writeAccounts(accounts: StoredCommunityAccount[]): Promise<void> {
  try {
    await fs.writeFile(ACCOUNTS_STORE_PATH, JSON.stringify(accounts, null, 2), "utf8");
  } catch {
    // Ignore write failure
  }
}

function createSignedSessionToken(payload: Omit<SessionPayload, "iat" | "exp" | "jti">): {
  token: string;
  session: SessionPayload;
} {
  const nowSec = Math.floor(Date.now() / 1000);
  const fullPayload: SessionPayload = {
    ...payload,
    iat: nowSec,
    exp: nowSec + SESSION_TTL_SECONDS,
    jti: randomBytes(8).toString("hex"),
  };
  const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const signature = createHmac("sha256", SESSION_SECRET).update(encodedPayload).digest("base64url");
  return {
    token: `${encodedPayload}.${signature}`,
    session: fullPayload,
  };
}

function verifySignedSessionToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [encodedPayload, signature] = parts;
  if (!encodedPayload || !signature) return null;
  const expectedSig = createHmac("sha256", SESSION_SECRET)
    .update(encodedPayload)
    .digest("base64url");
  if (signature !== expectedSig) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as SessionPayload;
    const nowSec = Math.floor(Date.now() / 1000);
    if (payload.exp < nowSec) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySignedSessionToken(token);
  if (!session) {
    return NextResponse.json({ authenticated: false, session: null });
  }
  return NextResponse.json({ authenticated: true, session, token });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      action?: "login" | "register";
      phone?: string;
      password?: string;
      clubName?: string;
      captainName?: string;
      logoUrl?: string | null;
      city?: string;
      sports?: string[];
      motto?: string;
      fallbackClub?: {
        id?: string;
        name?: string;
        captainName?: string;
        phone?: string;
        logoUrl?: string | null;
        city?: string;
        sports?: string[];
        motto?: string;
      } | null;
    };

    const action = body.action ?? "login";
    const normPhone = normalizePhoneDigits(body.phone ?? "");
    const inputPassword = body.password ?? "";

    if (!isValidIndonesianPhoneDigits(normPhone)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Format nomor WhatsApp tidak valid. Masukkan nomor yang benar (contoh: 81234567890).",
        },
        { status: 400 },
      );
    }

    const accounts = await readAccounts();

    if (action === "register") {
      if (inputPassword.length < 6) {
        return NextResponse.json(
          {
            ok: false,
            error: "Kata sandi minimal harus 6 karakter.",
          },
          { status: 400 },
        );
      }
      const clubName = (body.clubName ?? "Komunitas Baru FC").trim();
      const clubSlug = slugifyName(clubName);
      const clubId = `club-${clubSlug}`;
      const captainName = (body.captainName ?? `Kapten ${clubName}`).trim();

      const newAccount: StoredCommunityAccount = {
        clubId,
        clubSlug,
        clubName,
        captainName,
        phone: normPhone,
        password: body.password ?? "",
        logoUrl: body.logoUrl ?? null,
        city: body.city ?? "Jakarta Selatan",
        sports: body.sports && body.sports.length > 0 ? body.sports : ["Mini Soccer"],
        motto:
          body.motto?.trim() ||
          "Lebih dari sekedar fun football, membangun ekosistem sepak bola dari komunitas.",
        createdAt: new Date().toISOString(),
      };

      const filtered = accounts.filter(
        (acc) => acc.phone !== normPhone && acc.clubId !== newAccount.clubId,
      );
      await writeAccounts([newAccount, ...filtered]);
      const savedToFirestore = await saveCommunityAccountToFirestore(newAccount);

      const { token, session } = createSignedSessionToken({
        clubId: newAccount.clubId,
        clubSlug: newAccount.clubSlug,
        clubName: newAccount.clubName,
        captainName: newAccount.captainName,
        phone: newAccount.phone,
      });

      const response = NextResponse.json({
        ok: true,
        authenticated: true,
        source: savedToFirestore ? "firestore" : "local",
        session,
        token,
        account: {
          clubId: newAccount.clubId,
          clubSlug: newAccount.clubSlug,
          clubName: newAccount.clubName,
          captainName: newAccount.captainName,
          phone: newAccount.phone,
          logoUrl: newAccount.logoUrl,
          city: newAccount.city,
          sports: newAccount.sports,
          motto: newAccount.motto,
        },
      });

      response.cookies.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_TTL_SECONDS,
      });
      return response;
    }

    // ACTION: LOGIN — 1. Cek terlebih dahulu di Firestore (users & clubs)
    const firestoreAccount = await findCommunityAccountInFirestore(normPhone);
    let authSource: "firestore" | "local" = firestoreAccount ? "firestore" : "local";
    let matched = firestoreAccount ?? accounts.find((acc) => acc.phone === normPhone);

    // Jika akun ada di file lokal tapi belum ada di Firestore, sinkronkan ke Firestore
    if (!firestoreAccount && matched) {
      const synced = await saveCommunityAccountToFirestore(matched);
      if (synced) {
        authSource = "firestore";
      }
    }

    // Jika akun dibuat di browser (localStorage) sebelum API ini ada, hanya sinkronkan jika nomor teleponnya SAMA PERSIS
    if (
      !matched &&
      body.fallbackClub &&
      body.fallbackClub.name &&
      normalizePhoneDigits(body.fallbackClub.phone ?? "") === normPhone
    ) {
      const fb = body.fallbackClub;
      const fbSlug = slugifyName(fb.name ?? "komunitas");
      matched = {
        clubId: fb.id ?? `club-${fbSlug}`,
        clubSlug: fbSlug,
        clubName: fb.name ?? "Komunitas FC",
        captainName: fb.captainName ?? `Kapten ${fb.name}`,
        phone: normPhone,
        password: inputPassword,
        logoUrl: fb.logoUrl ?? null,
        city: fb.city ?? "Jakarta Selatan",
        sports: fb.sports ?? ["Mini Soccer"],
        motto: fb.motto ?? "",
        createdAt: new Date().toISOString(),
      };
      await writeAccounts([matched, ...accounts]);
      const synced = await saveCommunityAccountToFirestore(matched);
      if (synced) {
        authSource = "firestore";
      }
    }

    if (!matched) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Nomor WhatsApp belum terdaftar di data komunitas Firestore. Silakan Daftar Komunitas terlebih dahulu.",
        },
        { status: 404 },
      );
    }

    if (!inputPassword || matched.password !== inputPassword) {
      return NextResponse.json(
        {
          ok: false,
          error: "Kata sandi yang Anda masukkan salah. Silakan periksa kembali kata sandi Anda.",
        },
        { status: 401 },
      );
    }

    const { token, session } = createSignedSessionToken({
      clubId: matched.clubId,
      clubSlug: matched.clubSlug,
      clubName: matched.clubName,
      captainName: matched.captainName,
      phone: matched.phone,
    });

    const response = NextResponse.json({
      ok: true,
      authenticated: true,
      source: authSource,
      session,
      token,
      account: {
        clubId: matched.clubId,
        clubSlug: matched.clubSlug,
        clubName: matched.clubName,
        captainName: matched.captainName,
        phone: matched.phone,
        logoUrl: matched.logoUrl,
        city: matched.city,
        sports: matched.sports,
        motto: matched.motto,
      },
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    });
    return response;
  } catch {
    return NextResponse.json({ ok: false, error: "Gagal memproses autentikasi" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true, authenticated: false });
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
