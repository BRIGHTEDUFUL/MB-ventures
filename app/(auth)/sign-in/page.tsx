"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

function SignInForm() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      await signIn("password", { email, password, flow: "signIn" });
      router.push(redirect);
    } catch {
      toast.error("Incorrect email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-surface border border-line rounded-lg p-6 sm:p-8">
      {/* Heading */}
      <h1 className="font-heading font-bold text-ink text-xl mb-1">
        Sign in
      </h1>
      <p className="text-sm text-ink-muted mb-6">
        Don&apos;t have an account?{" "}
        <Link
          href={`/sign-up${redirect !== "/account" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
          className="text-link underline underline-offset-2 hover:no-underline"
        >
          Create one
        </Link>
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-ink mb-1.5"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full h-11 px-3 rounded-md border border-line-strong bg-surface text-ink text-sm placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-focus focus:border-focus transition-colors"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-ink"
            >
              Password
            </label>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full h-11 px-3 rounded-md border border-line-strong bg-surface text-ink text-sm placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-focus focus:border-focus transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="w-full h-11 rounded-md bg-ink text-white font-medium text-sm transition-opacity hover:opacity-90 active:opacity-75 disabled:opacity-40 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{loading ? "Signing in…" : "Sign in"}</span>
        </button>
      </form>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-surface border border-line rounded-lg p-8 text-center text-sm text-ink-muted">
          Loading sign-in...
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
