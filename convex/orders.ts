import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import {
  customerValidator,
  deliveryAddressValidator,
  fulfillmentValidator,
  momoNetworkValidator,
  paymentMethodValidator,
} from "./lib/validators";
import type { OrderStatus, PaymentStatus } from "./lib/constants";
import type { Id } from "./_generated/dataModel";

/**
 * Public mutation: Create an order from customer checkout.
 * Recomputes all prices, stock, delivery fees and totals on the server.
 */
export const create = mutation({
  args: {
    customer: customerValidator,
    fulfillment: fulfillmentValidator,
    deliveryAddress: v.optional(deliveryAddressValidator),
    deliveryZoneId: v.optional(v.id("deliveryZones")),
    pickupLocationId: v.optional(v.id("pickupLocations")),
    paymentMethod: paymentMethodValidator,
    momoNetwork: v.optional(momoNetworkValidator),
    momoPhone: v.optional(v.string()),
    momoReference: v.optional(v.string()),
    items: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.number(),
      })
    ),
    checkoutKey: v.string(),
    customerNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Check idempotency key to prevent double submission
    const existingOrder = await ctx.db
      .query("orders")
      .withIndex("by_checkout_key", (q) => q.eq("checkoutKey", args.checkoutKey))
      .first();

    if (existingOrder) {
      return {
        orderId: existingOrder._id,
        orderNumber: existingOrder.orderNumber,
      };
    }

    if (args.items.length === 0) {
      throw new Error("Cannot place an order with an empty cart.");
    }

    const userId = await getAuthUserId(ctx);

    // 2. Fetch site settings for limits, expiry, free delivery threshold
    const siteSettings = await ctx.db.query("siteSettings").first();
    const expiryMinutes = siteSettings?.orderExpiryMinutes ?? 30;

    // 3. Validate fulfillment & calculate delivery fee
    let deliveryFee = 0;
    let deliveryZoneName: string | undefined;
    let pickupSnapshot:
      | { name: string; address: string; openingHours: string }
      | undefined;

    if (args.fulfillment === "delivery") {
      if (!args.deliveryAddress) {
        throw new Error("Delivery address is required for home delivery.");
      }
      if (!args.deliveryZoneId) {
        throw new Error("Delivery zone is required for home delivery.");
      }
      const zone = await ctx.db.get(args.deliveryZoneId);
      if (!zone || !zone.isActive) {
        throw new Error("Selected delivery zone is invalid or inactive.");
      }
      deliveryZoneName = zone.name;
      deliveryFee = zone.fee;
    } else if (args.fulfillment === "pickup") {
      if (!args.pickupLocationId) {
        throw new Error("Pickup location is required for in-store pickup.");
      }
      const location = await ctx.db.get(args.pickupLocationId);
      if (!location || !location.isActive) {
        throw new Error("Selected pickup location is invalid or inactive.");
      }
      pickupSnapshot = {
        name: location.name,
        address: location.address,
        openingHours: location.openingHours,
      };
      deliveryFee = 0;
    }

    // 4. Validate products, check stock, compute subtotal and reserve stock
    let subtotal = 0;
    const orderItems: Array<{
      productId: Id<"products">;
      name: string;
      sku?: string;
      unitPrice: number;
      quantity: number;
      imageId?: Id<"_storage">;
    }> = [];

    const productsToUpdate: Array<{
      id: Id<"products">;
      newReservedStock: number;
      quantity: number;
    }> = [];

    for (const item of args.items) {
      if (item.quantity <= 0) {
        throw new Error("Item quantity must be greater than 0.");
      }

      const product = await ctx.db.get(item.productId);
      if (!product || !product.isActive) {
        throw new Error(
          `Product "${product?.name || "Unknown"}" is no longer available.`
        );
      }

      const available = Math.max(0, product.stock - product.reservedStock);
      if (available < item.quantity) {
        throw new Error(
          `Insufficient stock for "${product.name}". Available: ${available}, requested: ${item.quantity}.`
        );
      }

      const unitPrice =
        product.salePrice && product.salePrice < product.price
          ? product.salePrice
          : product.price;

      subtotal += unitPrice * item.quantity;

      orderItems.push({
        productId: product._id,
        name: product.name,
        sku: product.sku,
        unitPrice,
        quantity: item.quantity,
        imageId: product.imageIds[0],
      });

      productsToUpdate.push({
        id: product._id,
        newReservedStock: product.reservedStock + item.quantity,
        quantity: item.quantity,
      });
    }

    // Free delivery threshold check
    if (
      args.fulfillment === "delivery" &&
      siteSettings?.freeDeliveryThreshold &&
      subtotal >= siteSettings.freeDeliveryThreshold
    ) {
      deliveryFee = 0;
    }

    const total = subtotal + deliveryFee;

    // 5. Reserve stock on each product
    for (const p of productsToUpdate) {
      await ctx.db.patch(p.id, {
        reservedStock: p.newReservedStock,
        updatedAt: Date.now(),
      });
    }

    // 6. Generate sequential Order Number atomically via counters table
    let counter = await ctx.db
      .query("counters")
      .withIndex("by_name", (q) => q.eq("name", "order_number"))
      .first();

    let nextOrderNum = 1001;
    if (!counter) {
      await ctx.db.insert("counters", {
        name: "order_number",
        value: 1001,
      });
    } else {
      nextOrderNum = counter.value + 1;
      await ctx.db.patch(counter._id, {
        value: nextOrderNum,
      });
    }

    const orderNumber = `ORD-${String(nextOrderNum).padStart(6, "0")}`;

    // 7. Determine initial order status & payment status
    let initialStatus: OrderStatus = "pending";
    let paymentStatus: PaymentStatus = "unpaid";
    let expiresAt: number | undefined;
    let initialEventMessage = "Order placed by customer.";

    const momoRefTrimmed = args.momoReference?.trim();

    if (args.paymentMethod === "momo") {
      expiresAt = Date.now() + expiryMinutes * 60 * 1000;
      if (momoRefTrimmed) {
        initialStatus = "pending_verification";
        paymentStatus = "pending_verification";
        initialEventMessage = `Order placed via Mobile Money. Customer provided reference: ${momoRefTrimmed}`;
      } else {
        initialStatus = "awaiting_momo";
        paymentStatus = "unpaid";
        initialEventMessage =
          "Order placed via Mobile Money. Awaiting customer payment transfer.";
      }
    } else if (args.paymentMethod === "cash_on_delivery") {
      initialStatus = "processing";
      paymentStatus = "unpaid";
      initialEventMessage =
        "Order placed with Cash on Delivery. Payment will be collected on arrival.";
    } else if (args.paymentMethod === "pay_in_store") {
      initialStatus = "processing";
      paymentStatus = "unpaid";
      initialEventMessage =
        "Order placed for In-Store Pickup. Payment will be collected at pickup counter.";
    }

    const now = Date.now();

    // 8. Insert Order
    const orderId = await ctx.db.insert("orders", {
      orderNumber,
      userId: userId ?? undefined,
      checkoutKey: args.checkoutKey,
      customer: {
        name: args.customer.name.trim(),
        email: args.customer.email.trim().toLowerCase(),
        phone: args.customer.phone.trim(),
      },
      fulfillment: args.fulfillment,
      deliveryAddress: args.deliveryAddress,
      deliveryZoneId: args.deliveryZoneId,
      deliveryZoneName,
      pickupLocationId: args.pickupLocationId,
      pickupSnapshot,
      items: orderItems,
      subtotal,
      deliveryFee,
      total,
      currency: "GHS",
      status: initialStatus,
      paymentMethod: args.paymentMethod,
      paymentStatus,
      momoNetwork: args.momoNetwork,
      momoPhone: args.momoPhone?.trim(),
      momoReference: momoRefTrimmed || undefined,
      needsAttention: false,
      customerNote: args.customerNote?.trim(),
      expiresAt,
      createdAt: now,
      updatedAt: now,
    });

    // 9. Record stock adjustment events
    for (const p of productsToUpdate) {
      await ctx.db.insert("stockAdjustments", {
        productId: p.id,
        delta: -p.quantity,
        reason: "reservation_release",
        orderId,
        actorId: userId ? String(userId) : "guest",
        note: `Order ${orderNumber} created - stock reserved`,
        createdAt: now,
      });
    }

    // 10. Write initial order event
    await ctx.db.insert("orderEvents", {
      orderId,
      type: "status",
      toStatus: initialStatus,
      message: initialEventMessage,
      actorId: userId ? String(userId) : "customer",
      createdAt: now,
    });

    // 11. Clear authenticated user's cart in DB if exists
    if (userId) {
      const userCart = await ctx.db
        .query("carts")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();

      if (userCart) {
        await ctx.db.patch(userCart._id, {
          items: [],
          updatedAt: now,
        });
      }
    }

    return {
      orderId,
      orderNumber,
    };
  },
});

