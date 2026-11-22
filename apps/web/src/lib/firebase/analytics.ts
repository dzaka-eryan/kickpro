"use client";

import { getAnalytics, isSupported, logEvent, type Analytics } from "firebase/analytics";
import { getFirebaseClient } from "./client";

let analyticsPromise: Promise<Analytics | null> | null = null;

export async function getFirebaseAnalyticsClient(): Promise<Analytics | null> {
  if (typeof window === "undefined") {
    return null;
  }
  if (!process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) {
    return null;
  }

  if (!analyticsPromise) {
    analyticsPromise = isSupported()
      .then((supported) => {
        if (!supported) {
          return null;
        }
        const { app } = getFirebaseClient();
        return getAnalytics(app);
      })
      .catch(() => null);
  }

  return analyticsPromise;
}

export async function trackAnalyticsEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>,
): Promise<void> {
  const analytics = await getFirebaseAnalyticsClient();
  if (!analytics) {
    return;
  }
  logEvent(analytics, eventName, params);
}
