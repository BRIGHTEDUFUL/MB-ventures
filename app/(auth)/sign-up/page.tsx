"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

/** Returns the first rule the password breaks, or null when it passes. */
function passwordProblem(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return "Password must include at least one letter and one number.";
  }
  return null;
}

function SignUpForm() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/account";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) return;
    const problem = passwordProblem(password);
    if (problem) {
      toast.error(problem);
      return;
    }
    setLoading(true);
    try {
      await signIn("password", { name, email, password, flow: "signUp" });
      router.push(redirect);
    } catch (err) {
      const message =
        err instanceof Error && err.message.includes("already")
          ? "An account with that email already exists. Try signing in."
          : "Could not create account. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-surface border border-line rounded-lg p-6 sm:p-8">
      {/* Heading */}
      <h1 className="font-heading font-bold text-ink text-xl mb-1">Create account</h1>
      <p className="text-sm text-ink-muted mb-6">
        Already have an account?{" "}
        <Link
          href={`/sign-in${redirect !== "/account" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
          className="text-link underline underline-offset-2 hover:no-underline"
        >
          Sign in
        </Link>
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-ink mb-1.5">
            Full name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Kwame Mensah"
            className="w-full h-11 px-3 rounded-md border border-line-strong bg-surface text-ink text-sm placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-focus focus:border-focus transition-colors"
          />
        </div>

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
            className="w-full h-11 px-3 rounded-md border border-line-strong bg-surface text-ink text-sm placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-focus focus:border-focus transition-colors"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink mb-1.5">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            aria-describedby="password-help"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full h-11 px-3 rounded-md border border-line-strong bg-surface text-ink text-sm placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-focus focus:border-focus transition-colors"
          />
          <p id="password-help" className="text-xs text-ink-subtle mt-1.5">
            Use at least 8 characters, including a letter and a number.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !name || !email || !password}
          className="w-full h-11 rounded-md bg-brand text-white font-medium text-sm transition-opacity hover:opacity-90 active:opacity-75 disabled:opacity-40 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{loading ? "Creating account…" : "Create account"}</span>
        </button>
      </form>

      <p className="text-xs text-ink-subtle mt-5 text-center leading-relaxed">
        By creating an account you agree to our{" "}
        <Link href="/terms" className="underline hover:no-underline">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline hover:no-underline">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-surface border border-line rounded-lg p-8 text-center text-sm text-ink-muted">
          Loading sign-up...
        </div>
      }
    >
      <SignUpForm />
    </Suspense>
  );
}
