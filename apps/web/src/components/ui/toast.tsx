"use client";

import * as React from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "default" | "success" | "warning" | "error";

export interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastItem extends ToastInput {
  id: string;
}

interface ToastContextValue {
  toast: (input: ToastInput) => void;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast harus dipanggil di dalam ToastProvider");
  }
  return ctx;
}

const VARIANT_STYLE: Record<ToastVariant, string> = {
  default: "border-border bg-card text-foreground",
  success: "border-emerald-300 bg-emerald-50 text-emerald-950",
  warning: "border-amber-300 bg-amber-50 text-amber-950",
  error: "border-rose-300 bg-rose-50 text-rose-950",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback(
    (input: ToastInput) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { ...input, id }]);
      setTimeout(() => {
        dismiss(id);
      }, 4500);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div
        role="region"
        aria-label="Notifikasi"
        aria-live="polite"
        className="pointer-events-none fixed bottom-20 right-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 md:bottom-6"
      >
        {toasts.map((item) => {
          const variant = item.variant ?? "default";
          return (
            <div
              key={item.id}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg",
                VARIANT_STYLE[variant],
              )}
            >
              {variant === "success" && (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" />
              )}
              {variant === "warning" && (
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
              )}
              {variant === "error" && (
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-700" aria-hidden="true" />
              )}
              {variant === "default" && (
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-slate-700" aria-hidden="true" />
              )}
              <div className="flex-1 text-sm">
                <p className="font-semibold">{item.title}</p>
                {item.description && (
                  <p className="mt-0.5 text-xs opacity-90">{item.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                aria-label="Tutup notifikasi"
                className="rounded-md p-1 opacity-75 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
