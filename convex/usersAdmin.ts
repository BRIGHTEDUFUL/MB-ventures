import { v } from "convex/values";
import {
  internalMutation,
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { requireAdmin } from "./users";
import {
  orderStatusValidator,
  paymentMethodValidator,
  paymentStatusValidator,
  roleValidator,
} from "./lib/validators";
import { logAudit } from "./auditLogs";

/** Search scans at most this many of the most recent users (documented limitation). */
const USER_SEARCH_CAP = 1000;
const DEFAULT_LIST_LIMIT = 20;
const MAX_LIST_LIMIT = 50;
const MAX_ORDERS_SHOWN = 50;

/** One row of the admin user table (stats are computed server-side per row). */
const userItemValidator = v.object({
  _id: v.id("users"),
  name: v.string(),
  email: v.string(),
  phone: v.string(),
  role: roleValidator,
  createdAt: v.number(),
  orderCount: v.number(),
  totalSpent: v.number(),
});

/** Order summary row shown on the user detail page. */
const userOrderValidator = v.object({
  _id: v.id("orders"),
  orderNumber: v.string(),
  status: orderStatusValidator,
  paymentStatus: paymentStatusValidator,
  paymentMethod: paymentMethodValidator,
  total: v.number(),
  createdAt: v.number(),
  itemCount: v.number(),
});

/** Counts a user's orders and sums their paid totals (money stays in pesewas). */
async function orderStats(ctx: QueryCtx | MutationCtx, userId: Id<"users">) {
  const orders = await ctx.db
    .query("orders")
    .withIndex("by_user_created", (q) => q.eq("userId", userId))
    .collect();
  const totalSpent = orders.reduce(
    (sum, order) => (order.paymentStatus === "paid" ? sum + order.total : sum),
    0
  );
  return { orderCount: orders.length, totalSpent };
}

function toItemShape(user: {
  _id: Id<"users">;
  name?: string;
  email?: string;
  phone?: string;
  role: "admin" | "customer";
  createdAt: number;
}, stats: { orderCount: number; totalSpent: number }) {
  return {
    _id: user._id,
    name: user.name ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    role: user.role,
    createdAt: user.createdAt,
    orderCount: stats.orderCount,
    totalSpent: stats.totalSpent,
  };
}

/**
 * Admin Query: page through users with optional search and role filter.
 * orderCount/totalSpent are computed only for the returned page.
 */
export const adminList = query({
  args: {
    q: v.optional(v.string()),
    role: v.optional(roleValidator),
    offset: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  returns: v.object({
    items: v.array(userItemValidator),
    total: v.number(),
    hasMore: v.boolean(),
  }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const offset = Math.max(0, Math.floor(args.offset ?? 0));
    const limit = Math.min(
      Math.max(1, Math.floor(args.limit ?? DEFAULT_LIST_LIMIT)),
      MAX_LIST_LIMIT
    );

    const recentUsers = await ctx.db
      .query("users")
      .withIndex("by_created")
      .order("desc")
      .take(USER_SEARCH_CAP);

    const search = args.q?.trim().toLowerCase() ?? "";
    const roleFilter = args.role;

    const filtered = recentUsers.filter((user) => {
      if (roleFilter && user.role !== roleFilter) return false;
      if (!search) return true;
      const name = (user.name ?? "").toLowerCase();
      const email = (user.email ?? "").toLowerCase();
      return name.includes(search) || email.includes(search);
    });
    filtered.sort((a, b) => b.createdAt - a.createdAt);

    const total = filtered.length;
    const page = filtered.slice(offset, offset + limit);

    const items = [];
    for (const user of page) {
      const stats = await orderStats(ctx, user._id);
      items.push(toItemShape(user, stats));
    }

    return { items, total, hasMore: offset + page.length < total };
  },
});

/**
 * Admin Query: one user with their addresses and latest orders.
 * Throws "User not found." when the id does not exist.
 */
export const adminGet = query({
  args: { userId: v.id("users") },
  returns: v.object({
    user: userItemValidator,
    addresses: v.array(
      v.object({
        _id: v.id("addresses"),
        label: v.string(),
        recipientName: v.string(),
        phone: v.string(),
        line1: v.string(),
        line2: v.optional(v.string()),
        city: v.string(),
        region: v.string(),
        isDefault: v.boolean(),
      })
    ),
    orders: v.array(userOrderValidator),
  }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found.");

    const stats = await orderStats(ctx, user._id);

    const addresses = await ctx.db
      .query("addresses")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_user_created", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(MAX_ORDERS_SHOWN);

    return {
      user: toItemShape(user, stats),
      addresses: addresses.map((address) => ({
        _id: address._id,
        label: address.label,
        recipientName: address.recipientName,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        region: address.region,
        isDefault: address.isDefault,
      })),
      orders: orders.map((order) => ({
        _id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        total: order.total,
        createdAt: order.createdAt,
        itemCount: order.items.length,
      })),
    };
  },
});

/**
 * Admin Mutation: change a user's role.
 * Guards against self-demotion and against removing the last admin.
 */
export const adminUpdateRole = mutation({
  args: {
    userId: v.id("users"),
    role: roleValidator,
  },
  returns: v.object({ ok: v.literal(true) }),
  handler: async (ctx, args) => {
    const { user, userId: actorId } = await requireAdmin(ctx);

    const target = await ctx.db.get(args.userId);
    if (!target) throw new Error("User not found.");

    if (args.userId === actorId) {
      throw new Error("You cannot change your own role.");
    }

    if (target.role === "admin" && args.role === "customer") {
      const admins = await ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", "admin"))
        .collect();
      if (admins.length <= 1) {
        throw new Error("This is the last admin account and cannot be demoted.");
      }
    }

    if (target.role !== args.role) {
      await ctx.db.patch(args.userId, { role: args.role });

      await logAudit(ctx, {
        userId: user._id,
        action: "update",
        resourceType: "user",
        resourceId: args.userId,
        details: `Changed role for ${target.name || target.email || "user"} from ${target.role} to ${args.role}`,
        before: { role: target.role },
        after: { role: args.role },
      });
    }

    return { ok: true as const };
  },
});

/**
 * Internal mutation: strip personal data from a user, their addresses and their orders.
 * Dashboard-only — never callable from the client. Money, items, status, payment fields,
 * momoReference and orderEvents are left untouched; linked orders keep working as
 * "Deleted customer". Order-side PII (delivery address, MoMo phone, notes, guest token)
 * is cleared too.
 */
export const anonymize = internalMutation({
  args: { userId: v.id("users") },
  returns: v.object({
    ok: v.literal(true),
    ordersUnlinked: v.number(),
    addressesRemoved: v.number(),
  }),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found.");

    await ctx.db.patch(args.userId, {
      name: undefined,
      email: undefined,
      phone: undefined,
    });

    const addresses = await ctx.db
      .query("addresses")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    for (const address of addresses) {
      await ctx.db.delete(address._id);
    }

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_user_created", (q) => q.eq("userId", args.userId))
      .collect();
    for (const order of orders) {
      await ctx.db.patch(order._id, {
        userId: undefined,
        guestToken: undefined,
        deliveryAddress: undefined,
        momoPhone: undefined,
        customerNote: undefined,
        internalNote: undefined,
        customer: {
          name: "Deleted customer",
          email: "deleted@anonymized.invalid",
          phone: "-",
        },
      });
    }

    return {
      ok: true as const,
      ordersUnlinked: orders.length,
      addressesRemoved: addresses.length,
    };
  },
});
