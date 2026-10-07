"use client";

import type { ReactNode } from "react";
import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ConvexReactClient } from "convex/react";
import { Toaster } from "sonner";

import { CartProvider } from "@/lib/cart/CartContext";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL as string);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ConvexAuthNextjsProvider client={convex}>
      <CartProvider>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            className:
              "border border-line bg-surface text-ink rounded-md shadow-layer text-sm font-sans",
          }}
        />
      </CartProvider>
    </ConvexAuthNextjsProvider>
  );
}
