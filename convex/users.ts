import { v } from "convex/values";
import {
  internalMutation,
  mutation,
  query,
  type QueryCtx,
  type MutationCtx,
} from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Internal mutation called by Convex Auth after a user signs up.
 * Creates the user row with role "customer" and timestamps it.
 */
export const createUser = internalMutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      name: args.name,
      email: args.email,
      phone: args.phone,
      role: "customer",
      createdAt: Date.now(),
    });
  },
});

/**
 * Returns the currently authenticated user's public profile, or null if not signed in.
 * Safe to call from any client component — returns only public-safe fields.
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };
  },
});

/**
 * Update the signed-in user's own profile (name and phone only).
 * Email changes go through the auth provider flow, not here.
 */
export const updateProfile = mutation({
  args: {
    name: v.string(),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.patch(userId, {
      name: args.name.trim(),
      phone: args.phone?.trim(),
    });
  },
});

/**
 * Internal mutation to promote a user to admin by email.
 * Callable from Convex dashboard or dev scripts.
 */
export const makeAdmin = internalMutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.trim().toLowerCase()))
      .first();

    if (!user) {
      throw new Error(`User with email "${args.email}" not found.`);
    }

    await ctx.db.patch(user._id, {
      role: "admin",
    });

    return { success: true, userId: user._id };
  },
});

/**
 * Internal mutation to demote an admin user to customer role.
 */
export const makeCustomer = internalMutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.trim().toLowerCase()))
      .first();

    if (!user) {
      throw new Error(`User with email "${args.email}" not found.`);
    }

    await ctx.db.patch(user._id, {
      role: "customer",
    });

    return { success: true, userId: user._id };
  },
});

/**
 * Require an authenticated user — throws if not signed in.
 * Import and call from other Convex functions (not a callable function itself).
 */
export async function requireUser(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const user = await ctx.db.get(userId);
  if (!user) throw new Error("User not found");
  return { userId, user };
}

/**
 * Require an admin user — throws if not signed in or not admin.
 */
export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const { userId, user } = await requireUser(ctx);
  if (user.role !== "admin") throw new Error("Not authorized: Admin access required.");
  return { userId, user };
}

