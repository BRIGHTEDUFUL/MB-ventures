import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./users";
import type { Id } from "./_generated/dataModel";

const itemValidator = v.object({
  _id: v.id("contactMessages"),
  name: v.string(),
  email: v.string(),
  phone: v.string(),
  message: v.string(),
  isRead: v.boolean(),
  createdAt: v.number(),
});

/** Map a stored row to the admin item shape (phone "" when absent). */
function toItem(row: {
  _id: Id<"contactMessages">;
  name: string;
  email: string;
  phone?: string;
  message: string;
  isRead: boolean;
  createdAt: number;
}) {
  return {
    _id: row._id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? "",
    message: row.message,
    isRead: row.isRead,
    createdAt: row.createdAt,
  };
}

/**
 * Admin Query: contact inbox, newest first, with offset pagination.
 */
export const list = query({
  args: {
    unreadOnly: v.optional(v.boolean()),
    offset: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  returns: v.object({
    items: v.array(itemValidator),
    total: v.number(),
    hasMore: v.boolean(),
  }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const limit = Math.min(Math.max(Math.trunc(args.limit ?? 20), 1), 100);
    const offset = Math.max(Math.trunc(args.offset ?? 0), 0);

    let messagesQuery = ctx.db.query("contactMessages").withIndex("by_created");
    if (args.unreadOnly) {
      messagesQuery = messagesQuery.filter((q) => q.eq(q.field("isRead"), false));
    }
    const all = await messagesQuery.order("desc").collect();

    return {
      items: all.slice(offset, offset + limit).map(toItem),
      total: all.length,
      hasMore: offset + limit < all.length,
    };
  },
});

/**
 * Admin Query: one full message.
 */
export const get = query({
  args: { messageId: v.id("contactMessages") },
  returns: itemValidator,
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const row = await ctx.db.get(args.messageId);
    if (!row) throw new Error("Message not found.");
    return toItem(row);
  },
});

/**
 * Admin Mutation: mark a message read/unread.
 */
export const setRead = mutation({
  args: { messageId: v.id("contactMessages"), isRead: v.boolean() },
  returns: v.object({ ok: v.literal(true) }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    // TODO(audit): write an auditLogs row here once Step 25 (logAudit) lands.

    const row = await ctx.db.get(args.messageId);
    if (!row) throw new Error("Message not found.");

    await ctx.db.patch(args.messageId, { isRead: args.isRead });
    return { ok: true } as const;
  },
});

/**
 * Admin Mutation: delete a contact message.
 */
export const remove = mutation({
  args: { messageId: v.id("contactMessages") },
  returns: v.object({ ok: v.literal(true) }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    // TODO(audit): write an auditLogs row here once Step 25 (logAudit) lands.

    const row = await ctx.db.get(args.messageId);
    if (!row) throw new Error("Message not found.");

    await ctx.db.delete(args.messageId);
    return { ok: true } as const;
  },
});
