"use client";

import { ReactNode } from "react";
import { ConvexClientProvider } from "@/components/shared/ConvexClientProvider";
import { Toaster } from "sonner";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ConvexClientProvider>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </ConvexClientProvider>
  );
}
