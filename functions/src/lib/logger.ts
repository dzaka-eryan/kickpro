import * as logger from "firebase-functions/logger";
import { FIREBASE_DEFAULT_REGION } from "@kickpro/shared";

export interface LogContext {
  service: string;
  region?: string;
  clubId?: string;
  eventId?: string;
  userId?: string;
  [key: string]: unknown;
}

function buildPayload(context: LogContext): Record<string, unknown> {
  return {
    region: FIREBASE_DEFAULT_REGION,
    ...context,
    timestamp: new Date().toISOString(),
  };
}

export function logInfo(message: string, context: LogContext): void {
  logger.info(message, buildPayload(context));
}

export function logWarn(message: string, context: LogContext): void {
  logger.warn(message, buildPayload(context));
}

export function logError(message: string, error: unknown, context: LogContext): void {
  const errInfo =
    error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack }
      : { raw: String(error) };

  logger.error(message, {
    ...buildPayload(context),
    error: errInfo,
  });
}

export function logAudit(action: string, context: LogContext): void {
  logger.info(`[AUDIT] ${action}`, {
    ...buildPayload(context),
    audit: true,
    action,
  });
}
