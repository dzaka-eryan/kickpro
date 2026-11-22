import { getApps, initializeApp } from "firebase-admin/app";
import { setGlobalOptions } from "firebase-functions/v2";
import { onRequest } from "firebase-functions/v2/https";
import { FIREBASE_DEFAULT_REGION } from "@kickpro/shared";
import { logInfo } from "./lib/logger.js";
import { initFunctionsSentry, withSentryMonitor } from "./lib/sentry.js";

if (getApps().length === 0) {
  initializeApp();
}

initFunctionsSentry();

setGlobalOptions({
  region: FIREBASE_DEFAULT_REGION,
  maxInstances: 10,
});

export const healthcheck = onRequest(
  withSentryMonitor("healthcheck", async (_req, res) => {
    logInfo("Healthcheck dipanggil", { service: "healthcheck" });
    res.status(200).json({
      ok: true,
      service: "kickpro-functions",
      region: FIREBASE_DEFAULT_REGION,
      timestamp: new Date().toISOString(),
    });
  }),
);

/**
 * Endpoint uji error Sentry di lingkungan non-production (T-008).
 */
export const sentryTestError = onRequest(
  withSentryMonitor("sentryTestError", async (_req, res) => {
    const env = process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV ?? "development";
    if (env === "production") {
      res.status(403).json({
        ok: false,
        message: "Endpoint uji error dinonaktifkan di production.",
      });
      return;
    }

    throw new Error("KickPro Functions intentional Sentry test error (T-008)");
  }),
);
