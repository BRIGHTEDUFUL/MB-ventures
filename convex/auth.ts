import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    // Email + password — the primary auth method.
    // Simple, works on every device, no third-party OAuth required.
    //
    // `profile` is what gets written to the `users` table. The provider's
    // default is `{ email }` only, which fails schema validation because
    // `role` and `createdAt` are required — sign-up returned 400 until every
    // required field was supplied here. It also normalises the email so the
    // account id matches on later sign-ins.
    Password({
      profile: (params) => {
        const name = typeof params.name === "string" ? params.name.trim() : "";
        return {
          email: String(params.email ?? "")
            .trim()
            .toLowerCase(),
          ...(name ? { name } : {}),
          role: "customer" as const,
          createdAt: Date.now(),
        };
      },
      // Replaces the provider's default (length >= 8 only). Runs on the
      // "signUp" and "reset-verification" flows, so existing accounts whose
      // passwords predate this rule can still sign in.
      validatePasswordRequirements: (password) => {
        if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
          throw new Error(
            "Password must be at least 8 characters and include a letter and a number."
          );
        }
      },
    }),
  ],
});
