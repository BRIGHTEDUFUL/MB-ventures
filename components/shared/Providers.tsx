"use client";

import type { ReactNode } from "react";
import { ConvexClientProvider } from "@/components/shared/ConvexClientProvider";
import { Toaster } from "sonner";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ConvexClientProvider>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          className:
            "border border-line bg-surface text-ink rounded-md shadow-md text-sm font-sans",
        }}
      />
    </ConvexClientProvider>
  );
}
