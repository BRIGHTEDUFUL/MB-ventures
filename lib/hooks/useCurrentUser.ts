"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

/**
 * Returns user info, auth status, and loading state.
 *
 * Usage:
 *   const { user, isAuthenticated, isLoading } = useCurrentUser();
 */
export function useCurrentUser() {
  const user = useQuery(api.users.currentUser);
  return {
    user: user ?? null,
    isAuthenticated: !!user,
    isLoading: user === undefined,
  };
}
