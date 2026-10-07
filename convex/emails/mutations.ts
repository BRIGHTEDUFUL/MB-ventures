/**
 * Email mutations for logging and state management.
 */

import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

/**
 * Create email log entry.
 */
export const logEmail = internalMutation({
  args: {
    to: v.string(),
    subject: v.string(),
    template: v.string(),
    status: v.union(
      v.literal("queued"),
      v.literal("sent"),
      v.literal("failed"),
      v.literal("skipped_dry_run")
    ),
    provider: v.union(v.literal("resend"), v.literal("none")),
    providerMessageId: v.optional(v.string()),
    error: v.optional(v.string()),
    orderId: v.optional(v.id("orders")),
    html: v.optional(v.string()),
    text: v.optional(v.string()),
    attempts: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args): Promise<Id<"emailLogs">> => {
    return await ctx.db.insert("emailLogs", args);
  },
});

/**
 * Update email log status.
 */
export const updateEmailLog = internalMutation({
  args: {
    logId: v.id("emailLogs"),
    status: v.union(
      v.literal("sent"),
      v.literal("failed"),
      v.literal("skipped_dry_run"),
      v.literal("delivered"),
      v.literal("bounced"),
      v.literal("complained")
    ),
    providerMessageId: v.optional(v.string()),
    error: v.optional(v.string()),
    attempts: v.number(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const { logId, ...updates } = args;
    await ctx.db.patch(logId, updates);
  },
});

/**
 * Add email to suppression list.
 */
export const suppressEmail = internalMutation({
  args: {
    email: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if already suppressed
    const existing = await ctx.db
      .query("suppressedEmails")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!existing) {
      await ctx.db.insert("suppressedEmails", {
        email: args.email,
        reason: args.reason,
        createdAt: Date.now(),
      });
    }
  },
});
