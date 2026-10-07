import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    // Email + password — the primary auth method.
    // Simple, works on every device, no third-party OAuth required.
    Password,
  ],
});
