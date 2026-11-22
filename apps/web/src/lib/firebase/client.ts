import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import {
  collection,
  connectFirestoreEmulator,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
  type Firestore,
  type Unsubscribe,
} from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions, type Functions } from "firebase/functions";
import { connectStorageEmulator, getStorage, type FirebaseStorage } from "firebase/storage";
import {
  COLLECTION_NAMES,
  FIREBASE_DEFAULT_REGION,
  type ClubDoc,
  type EventDoc,
  type EventSlotDoc,
} from "@kickpro/shared";
import { clientConverters } from "./converters";

export interface FirebaseClientServices {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
  functions: Functions;
}

const globalForFirebase = globalThis as unknown as {
  __kickproEmulatorsConnected?: boolean;
};

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "demo-kickpro.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "demo-kickpro",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "demo-kickpro.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "000000000000",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:000000000000:web:kickprodemo",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || undefined,
};

function shouldUseEmulator(): boolean {
  if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "false") {
    return false;
  }
  return (
    process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true" ||
    process.env.NODE_ENV !== "production"
  );
}

export function getFirebaseClient(): FirebaseClientServices {
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);
  const functions = getFunctions(
    app,
    process.env.NEXT_PUBLIC_FIREBASE_REGION ?? FIREBASE_DEFAULT_REGION,
  );

  if (typeof window !== "undefined" && shouldUseEmulator() && !globalForFirebase.__kickproEmulatorsConnected) {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
    connectStorageEmulator(storage, "127.0.0.1", 9199);
    connectFunctionsEmulator(functions, "127.0.0.1", 5001);
    globalForFirebase.__kickproEmulatorsConnected = true;
  }

  return { app, auth, db, storage, functions };
}

/**
 * Membaca daftar event mabar berstatus "open" dari sisi Client SDK dengan tipe EventDoc.
 */
export async function fetchOpenEventsClient(maxItems = 10): Promise<EventDoc[]> {
  const { db } = getFirebaseClient();
  const eventsRef = collection(db, COLLECTION_NAMES.events).withConverter(clientConverters.event);
  const q = query(
    eventsRef,
    where("status", "==", "open"),
    orderBy("startAt", "asc"),
    limit(maxItems),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => docSnap.data());
}

/**
 * Listener realtime koleksi `events` berstatus "open" dengan tipe EventDoc.
 */
export function subscribeOpenEventsClient(
  onData: (events: EventDoc[]) => void,
  onError?: (error: Error) => void,
  maxItems = 10,
): Unsubscribe {
  const { db } = getFirebaseClient();
  const eventsRef = collection(db, COLLECTION_NAMES.events).withConverter(clientConverters.event);
  const q = query(
    eventsRef,
    where("status", "==", "open"),
    orderBy("startAt", "asc"),
    limit(maxItems),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      onData(snapshot.docs.map((docSnap) => docSnap.data()));
    },
    (error) => {
      if (onError) {
        onError(error);
      }
    },
  );
}

/**
 * Membaca daftar klub/komunitas dari koleksi `clubs` menggunakan Client SDK.
 */
export async function fetchClubsClient(maxItems = 20): Promise<ClubDoc[]> {
  const { db } = getFirebaseClient();
  const clubsRef = collection(db, COLLECTION_NAMES.clubs).withConverter(clientConverters.club);
  const q = query(clubsRef, limit(maxItems));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => docSnap.data());
}

/**
 * Membaca detail satu event beserta daftar slot dari koleksi `events/{eventId}` dan `events/{eventId}/slots`.
 */
export async function fetchEventWithSlotsClient(
  eventId: string,
): Promise<{ event: EventDoc; slots: EventSlotDoc[] } | null> {
  const { db } = getFirebaseClient();
  const eventRef = doc(db, COLLECTION_NAMES.events, eventId).withConverter(clientConverters.event);
  const eventSnap = await getDoc(eventRef);
  if (!eventSnap.exists()) {
    return null;
  }

  const slotsRef = collection(
    db,
    COLLECTION_NAMES.events,
    eventId,
    COLLECTION_NAMES.slots,
  ).withConverter(clientConverters.eventSlot);
  const slotsQuery = query(slotsRef, orderBy("slotNumber", "asc"));
  const slotsSnap = await getDocs(slotsQuery);

  return {
    event: eventSnap.data(),
    slots: slotsSnap.docs.map((s) => s.data()),
  };
}
