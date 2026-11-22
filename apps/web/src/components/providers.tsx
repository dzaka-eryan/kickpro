"use client";

import * as React from "react";
import { getFirebaseAnalyticsClient } from "@/lib/firebase/analytics";
import { ToastProvider } from "@/components/ui/toast";

export function AppProviders({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    void getFirebaseAnalyticsClient();
  }, []);

  return <ToastProvider>{children}</ToastProvider>;
}
