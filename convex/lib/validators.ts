/**
 * Reusable Convex validators for data schemas and function arguments.
 */

import { v } from "convex/values";

/** User roles */
export const roleValidator = v.union(v.literal("customer"), v.literal("admin"));

/** Fulfillment type */
export const fulfillmentValidator = v.union(
  v.literal("delivery"),
  v.literal("pickup")
);

/**
 * Order status validator.
 *
 * Payment flow (MoMo):
 *   pending → awaiting_momo → pending_verification → processing → out_for_delivery / ready_for_pickup → completed
 *
 * Payment flow (COD / pay_in_store):
 *   pending → processing → out_for_delivery / ready_for_pickup → completed
 *
 * Any status can transition to cancelled (unless terminal).
 */
export const orderStatusValidator = v.union(
  v.literal("pending"),
  v.literal("awaiting_momo"),
  v.literal("pending_verification"),
  v.literal("processing"),
  v.literal("ready_for_pickup"),
  v.literal("out_for_delivery"),
  v.literal("completed"),
  v.literal("cancelled")
);

/**
 * Payment method validator.
 * momo            — customer manually transfers via Mobile Money, submits reference
 * cash_on_delivery — rider collects cash on arrival
 * pay_in_store    — customer pays at the counter during pickup
 */
export const paymentMethodValidator = v.union(
  v.literal("momo"),
  v.literal("cash_on_delivery"),
  v.literal("pay_in_store")
);

/**
 * MoMo network validator (Ghana networks)
 */
export const momoNetworkValidator = v.union(
  v.literal("MTN"),
  v.literal("Telecel"),    // formerly Vodafone Cash
  v.literal("AirtelTigo")
);

/**
 * Payment status validator.
 * unpaid               — no payment yet
 * pending_verification — MoMo reference submitted; admin must verify
 * paid                 — confirmed paid (MoMo verified, COD collected, or in-store payment taken)
 * refunded             — refund issued
 */
export const paymentStatusValidator = v.union(
  v.literal("unpaid"),
  v.literal("pending_verification"),
  v.literal("paid"),
  v.literal("refunded")
);

/** Stock adjustment reason */
export const stockAdjustmentReasonValidator = v.union(
  v.literal("sale"),
  v.literal("reservation_release"),
  v.literal("manual"),
  v.literal("restock"),
  v.literal("cancel_restock"),
  v.literal("import"),
  v.literal("correction")
);

/** Order event type */
export const orderEventTypeValidator = v.union(
  v.literal("status"),
  v.literal("payment"),
  v.literal("note"),
  v.literal("email"),
  v.literal("system")
);

/** Product specification item */
export const specItemValidator = v.object({
  group: v.optional(v.string()),
  label: v.string(),
  value: v.string(),
});

/** Cart item */
export const cartItemValidator = v.object({
  productId: v.id("products"),
  quantity: v.number(),
});

/** Customer snapshot embedded in orders (immutable at checkout) */
export const customerValidator = v.object({
  name: v.string(),
  email: v.string(),
  phone: v.string(),
});

/** Delivery address */
export const deliveryAddressValidator = v.object({
  line1: v.string(),
  line2: v.optional(v.string()),
  city: v.string(),
  region: v.string(),
  notes: v.optional(v.string()),
});

/** Pickup location snapshot embedded in orders */
export const pickupSnapshotValidator = v.object({
  name: v.string(),
  address: v.string(),
  openingHours: v.string(),
});

/** Order item snapshot (immutable snapshot of product at purchase time) */
export const orderItemValidator = v.object({
  productId: v.id("products"),
  name: v.string(),
  sku: v.optional(v.string()),
  unitPrice: v.number(), // In pesewas
  quantity: v.number(),
  imageId: v.optional(v.id("_storage")),
});

/** Announcement banner settings */
export const announcementValidator = v.object({
  enabled: v.boolean(),
  text: v.string(),
  link: v.optional(v.string()),
});

/** Hero section settings */
export const heroSettingsValidator = v.object({
  title: v.string(),
  subtitle: v.string(),
  buttonText: v.string(),
  buttonLink: v.string(),
  imageId: v.optional(v.id("_storage")),
});

/** Promo tile (homepage grid) */
export const promoTileValidator = v.object({
  title: v.string(),
  subtitle: v.string(),
  link: v.string(),
  imageId: v.optional(v.id("_storage")),
});

/** Shop MoMo account details (stored in siteSettings) */
export const momoAccountValidator = v.object({
  network: momoNetworkValidator,
  number: v.string(),   // e.g. "0241234567"
  name: v.string(),     // Account name — shown to customers to verify transfer
});

/** Social media links */
export const socialLinksValidator = v.object({
  facebook: v.optional(v.string()),
  instagram: v.optional(v.string()),
  x: v.optional(v.string()),
  tiktok: v.optional(v.string()),
  youtube: v.optional(v.string()),
  whatsapp: v.optional(v.string()),
});
