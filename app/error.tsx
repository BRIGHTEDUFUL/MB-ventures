"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-6 text-ink">
      <div className="max-w-md w-full bg-surface rounded-lg border border-line p-8 text-center">
        <div className="w-10 h-10 rounded-md bg-danger-soft text-danger flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-5 h-5" strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-heading font-semibold text-ink mb-2">
          Unable to load page
        </h2>
        <p className="text-ink-muted text-sm mb-6 leading-relaxed">
          An error occurred while loading this content. Refresh the page to try again.
        </p>
        <Button
          onClick={() => reset()}
          variant="secondary"
          size="md"
        >
          <RotateCcw className="w-4 h-4 mr-2" strokeWidth={1.5} />
          Try again
        </Button>
      </div>
    </div>
  );
}
