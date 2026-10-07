"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

/**
 * Returns the current authenticated user, or null if signed out.
 * Loading state is represented as `undefined`.
 *
 * Usage:
 *   const user = useCurrentUser();
 *   if (user === undefined) return <Skeleton />;  // loading
 *   if (user === null) return <SignInLink />;      // signed out
 *   return <p>Hello, {user.name}</p>;             // signed in
 */
export function useCurrentUser() {
  return useQuery(api.users.currentUser);
}