/**
 * Public mutation: Submit or update Mobile Money reference for an existing order.
 */
export const submitMomoReference = mutation({
  args: {
    orderNumber: v.string(),
    momoNetwork: momoNetworkValidator,
    momoPhone: v.string(),
    momoReference: v.string(),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_order_number", (q) => q.eq("orderNumber", args.orderNumber))
      .first();

    if (!order) {
      throw new Error(`Order "${args.orderNumber}" not found.`);
    }

    if (order.status === "cancelled" || order.status === "completed") {
      throw new Error(`Cannot update reference on ${order.status} order.`);
    }

    const refClean = args.momoReference.trim();
    if (!refClean) {
      throw new Error("Please enter a valid MoMo transaction reference.");
    }

    const now = Date.now();

    await ctx.db.patch(order._id, {
      momoNetwork: args.momoNetwork,
      momoPhone: args.momoPhone.trim(),
      momoReference: refClean,
      status: "pending_verification",
      paymentStatus: "pending_verification",
      updatedAt: now,
    });

    await ctx.db.insert("orderEvents", {
      orderId: order._id,
      type: "payment",
      fromStatus: order.status,
      toStatus: "pending_verification",
      message: `Customer submitted MoMo reference: ${refClean} (${args.momoNetwork} - ${args.momoPhone})`,
      actorId: "customer",
      createdAt: now,
    });

    return { success: true };
  },
});

