import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-6 text-ink">
      <div className="max-w-md w-full bg-surface rounded-lg border border-line p-8 text-center">
        <div className="w-10 h-10 rounded-md bg-canvas flex items-center justify-center mx-auto mb-4 text-ink">
          <FileQuestion className="w-5 h-5" strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-heading font-semibold text-ink mb-2">Page not found</h2>
        <p className="text-ink-muted text-sm mb-6 leading-relaxed">
          The requested page could not be found or may have moved.
        </p>
        <Link
          href="/"
          className={buttonVariants({ variant: "secondary", size: "md" })}
        >
          <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={1.5} />
          Return to shop
        </Link>
      </div>
    </div>
  );
}
