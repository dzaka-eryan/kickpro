import { promises as fs } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../route";

const mockFirestoreDocs = new Map<string, Record<string, unknown>>();

vi.mock("@/lib/firebase/admin", () => {
  return {
    getFirebaseAdmin: () => ({
      adminDb: {
        collection: (colName: string) => ({
          where: (field: string, _op: string, val: unknown) => ({
            limit: (_n: number) => ({
              get: async () => {
                const docs: Array<{ id: string; data: () => Record<string, unknown> }> = [];
                for (const [key, docData] of mockFirestoreDocs.entries()) {
                  if (key.startsWith(`${colName}/`) && !key.slice(colName.length + 1).includes("/")) {
                    if (docData[field] === val) {
                      docs.push({
                        id: key.slice(colName.length + 1),
                        data: () => docData,
                      });
                    }
                  }
                }
                return { empty: docs.length === 0, docs };
              },
            }),
          }),
          doc: (docId: string) => ({
            get: async () => {
              const data = mockFirestoreDocs.get(`${colName}/${docId}`);
              return {
                exists: Boolean(data),
                id: docId,
                data: () => data,
              };
            },
            set: async (data: Record<string, unknown>, opts?: { merge?: boolean }) => {
              const existing = mockFirestoreDocs.get(`${colName}/${docId}`) ?? {};
              mockFirestoreDocs.set(
                `${colName}/${docId}`,
                opts?.merge ? { ...existing, ...data } : data,
              );
            },
            collection: (subCol: string) => ({
              doc: (subId: string) => ({
                set: async (data: Record<string, unknown>, opts?: { merge?: boolean }) => {
                  const fullKey = `${colName}/${docId}/${subCol}/${subId}`;
                  const existing = mockFirestoreDocs.get(fullKey) ?? {};
                  mockFirestoreDocs.set(fullKey, opts?.merge ? { ...existing, ...data } : data);
                },
              }),
            }),
          }),
        }),
      },
    }),
  };
});

const ROOT_STORE = path.join(process.cwd(), ".community-accounts.json");

describe("POST /api/auth/session", () => {
  beforeEach(async () => {
    mockFirestoreDocs.clear();
    await fs.rm(ROOT_STORE, { force: true });
  });

  afterEach(async () => {
    mockFirestoreDocs.clear();
    await fs.rm(ROOT_STORE, { force: true });
  });
  it("rejects login with invalid Indonesian phone number format", async () => {
    const req = new Request("http://localhost:3000/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "login",
        phone: "12345",
        password: "Password123!",
      }),
    });

    const res = await POST(req);
    const data = (await res.json()) as { ok?: boolean; error?: string };

    expect(res.status).toBe(400);
    expect(data.ok).toBe(false);
    expect(data.error).toMatch(/nomor/i);
  });

  it("rejects login when password is wrong for an existing community account", async () => {
    const req = new Request("http://localhost:3000/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "login",
        phone: "81210000001", // Garuda Muda FC (Password123!)
        password: "wrong-password-999",
      }),
    });

    const res = await POST(req);
    const data = (await res.json()) as { ok?: boolean; error?: string };

    expect(res.status).toBe(401);
    expect(data.ok).toBe(false);
    expect(data.error).toMatch(/kata sandi|password/i);
  });

  it("rejects login when phone is not registered even if fallbackClub is unrelated", async () => {
    const req = new Request("http://localhost:3000/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "login",
        phone: "81399998888",
        password: "wrong-password",
        fallbackClub: {
          id: "club-cipondoh-fc",
          name: "Cipondoh Fc",
          captainName: "Dzaka Eryan Septianto",
          phone: "+62819365977713",
        },
      }),
    });

    const res = await POST(req);
    const data = (await res.json()) as { ok?: boolean; error?: string };

    expect(res.status).toBe(404);
    expect(data.ok).toBe(false);
  });

  it("succeeds login when both phone and password match an existing account", async () => {
    const req = new Request("http://localhost:3000/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "login",
        phone: "0812-1000-0001",
        password: "Password123!",
      }),
    });

    const res = await POST(req);
    const data = (await res.json()) as {
      ok?: boolean;
      authenticated?: boolean;
      session?: { clubId: string };
    };

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.authenticated).toBe(true);
    expect(data.session?.clubId).toBe("club-garuda-muda");
  });

  it("checks Firestore users and clubs collections when logging in with a registered WhatsApp number", async () => {
    // Seed Firestore mock with a user & club that is NOT in .community-accounts.json
    mockFirestoreDocs.set("users/user-cipondoh", {
      name: "Dzaka Eryan Septianto",
      phoneNumber: "+62819365977713",
      clubId: "club-cipondoh-fc",
      password: "PasswordCipondoh!",
      city: "Tangerang",
    });
    mockFirestoreDocs.set("clubs/club-cipondoh-fc", {
      name: "Cipondoh FC",
      slug: "cipondoh-fc",
      city: "Tangerang",
      vision: "Maju terus Cipondoh FC",
      sportTypes: ["mini_soccer", "futsal"],
      logoUrl: null,
    });

    // 1. Login with wrong password -> must reject with 401
    const wrongReq = new Request("http://localhost:3000/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "login",
        phone: "0819365977713",
        password: "salah-password",
      }),
    });
    const wrongRes = await POST(wrongReq);
    expect(wrongRes.status).toBe(401);

    // 2. Login with correct password -> must succeed from Firestore data
    const okReq = new Request("http://localhost:3000/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "login",
        phone: "0819365977713",
        password: "PasswordCipondoh!",
      }),
    });
    const okRes = await POST(okReq);
    const okData = (await okRes.json()) as {
      ok?: boolean;
      source?: string;
      session?: { clubId: string; clubName: string };
    };

    expect(okRes.status).toBe(200);
    expect(okData.ok).toBe(true);
    expect(okData.source).toBe("firestore");
    expect(okData.session?.clubId).toBe("club-cipondoh-fc");
    expect(okData.session?.clubName).toBe("Cipondoh FC");
  });

  it("saves user, club, and member documents to Firestore when registering a new community", async () => {
    const req = new Request("http://localhost:3000/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "register",
        clubName: "Bintaro Jaya FC",
        captainName: "Rama Putra",
        phone: "081288889999",
        password: "SecretPassword123",
        city: "Tangerang Selatan",
        sports: ["Mini Soccer", "Sepak Bola"],
        motto: "Solidaritas tanpa batas",
      }),
    });

    const res = await POST(req);
    const data = (await res.json()) as { ok?: boolean; account?: { clubId: string } };

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.account?.clubId).toBe("club-bintaro-jaya-fc");

    // Verify Firestore documents were written
    const savedClub = mockFirestoreDocs.get("clubs/club-bintaro-jaya-fc");
    expect(savedClub).toBeDefined();
    expect(savedClub?.name).toBe("Bintaro Jaya FC");
    expect(savedClub?.city).toBe("Tangerang Selatan");

    const savedUser = mockFirestoreDocs.get("users/user-81288889999");
    expect(savedUser).toBeDefined();
    expect(savedUser?.phoneNumber).toBe("+6281288889999");
    expect(savedUser?.clubId).toBe("club-bintaro-jaya-fc");
  });
});
