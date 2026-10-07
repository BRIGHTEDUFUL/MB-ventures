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
    }),
  ],
});
