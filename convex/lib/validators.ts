/**
 * Reusable Convex validators for data schemas and function arguments.
 */

import { v } from "convex/values";

/**
 * Reusable role validator
 */
export const roleValidator = v.union(v.literal("customer"), v.literal("admin"));

/**
 * Reusable fulfillment validator
 */
export const fulfillmentValidator = v.union(
  v.literal("delivery"),
  v.literal("pickup")
);

/**
 * Reusable order status validator
 */
export const orderStatusValidator = v.union(
  v.literal("pending_payment"),
  v.literal("paid"),
  v.literal("processing"),
  v.literal("ready_for_pickup"),
  v.literal("out_for_delivery"),
  v.literal("completed"),
  v.literal("cancelled")
);

/**
 * Reusable payment status validator
 */
export const paymentStatusValidator = v.union(
  v.literal("unpaid"),
  v.literal("paid"),
  v.literal("failed"),
  v.literal("refund_pending"),
  v.literal("refunded")
);

/**
 * Reusable stock adjustment reason validator
 */
export const stockAdjustmentReasonValidator = v.union(
  v.literal("sale"),
  v.literal("reservation_release"),
  v.literal("manual"),
  v.literal("restock"),
  v.literal("cancel_restock"),
  v.literal("import"),
  v.literal("correction")
);

/**
 * Reusable order event type validator
 */
export const orderEventTypeValidator = v.union(
  v.literal("status"),
  v.literal("payment"),
  v.literal("note"),
  v.literal("email"),
  v.literal("system")
);

/**
 * Product specification item validator
 */
export const specItemValidator = v.object({
  label: v.string(),
  value: v.string(),
});

/**
 * Cart item validator
 */
export const cartItemValidator = v.object({
  productId: v.id("products"),
  quantity: v.number(),
});

/**
 * Customer snapshot validator for orders
 */
export const customerValidator = v.object({
  name: v.string(),
  email: v.string(),
  phone: v.string(),
});

/**
 * Delivery address validator
 */
export const deliveryAddressValidator = v.object({
  line1: v.string(),
  line2: v.optional(v.string()),
  city: v.string(),
  region: v.string(),
  notes: v.optional(v.string()),
});

/**
 * Pickup snapshot validator
 */
export const pickupSnapshotValidator = v.object({
  name: v.string(),
  address: v.string(),
  openingHours: v.string(),
});

/**
 * Order item snapshot validator (immutable snapshot at purchase time)
 */
export const orderItemValidator = v.object({
  productId: v.id("products"),
  name: v.string(),
  sku: v.optional(v.string()),
  unitPrice: v.number(), // In pesewas
  quantity: v.number(),
  imageId: v.optional(v.id("_storage")),
});

/**
 * Announcement banner settings validator
 */
export const announcementValidator = v.object({
  enabled: v.boolean(),
  text: v.string(),
  link: v.optional(v.string()),
});

/**
 * Hero section settings validator
 */
export const heroSettingsValidator = v.object({
  title: v.string(),
  subtitle: v.string(),
  buttonText: v.string(),
  buttonLink: v.string(),
  imageId: v.optional(v.id("_storage")),
});

/**
 * Promo tile validator
 */
export const promoTileValidator = v.object({
  title: v.string(),
  subtitle: v.string(),
  link: v.string(),
  imageId: v.optional(v.id("_storage")),
});

/**
 * Social links validator
 */
export const socialLinksValidator = v.object({
  facebook: v.optional(v.string()),
  instagram: v.optional(v.string()),
  x: v.optional(v.string()),
  tiktok: v.optional(v.string()),
  youtube: v.optional(v.string()),
});
