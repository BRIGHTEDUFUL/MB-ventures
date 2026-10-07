/**
 * Admin queries for email logs and management.
 */

import { v } from "convex/values";
import { query } from "../_generated/server";
import { requireAdmin } from "../users";
import { getEmailConfig } from "./config";

/**
 * Admin Query: Get email system status and recent logs.
 */
export const getEmailStatus = query({
  args: {
    limit: v.optional(v.number()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const config = getEmailConfig();
    const limit = Math.min(args.limit || 50, 200);

    // Get today's count
    const now = Date.now();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const startOfDay = todayStart.getTime();

    const todayLogs = await ctx.db
      .query("emailLogs")
      .withIndex("by_created")
      .filter((q) => q.gte(q.field("createdAt"), startOfDay))
      .collect();

    const todaySent = todayLogs.filter(
      (log) => log.status === "sent" || log.status === "skipped_dry_run"
    ).length;

    // Get recent logs with optional filter
    let logsQuery = ctx.db.query("emailLogs").withIndex("by_created").order("desc");

    const allLogs = await logsQuery.take(limit * 2); // Get more for filtering

    let logs = allLogs;
    if (args.status) {
      logs = logs.filter((log) => log.status === args.status);
    }
    logs = logs.slice(0, limit);

    return {
      mode: config.mode,
      dailyLimit: config.dailyLimit,
      todaySent,
      logs: logs.map((log) => ({
        _id: log._id,
        to: log.to,
        subject: log.subject,
        template: log.template,
        status: log.status,
        provider: log.provider,
        error: log.error,
        orderId: log.orderId,
        hasHtml: !!log.html,
        createdAt: log.createdAt,
        updatedAt: log.updatedAt,
      })),
    };
  },
});

/**
 * Admin Query: Get email log detail (including HTML for dry-run preview).
 */
export const getEmailLog = query({
  args: { logId: v.id("emailLogs") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const log = await ctx.db.get(args.logId);
    if (!log) return null;

    return {
      _id: log._id,
      to: log.to,
      subject: log.subject,
      template: log.template,
      status: log.status,
      provider: log.provider,
      providerMessageId: log.providerMessageId,
      error: log.error,
      orderId: log.orderId,
      html: log.html, // Only present in dry-run mode
      text: log.text, // Only present in dry-run mode
      attempts: log.attempts,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt,
    };
  },
});

/**
 * Admin Query: Get suppressed emails list.
 */
export const getSuppressedEmails = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const suppressed = await ctx.db.query("suppressedEmails").collect();

    return suppressed.map((s) => ({
      _id: s._id,
      email: s.email,
      reason: s.reason,
      createdAt: s.createdAt,
    }));
  },
});
