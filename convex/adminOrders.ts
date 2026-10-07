import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./users";
import { orderStatusValidator, paymentMethodValidator } from "./lib/validators";
import { canTransition, allowedNextStatuses } from "./lib/orderStatus";
import type { OrderStatus } from "./lib/constants";

/**
 * Admin Query: List orders with optional filters and full-text search.
 */
export const list = query({
  args: {
    status: v.optional(v.string()),
    paymentMethod: v.optional(v.string()),
    search: v.optional(v.string()),
    needsVerificationOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    let orders = await ctx.db
      .query("orders")
      .order("desc")
      .collect();

    // Filter by needs verification
    if (args.needsVerificationOnly) {
      orders = orders.filter(
        (o) => o.status === "pending_verification" || (o.paymentMethod === "momo" && o.status === "awaiting_momo")
      );
    }

    // Filter by status
    if (args.status && args.status !== "all") {
      orders = orders.filter((o) => o.status === args.status);
    }

    // Filter by payment method
    if (args.paymentMethod && args.paymentMethod !== "all") {
      orders = orders.filter((o) => o.paymentMethod === args.paymentMethod);
    }

    // Filter by search query (orderNumber, customer name, phone, email, momoReference)
    if (args.search?.trim()) {
      const q = args.search.trim().toLowerCase();
      orders = orders.filter((o) => {
        const matchNumber = o.orderNumber.toLowerCase().includes(q);
        const matchName = o.customer.name.toLowerCase().includes(q);
        const matchPhone = o.customer.phone.toLowerCase().includes(q);
        const matchEmail = o.customer.email.toLowerCase().includes(q);
        const matchRef = o.momoReference?.toLowerCase().includes(q);
        return matchNumber || matchName || matchPhone || matchEmail || matchRef;
      });
    }

    return orders.map((o) => ({
      _id: o._id,
      orderNumber: o.orderNumber,
      createdAt: o.createdAt,
      customer: o.customer,
      fulfillment: o.fulfillment,
      deliveryZoneName: o.deliveryZoneName,
      pickupSnapshot: o.pickupSnapshot,
      itemCount: o.items.reduce((acc, i) => acc + i.quantity, 0),
      firstItemName: o.items[0]?.name || "Item",
      total: o.total,
      currency: o.currency,
      status: o.status,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      momoNetwork: o.momoNetwork,
      momoPhone: o.momoPhone,
      momoReference: o.momoReference,
      needsAttention: o.needsAttention,
      attentionReason: o.attentionReason,
    }));
  },
});

/**
 * Admin Query: Get complete order details with event activity and storage URLs.
 */
export const get = query({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const order = await ctx.db.get(args.orderId);
    if (!order) return null;

    // Attach storage image URLs for items
    const itemsWithImages = await Promise.all(
      order.items.map(async (item) => {
        let imageUrl: string | null = null;
        if (item.imageId) {
          imageUrl = await ctx.storage.getUrl(item.imageId);
        }
        return {
          ...item,
          imageUrl,
        };
      })
    );

    // Fetch order events timeline
    const events = await ctx.db
      .query("orderEvents")
      .withIndex("by_order_created", (q) => q.eq("orderId", order._id))
      .collect();

    // Allowed status transitions
    const nextStatuses = allowedNextStatuses({
      status: order.status,
      fulfillment: order.fulfillment,
      paymentMethod: order.paymentMethod,
    });

    return {
      ...order,
      items: itemsWithImages,
      events: events.sort((a, b) => b.createdAt - a.createdAt),
      allowedNextStatuses: nextStatuses,
    };
  },
});

/**
 * Admin Mutation: Verify customer's MoMo transfer and advance order to processing.
 */
export const verifyMomoPayment = mutation({
  args: {
    orderId: v.id("orders"),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { user } = await requireAdmin(ctx);

    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found.");

    if (order.status === "completed" || order.status === "cancelled") {
      throw new Error(`Cannot verify payment for a ${order.status} order.`);
    }

    const now = Date.now();

    await ctx.db.patch(order._id, {
      status: "processing",
      paymentStatus: "paid",
      paidAt: now,
      needsAttention: false,
      attentionReason: undefined,
      internalNote: args.note
        ? `${order.internalNote ? `${order.internalNote}\n` : ""}[${new Date(now).toISOString()}] ${args.note}`
        : order.internalNote,
      updatedAt: now,
    });

    // Write order event
    await ctx.db.insert("orderEvents", {
      orderId: order._id,
      type: "payment",
      fromStatus: order.status,
      toStatus: "processing",
      message: `Admin ${user.name || user.email} confirmed MoMo transfer receipt. (Ref: ${order.momoReference || "Verified"})`,
      actorId: String(user._id),
      createdAt: now,
    });

    return { success: true };
  },
});

/**
 * Admin Mutation: Reject MoMo reference (e.g. invalid transaction ID or transfer not received).
 */
