"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="id">
      <body className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-slate-900">
        <main className="max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Terjadi Kendala Teknis</h1>
          <p className="mt-2 text-sm text-slate-600">
            Tim kami sudah menerima laporan kendala ini. Silakan muat ulang halaman.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            Coba Lagi
          </button>
        </main>
      </body>
    </html>
  );
}
