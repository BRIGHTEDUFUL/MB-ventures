"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { toast } from "sonner";

export default function SignUpPage() {
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
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
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
      <h1 className="font-heading font-bold text-ink text-xl mb-1">
        Create account
      </h1>
      <p className="text-sm text-ink-muted mb-6">
        Already have an account?{" "}
        <Link
          href={`/auth/sign-in${redirect !== "/account" ? `?redirect=${redirect}` : ""}`}
          className="text-link underline underline-offset-2 hover:no-underline"
        >
          Sign in
        </Link>
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-ink mb-1.5"
          >
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
          <label
            htmlFor="password"
            className="block text-sm font-medium text-ink mb-1.5"
          >
            Password
            <span className="text-ink-subtle font-normal ml-1">(min. 8 characters)</span>
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full h-11 px-3 rounded-md border border-line-strong bg-surface text-ink text-sm placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-focus focus:border-focus transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !name || !email || !password}
          className="w-full h-11 rounded-md bg-ink text-white font-medium text-sm transition-opacity hover:opacity-90 active:opacity-75 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
        >
          {loading ? "Creating account…" : "Create account"}
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
