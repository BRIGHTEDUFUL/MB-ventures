/**
 * Email queries for checking limits, duplicates, and suppression.
 */

import { v } from "convex/values";
import { internalQuery } from "../_generated/server";

/**
 * Check if email is suppressed.
 */
export const isEmailSuppressed = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args): Promise<boolean> => {
    const suppressed = await ctx.db
      .query("suppressedEmails")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    return !!suppressed;
  },
});

/**
 * Check for duplicate email (same template + orderId within time window).
 */
export const checkDuplicate = internalQuery({
  args: {
    template: v.string(),
    orderId: v.id("orders"),
    withinSeconds: v.number(),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const cutoff = Date.now() - args.withinSeconds * 1000;

    const existing = await ctx.db
      .query("emailLogs")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .filter((q) =>
        q.and(
          q.eq(q.field("template"), args.template),
          q.gte(q.field("createdAt"), cutoff)
        )
      )
      .first();

    return !!existing;
  },
});

/**
 * Get count of emails sent today.
 */
export const getTodaysSentCount = internalQuery({
  args: {},
  handler: async (ctx): Promise<number> => {
    const now = Date.now();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const startOfDay = todayStart.getTime();

    const logs = await ctx.db
      .query("emailLogs")
      .withIndex("by_created")
      .filter((q) =>
        q.and(
          q.gte(q.field("createdAt"), startOfDay),
          q.or(
            q.eq(q.field("status"), "sent"),
            q.eq(q.field("status"), "skipped_dry_run")
          )
        )
      )
      .collect();

    return logs.length;
  },
});

/**
 * Check if daily limit notification was already sent today.
 */
export const checkLimitNotificationToday = internalQuery({
  args: {},
  handler: async (ctx): Promise<boolean> => {
    const now = Date.now();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const startOfDay = todayStart.getTime();

    const notification = await ctx.db
      .query("emailLogs")
      .withIndex("by_created")
      .filter((q) =>
        q.and(
          q.gte(q.field("createdAt"), startOfDay),
          q.eq(q.field("template"), "dailyLimitReached")
        )
      )
      .first();

    return !!notification;
  },
});

/**
 * Get email log by provider message ID (for webhooks).
 */
export const getEmailLogByProviderId = internalQuery({
  args: { providerMessageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("emailLogs")
      .withIndex("by_provider_message_id", (q) =>
        q.eq("providerMessageId", args.providerMessageId)
      )
      .first();
  },
});
