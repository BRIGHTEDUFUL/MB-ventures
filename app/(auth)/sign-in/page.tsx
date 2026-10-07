"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const inputClass =
  "w-full h-11 px-3 rounded-md border border-line-strong bg-surface text-sm text-ink placeholder:text-ink-subtle transition-colors duration-120 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

function SignInForm() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email || !password) return;
    setLoading(true);
    try {
      await signIn("password", { email, password, flow: "signIn" });
      router.push(redirect);
    } catch {
      const message = "Incorrect email or password. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-surface border border-line rounded-lg p-6 sm:p-8">
      {/* Heading */}
      <h1 className="font-heading font-bold text-ink text-xl mb-1">Sign in</h1>
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
          <label htmlFor="email" className="block text-sm font-medium text-ink mb-1.5">
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
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`${inputClass} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center rounded-md text-ink-muted hover:text-ink transition-colors duration-120 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
              ) : (
                <Eye className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-brand text-sm font-medium text-white transition-colors duration-120 ease-snap hover:bg-brand-hover active:bg-brand-active disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          {loading && (
            <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} aria-hidden="true" />
          )}
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