/**
 * Public query: Get order details by order number for tracking and receipt.
 */
export const getByOrderNumber = query({
  args: {
    orderNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_order_number", (q) => q.eq("orderNumber", args.orderNumber))
      .first();

    if (!order) return null;

    // Fetch image URLs for order items
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

    // Fetch order events (timeline)
    const events = await ctx.db
      .query("orderEvents")
      .withIndex("by_order_created", (q) => q.eq("orderId", order._id))
      .collect();

    // Fetch site settings for MoMo account info & shop contact
    const siteSettings = await ctx.db.query("siteSettings").first();

    return {
      _id: order._id,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      customer: order.customer,
      fulfillment: order.fulfillment,
      deliveryAddress: order.deliveryAddress,
      deliveryZoneName: order.deliveryZoneName,
      pickupSnapshot: order.pickupSnapshot,
      items: itemsWithImages,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      total: order.total,
      currency: order.currency,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      momoNetwork: order.momoNetwork,
      momoPhone: order.momoPhone,
      momoReference: order.momoReference,
      expiresAt: order.expiresAt,
      customerNote: order.customerNote,
      events: events.map((e) => ({
        _id: e._id,
        type: e.type,
        toStatus: e.toStatus,
        message: e.message,
        createdAt: e.createdAt,
      })),
      shopMomoAccounts: siteSettings?.momoAccounts ?? [],
      shopContact: {
        phone: siteSettings?.contactPhone ?? "+233 24 123 4567",
        whatsapp: siteSettings?.whatsappNumber ?? "+233 24 123 4567",
        address: siteSettings?.address ?? "Accra, Ghana",
      },
    };
  },
});

