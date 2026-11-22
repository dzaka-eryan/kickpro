import * as Sentry from "@sentry/node";
import type { onRequest } from "firebase-functions/v2/https";
import { logError } from "./logger.js";

type HttpsHandler = Parameters<typeof onRequest>[0];
type HttpsRequest = Parameters<HttpsHandler>[0];
type HttpsResponse = Parameters<HttpsHandler>[1];

let sentryInitialized = false;

export function initFunctionsSentry(): void {
  if (sentryInitialized) {
    return;
  }

  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV ?? "development",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
  });

  sentryInitialized = true;
}

export function captureFunctionsError(
  error: unknown,
  context: { service: string; [key: string]: unknown },
): void {
  initFunctionsSentry();
  logError(`Unhandled error in ${context.service}`, error, context);

  if (process.env.SENTRY_DSN) {
    Sentry.withScope((scope) => {
      scope.setTag("service", context.service);
      scope.setExtras(context);
      Sentry.captureException(error);
    });
  }
}

export function withSentryMonitor(
  fnName: string,
  handler: (req: HttpsRequest, res: HttpsResponse) => Promise<void> | void,
): HttpsHandler {
  initFunctionsSentry();

  return async (req: HttpsRequest, res: HttpsResponse): Promise<void> => {
    try {
      await handler(req, res);
    } catch (error) {
      captureFunctionsError(error, {
        service: fnName,
        method: req.method,
        path: req.path,
      });
      await Sentry.flush(2000);
      if (!res.headersSent) {
        res.status(500).json({
          ok: false,
          error: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : "Terjadi kesalahan internal server",
        });
      }
    }
  };
}
