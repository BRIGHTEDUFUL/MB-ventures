"use client";

import type { ReactNode } from "react";
import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ConvexReactClient } from "convex/react";
import { Toaster } from "sonner";

const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL as string
);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ConvexAuthNextjsProvider client={convex}>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          className:
            "border border-line bg-surface text-ink rounded-md shadow-md text-sm font-sans",
        }}
      />
    </ConvexAuthNextjsProvider>
  );
}
