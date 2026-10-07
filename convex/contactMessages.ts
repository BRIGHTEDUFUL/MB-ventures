import { v } from "convex/values";
import { internalAction, internalQuery, mutation } from "./_generated/server";
import { internal } from "./_generated/api";

/** Per-email cap enforced in the mutation (no rate-limiter component installed). */
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

/**
 * Public Mutation: store a contact form submission.
 * Returns only { ok: true } — never the stored id or any other data.
 */
export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    message: v.string(),
    website: v.optional(v.string()), // honeypot — real visitors never fill it in
  },
  returns: v.object({ ok: v.literal(true) }),
  handler: async (ctx, args) => {
    // Honeypot filled in => bot. Drop silently, no insert, no error.
    if (args.website !== undefined && args.website.trim() !== "") {
      return { ok: true } as const;
    }

    const name = args.name.trim();
    const email = args.email.trim().toLowerCase();
    const phone = args.phone?.trim();
    const message = args.message.trim();

    if (name.length < 2 || name.length > 100) {
      throw new Error("Please enter your name (2 to 100 characters).");
    }
    if (email.length < 4 || email.length > 200) {
      throw new Error("Please enter a valid email address (4 to 200 characters).");
    }
    if (phone !== undefined && phone.length > 30) {
      throw new Error("Please enter a phone number of up to 30 characters.");
    }
    if (message.length < 10 || message.length > 2000) {
      throw new Error("Your message must be between 10 and 2000 characters.");
    }

    const oneHourAgo = Date.now() - RATE_LIMIT_WINDOW_MS;
    const recent = await ctx.db
      .query("contactMessages")
      .withIndex("by_email_created", (q) =>
        q.eq("email", email).gte("createdAt", oneHourAgo)
      )
      .collect();

    if (recent.length >= RATE_LIMIT_MAX) {
      throw new Error(
        "You have sent 3 messages recently. Please wait a little before sending another."
      );
    }

    const messageId = await ctx.db.insert("contactMessages", {
      name,
      email,
      phone: phone === "" ? undefined : phone,
      message,
      isRead: false,
      createdAt: Date.now(),
    });

    await ctx.scheduler.runAfter(0, internal.contactMessages.notifyShop, { messageId });
    return { ok: true } as const;
  },
});

/**
 * Internal Query: read one message for the notifyShop action.
 * Internal so the message body is never reachable from a client.
 */
export const getMessage = internalQuery({
  args: { messageId: v.id("contactMessages") },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.messageId);
    if (!row) return null;
    return {
      name: row.name,
      email: row.email,
      phone: row.phone,
      message: row.message,
      createdAt: row.createdAt,
    };
  },
});

/**
 * Internal Action: notify the shop about a new contact message (scheduled by `create`).
 */
export const notifyShop = internalAction({
  args: { messageId: v.id("contactMessages") },
  handler: async (ctx, args) => {
    // TODO(email): wire to Resend template 10 in Step 20 (RESEND_API_KEY not configured).
    const message = await ctx.runQuery(internal.contactMessages.getMessage, {
      messageId: args.messageId,
    });
    if (!message) return;
    // RESEND_API_KEY is not configured yet — send nothing.
  },
});
