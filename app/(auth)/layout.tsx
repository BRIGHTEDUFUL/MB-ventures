import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Container } from "@/components/shared/Container";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-canvas flex flex-col">
      {/* Minimal header */}
      <header className="border-b border-line bg-surface">
        <Container className="h-14 flex items-center">
          <Link href="/" className="font-heading font-semibold text-ink text-base tracking-tight">
            MB Ventures GH
          </Link>
        </Container>
      </header>

      {/* Form area */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">{children}</div>
      </main>

      {/* Minimal footer */}
      <footer className="border-t border-line bg-surface py-4">
        <Container className="text-center text-xs text-ink-subtle">
          © {new Date().getFullYear()} MB Ventures GH
        </Container>
      </footer>
    </div>
  );
}