export const rejectMomoPayment = mutation({
  args: {
    orderId: v.id("orders"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const { user } = await requireAdmin(ctx);

    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found.");

    const now = Date.now();
    const reasonClean = args.reason.trim() || "Payment could not be verified";

    await ctx.db.patch(order._id, {
      status: "awaiting_momo",
      paymentStatus: "unpaid",
      needsAttention: true,
      attentionReason: reasonClean,
      updatedAt: now,
    });

    await ctx.db.insert("orderEvents", {
      orderId: order._id,
      type: "payment",
      fromStatus: order.status,
      toStatus: "awaiting_momo",
      message: `Admin ${user.name || user.email} flagged MoMo reference: ${reasonClean}`,
      actorId: String(user._id),
      createdAt: now,
    });

    return { success: true };
  },
});

/**
 * Admin Mutation: Advance or change order status according to the state machine.
 */
export const updateStatus = mutation({
  args: {
    orderId: v.id("orders"),
    toStatus: orderStatusValidator,
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { user } = await requireAdmin(ctx);

    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found.");

    const isValid = canTransition(
      order.status,
      args.toStatus,
      order.fulfillment,
      order.paymentMethod
    );

    if (!isValid) {
      throw new Error(
        `Invalid status transition from "${order.status}" to "${args.toStatus}" for ${order.fulfillment} order.`
      );
    }

    const now = Date.now();

    // If transitioning to "completed": deduct physical stock permanently
    if (args.toStatus === "completed" && order.status !== "completed") {
      for (const item of order.items) {
        const product = await ctx.db.get(item.productId);
        if (product) {
          const newPhysicalStock = Math.max(0, product.stock - item.quantity);
          const newReservedStock = Math.max(0, product.reservedStock - item.quantity);

          await ctx.db.patch(product._id, {
            stock: newPhysicalStock,
            reservedStock: newReservedStock,
            updatedAt: now,
          });

          await ctx.db.insert("stockAdjustments", {
            productId: product._id,
            delta: -item.quantity,
            reason: "sale",
            orderId: order._id,
            actorId: String(user._id),
            note: `Order ${order.orderNumber} completed - physical stock deducted`,
            createdAt: now,
          });
        }
      }

      // If COD or Pay-in-Store, mark paymentStatus = "paid" on completion
      if (order.paymentStatus !== "paid") {
        await ctx.db.patch(order._id, {
          paymentStatus: "paid",
          paidAt: now,
        });
      }
    }

    // If cancelling order: release reserved stock
    if (args.toStatus === "cancelled" && order.status !== "cancelled") {
      for (const item of order.items) {
        const product = await ctx.db.get(item.productId);
        if (product) {
          const newReservedStock = Math.max(0, product.reservedStock - item.quantity);

          await ctx.db.patch(product._id, {
            reservedStock: newReservedStock,
            updatedAt: now,
          });

          await ctx.db.insert("stockAdjustments", {
            productId: product._id,
            delta: item.quantity,
            reason: "reservation_release",
            orderId: order._id,
            actorId: String(user._id),
            note: `Order ${order.orderNumber} cancelled - stock reservation released`,
            createdAt: now,
          });
        }
      }
    }

    await ctx.db.patch(order._id, {
      status: args.toStatus,
      cancelReason: args.toStatus === "cancelled" ? args.note?.trim() || "Cancelled by admin" : order.cancelReason,
      updatedAt: now,
    });

    // Write order event
    await ctx.db.insert("orderEvents", {
      orderId: order._id,
      type: "status",
      fromStatus: order.status,
      toStatus: args.toStatus,
      message: args.note?.trim()
        ? `Status changed to ${args.toStatus}. Note: ${args.note.trim()}`
        : `Status changed to ${args.toStatus}`,
      actorId: String(user._id),
      createdAt: now,
    });

    return { success: true };
  },
});

/**
 * Admin Mutation: Update internal staff note on an order.
 */
export const updateInternalNote = mutation({
  args: {
    orderId: v.id("orders"),
    internalNote: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found.");

    await ctx.db.patch(order._id, {
      internalNote: args.internalNote.trim(),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Admin Query: Get overview dashboard metrics.
 */
export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const orders = await ctx.db.query("orders").collect();
    const products = await ctx.db.query("products").collect();
    const siteSettings = await ctx.db.query("siteSettings").first();
    const lowThreshold = siteSettings?.lowStockThreshold ?? 3;

    // 1. Pending MoMo verifications
    const pendingVerificationOrders = orders.filter(
      (o) => o.status === "pending_verification" || (o.paymentMethod === "momo" && o.status === "awaiting_momo")
    );

    // 2. Active orders (processing, out_for_delivery, ready_for_pickup)
    const activeOrders = orders.filter(
      (o) => o.status === "processing" || o.status === "out_for_delivery" || o.status === "ready_for_pickup"
    );

    // 3. Completed orders & Total revenue
    const completedOrders = orders.filter((o) => o.status === "completed" || o.paymentStatus === "paid");
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);

    // 4. Low stock products
    const lowStockProducts = products.filter((p) => {
      const available = p.stock - p.reservedStock;
      return p.isActive && available <= lowThreshold;
    });

    // 5. Recent orders for dashboard table
    const recentOrders = orders
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5)
      .map((o) => ({
        _id: o._id,
        orderNumber: o.orderNumber,
        createdAt: o.createdAt,
        customerName: o.customer.name,
        customerPhone: o.customer.phone,
        total: o.total,
        status: o.status,
        paymentMethod: o.paymentMethod,
        fulfillment: o.fulfillment,
      }));

    return {
      pendingVerificationCount: pendingVerificationOrders.length,
      activeOrdersCount: activeOrders.length,
      totalOrdersCount: orders.length,
      totalRevenue,
      lowStockCount: lowStockProducts.length,
      recentOrders,
      pendingVerificationList: pendingVerificationOrders.slice(0, 5).map((o) => ({
        _id: o._id,
        orderNumber: o.orderNumber,
        createdAt: o.createdAt,
        customerName: o.customer.name,
        customerPhone: o.customer.phone,
        momoNetwork: o.momoNetwork,
        momoReference: o.momoReference,
        total: o.total,
        status: o.status,
      })),
    };
  },
});
