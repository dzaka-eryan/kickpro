import type {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  WithFieldValue,
} from "firebase/firestore";
import type {
  FirestoreDataConverter as AdminFirestoreDataConverter,
  QueryDocumentSnapshot as AdminQueryDocumentSnapshot,
  WithFieldValue as AdminWithFieldValue,
} from "firebase-admin/firestore";
import type { ZodType, ZodTypeDef } from "zod";
import {
  ClubDocSchema,
  EventDocSchema,
  EventSlotDocSchema,
  EventTeamDocSchema,
  LedgerEntryDocSchema,
  PaymentDocSchema,
  SparringMatchDocSchema,
  UserDocSchema,
  type ClubDoc,
  type EventDoc,
  type EventSlotDoc,
  type EventTeamDoc,
  type LedgerEntryDoc,
  type PaymentDoc,
  type SparringMatchDoc,
  type UserDoc,
} from "@kickpro/shared";

interface TimestampLike {
  toDate: () => Date;
}

function isTimestampLike(value: unknown): value is TimestampLike {
  return (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as TimestampLike).toDate === "function"
  );
}

/**
 * Mengonversi objek Timestamp Firestore atau Date di dalam data dokumen
 * menjadi string ISO-8601 agar kompatibel dengan Zod schema @kickpro/shared dan RSC.
 */
export function normalizeFirestoreValue(value: unknown): unknown {
  if (isTimestampLike(value)) {
    return value.toDate().toISOString();
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (Array.isArray(value)) {
    return value.map((item) => normalizeFirestoreValue(item));
  }
  if (typeof value === "object" && value !== null) {
    const record = value as Record<string, unknown>;
    const normalized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(record)) {
      normalized[key] = normalizeFirestoreValue(val);
    }
    return normalized;
  }
  return value;
}

export function parseFirestoreDoc<T extends { id?: string }>(
  id: string,
  rawData: Record<string, unknown>,
  schema: ZodType<T, ZodTypeDef, unknown>,
): T {
  const normalized = normalizeFirestoreValue(rawData) as Record<string, unknown>;
  return schema.parse({
    ...normalized,
    id,
  });
}

function stripDocumentId<T extends { id?: string }>(modelObject: T): DocumentData {
  const { id: _id, ...rest } = modelObject;
  return rest as DocumentData;
}

export function createClientConverter<T extends { id?: string }>(
  schema: ZodType<T, ZodTypeDef, unknown>,
): FirestoreDataConverter<T> {
  return {
    toFirestore(modelObject: WithFieldValue<T>): DocumentData {
      return stripDocumentId(modelObject as T);
    },
    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): T {
      const data = snapshot.data(options) as Record<string, unknown>;
      return parseFirestoreDoc(snapshot.id, data, schema);
    },
  };
}

export function createAdminConverter<T extends { id?: string }>(
  schema: ZodType<T, ZodTypeDef, unknown>,
): AdminFirestoreDataConverter<T> {
  return {
    toFirestore(modelObject: AdminWithFieldValue<T>): DocumentData {
      return stripDocumentId(modelObject as T);
    },
    fromFirestore(snapshot: AdminQueryDocumentSnapshot): T {
      const data = snapshot.data() as Record<string, unknown>;
      return parseFirestoreDoc(snapshot.id, data, schema);
    },
  };
}

export const clientConverters = {
  user: createClientConverter<UserDoc>(UserDocSchema),
  club: createClientConverter<ClubDoc>(ClubDocSchema),
  ledger: createClientConverter<LedgerEntryDoc>(LedgerEntryDocSchema),
  event: createClientConverter<EventDoc>(EventDocSchema),
  eventTeam: createClientConverter<EventTeamDoc>(EventTeamDocSchema),
  eventSlot: createClientConverter<EventSlotDoc>(EventSlotDocSchema),
  payment: createClientConverter<PaymentDoc>(PaymentDocSchema),
  sparringMatch: createClientConverter<SparringMatchDoc>(SparringMatchDocSchema),
};

export const adminConverters = {
  user: createAdminConverter<UserDoc>(UserDocSchema),
  club: createAdminConverter<ClubDoc>(ClubDocSchema),
  ledger: createAdminConverter<LedgerEntryDoc>(LedgerEntryDocSchema),
  event: createAdminConverter<EventDoc>(EventDocSchema),
  eventTeam: createAdminConverter<EventTeamDoc>(EventTeamDocSchema),
  eventSlot: createAdminConverter<EventSlotDoc>(EventSlotDocSchema),
  payment: createAdminConverter<PaymentDoc>(PaymentDocSchema),
  sparringMatch: createAdminConverter<SparringMatchDoc>(SparringMatchDocSchema),
};
