import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../../../../");
const firestoreRules = readFileSync(path.join(REPO_ROOT, "firestore.rules"), "utf8");
const storageRules = readFileSync(path.join(REPO_ROOT, "storage.rules"), "utf8");

describe("Security Rules static baseline assertions (T-005)", () => {
  it("defines deny-by-default fallback in firestore.rules and storage.rules", () => {
    expect(firestoreRules).toContain("match /{document=**}");
    expect(firestoreRules).toContain("allow read, write: if false;");
    expect(storageRules).toContain("match /{allPaths=**}");
    expect(storageRules).toContain("allow read, write: if false;");
  });

  it("includes required auth and club role helper functions", () => {
    expect(firestoreRules).toContain("function isSignedIn()");
    expect(firestoreRules).toContain("function isOwner(userId)");
    expect(firestoreRules).toContain("function isClubMember(clubId)");
    expect(firestoreRules).toContain("function isClubRole(clubId, roles)");
  });

  it("blocks client writes on financial, ledger, payment, and slot status fields", () => {
    expect(firestoreRules).toContain("'walletBalance'");
    expect(firestoreRules).toContain("'escrowBalance'");
    expect(firestoreRules).toMatch(/match \/ledger\/\{entryId\}[\s\S]*?allow write: if false;/);
    expect(firestoreRules).toMatch(/match \/slots\/\{slotId\}[\s\S]*?allow write: if false;/);
    expect(firestoreRules).toMatch(/match \/payments\/\{paymentId\}[\s\S]*?allow write: if false;/);
  });

  it("prevents users from modifying attendanceScore, stats, or platformRole directly", () => {
    expect(firestoreRules).toContain("'attendanceScore'");
    expect(firestoreRules).toContain("'stats'");
    expect(firestoreRules).toContain("'platformRole'");
  });

  it("restricts storage image uploads to authenticated users and < 5MB", () => {
    expect(storageRules).toContain("request.resource.size < 5 * 1024 * 1024");
    expect(storageRules).toContain("request.resource.contentType.matches('image/.*')");
  });
});
