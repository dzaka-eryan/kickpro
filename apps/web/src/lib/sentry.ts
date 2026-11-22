import * as Sentry from "@sentry/nextjs";

export function captureWebError(
  error: unknown,
  context?: Record<string, unknown>,
): string | null {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN;
  if (!dsn) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[Sentry Dev Mock] Error captured:", error, context);
    }
    return null;
  }

  return Sentry.withScope((scope) => {
    if (context) {
      scope.setExtras(context);
    }
    return Sentry.captureException(error);
  });
}
