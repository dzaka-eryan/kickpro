import "server-only";

import { cert, getApp, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";
import { COLLECTION_NAMES, type EventDoc } from "@kickpro/shared";
import { adminConverters } from "./converters";

export interface FirebaseAdminServices {
  adminApp: App;
  adminAuth: Auth;
  adminDb: Firestore;
  adminStorage: Storage;
}

function configureEmulatorEnvIfLocal(): void {
  const useEmulator =
    process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true" ||
    (process.env.NODE_ENV !== "production" &&
      process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR !== "false");

  if (useEmulator) {
    process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";
    process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099";
    process.env.FIREBASE_STORAGE_EMULATOR_HOST ??= "127.0.0.1:9199";
  }
}

export function getFirebaseAdmin(): FirebaseAdminServices {
  configureEmulatorEnvIfLocal();

  let adminApp: App;
  if (getApps().length > 0) {
    adminApp = getApp();
  } else {
    const projectId =
      process.env.FIREBASE_PROJECT_ID ??
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??
      "demo-kickpro";
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (clientEmail && privateKey) {
      adminApp = initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
        projectId,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    } else {
      adminApp = initializeApp({
        projectId,
        storageBucket:
          process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? `${projectId}.appspot.com`,
      });
    }
  }

  return {
    adminApp,
    adminAuth: getAuth(adminApp),
    adminDb: getFirestore(adminApp),
    adminStorage: getStorage(adminApp),
  };
}

/**
 * Membaca daftar event mabar berstatus "open" di Server Component / Route Handler
 * dengan Firestore converter bertipe EventDoc dari @kickpro/shared.
 */
export async function getOpenEventsServer(
  maxItems = 10,
  timeoutMs = 1500,
): Promise<{ events: EventDoc[]; source: "firestore" | "unavailable" }> {
  try {
    const { adminDb } = getFirebaseAdmin();
    const queryPromise = adminDb
      .collection(COLLECTION_NAMES.events)
      .withConverter(adminConverters.event)
      .where("status", "==", "open")
      .orderBy("startAt", "asc")
      .limit(maxItems)
      .get();

    const timeoutPromise = new Promise<never>((_, reject) => {
      const timer = setTimeout(() => {
        reject(new Error("Firestore server read timed out"));
      }, timeoutMs);
      if (typeof timer === "object" && "unref" in timer) {
        timer.unref();
      }
    });

    const snapshot = await Promise.race([queryPromise, timeoutPromise]);

    return {
      events: snapshot.docs.map((docSnap) => docSnap.data()),
      source: "firestore",
    };
  } catch {
    return {
      events: [],
      source: "unavailable",
    };
  }
}

export async function getEventByIdServer(
  eventId: string,
  timeoutMs = 1500,
): Promise<EventDoc | null> {
  try {
    const { adminDb } = getFirebaseAdmin();
    const docPromise = adminDb
      .collection(COLLECTION_NAMES.events)
      .withConverter(adminConverters.event)
      .doc(eventId)
      .get();

    const timeoutPromise = new Promise<never>((_, reject) => {
      const timer = setTimeout(() => {
        reject(new Error("Firestore server doc read timed out"));
      }, timeoutMs);
      if (typeof timer === "object" && "unref" in timer) {
        timer.unref();
      }
    });

    const docSnap = await Promise.race([docPromise, timeoutPromise]);

    return docSnap.exists ? (docSnap.data() ?? null) : null;
  } catch {
    return null;
  }
}
