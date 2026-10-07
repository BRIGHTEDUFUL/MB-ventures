"use client";

import { Container } from "@/components/shared/Container";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-[100dvh] flex items-center justify-center bg-surface font-sans text-ink antialiased p-4">
        <Container size="narrow" className="text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-ink-muted mb-3">Error</p>
          <h1 className="font-heading font-bold tracking-tight mb-3">Something went wrong</h1>
          <p className="text-ink-muted text-sm mb-6 max-w-xs mx-auto">
            An unexpected error occurred. Please try again.
            {error.digest && (
              <span className="block mt-1 font-mono text-xs text-ink-subtle">
                Ref: {error.digest}
              </span>
            )}
          </p>
          <button
            onClick={reset}
            className="inline-flex items-center justify-center h-11 px-5 rounded-md bg-brand text-white font-medium text-sm transition-opacity hover:opacity-90 active:opacity-75"
          >
            Try again
          </button>
        </Container>
      </body>
    </html>
  );
}
