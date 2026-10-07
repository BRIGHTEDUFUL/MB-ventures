import Link from "next/link";
import { Container } from "@/components/shared/Container";

export default function NotFound() {
  return (
    <main className="min-h-[100dvh] flex items-center justify-center bg-surface py-12">
      <Container size="narrow" className="text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-muted mb-3">404</p>
        <h1 className="font-heading font-bold tracking-tight mb-3">Page not found</h1>
        <p className="text-ink-muted text-sm mb-6 max-w-xs mx-auto">
          That page doesn&apos;t exist or may have moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center h-11 px-5 rounded-md bg-brand text-white font-medium text-sm transition-opacity hover:opacity-90 active:opacity-75"
        >
          Back to store
        </Link>
      </Container>
    </main>
  );
}