/**
 * User-scoped query: List all past orders for the signed-in user.
 */
export const listMyOrders = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_user_created", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return orders.map((o) => ({
      _id: o._id,
      orderNumber: o.orderNumber,
      createdAt: o.createdAt,
      status: o.status,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      total: o.total,
      itemCount: o.items.reduce((acc, item) => acc + item.quantity, 0),
      fulfillment: o.fulfillment,
    }));
  },
});

/**
 * User-scoped query: Get full order detail by order number.
 * Only returns the order if it belongs to the signed-in user.
 * Never returns internalNote or admin-only fields.
 */
export const getMineByOrderNumber = query({
  args: { orderNumber: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const order = await ctx.db
      .query("orders")
      .withIndex("by_order_number", (q) => q.eq("orderNumber", args.orderNumber))
      .first();

    if (!order || order.userId !== userId) return null;

    // Resolve image URLs for each item
    const itemsWithImages = await Promise.all(
      order.items.map(async (item) => {
        let imageUrl: string | null = null;
        if (item.imageId) imageUrl = await ctx.storage.getUrl(item.imageId);
        return { ...item, imageUrl };
      })
    );

    // Order timeline events (public-safe fields only)
    const events = await ctx.db
      .query("orderEvents")
      .withIndex("by_order_created", (q) => q.eq("orderId", order._id))
      .collect();

    return {
      _id: order._id,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      expiresAt: order.expiresAt,
      customer: order.customer,
      fulfillment: order.fulfillment,
      deliveryAddress: order.deliveryAddress,
      deliveryZoneName: order.deliveryZoneName,
      pickupSnapshot: order.pickupSnapshot,
      items: itemsWithImages,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      total: order.total,
      currency: order.currency,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      momoNetwork: order.momoNetwork,
      momoPhone: order.momoPhone,
      momoReference: order.momoReference,
      customerNote: order.customerNote,
      events: events.map((e) => ({
        _id: e._id,
        type: e.type,
        toStatus: e.toStatus,
        message: e.message,
        createdAt: e.createdAt,
      })),
    };
  },
});

/**
 * User-scoped mutation: cancel an order the customer placed.
 * Customers may only cancel UNPAID orders (awaiting_momo or pending status).
 * Cancellation releases reserved stock.
 */
export const cancelMine = mutation({
  args: { orderNumber: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const order = await ctx.db
      .query("orders")
      .withIndex("by_order_number", (q) => q.eq("orderNumber", args.orderNumber))
      .first();

    if (!order || order.userId !== userId) throw new Error("Order not found.");

    // Only unpaid orders in cancellable states
    const cancellableStatuses: string[] = ["pending", "awaiting_momo", "pending_verification"];
    if (!cancellableStatuses.includes(order.status)) {
      throw new Error(
        "This order cannot be cancelled. Only unpaid orders can be cancelled. Contact support if you need help."
      );
    }

    const now = Date.now();

    // Release reserved stock
    await Promise.all(
      order.items.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        if (!product) return;
        const newReserved = Math.max(0, product.reservedStock - item.quantity);
        await ctx.db.patch(item.productId, { reservedStock: newReserved });
        await ctx.db.insert("stockAdjustments", {
          productId: item.productId,
          delta: 0, // No physical stock change on unpaid cancellation
          reason: "reservation_release",
          orderId: order._id,
          note: `Customer cancelled order ${order.orderNumber} (unpaid)`,
          createdAt: now,
        });
      })
    );

    await ctx.db.patch(order._id, {
      status: "cancelled",
      cancelReason: "Cancelled by customer",
    });

    await ctx.db.insert("orderEvents", {
      orderId: order._id,
      type: "status",
      fromStatus: order.status,
      toStatus: "cancelled",
      message: "Order cancelled by customer.",
      actorId: userId,
      createdAt: now,
    });

    return { success: true };
  },
});

