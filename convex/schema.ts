import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";
import {
  announcementValidator,
  cartItemValidator,
  customerValidator,
  deliveryAddressValidator,
  fulfillmentValidator,
  heroSettingsValidator,
  momoAccountValidator,
  momoNetworkValidator,
  orderEventTypeValidator,
  orderItemValidator,
  orderStatusValidator,
  paymentMethodValidator,
  paymentStatusValidator,
  pickupSnapshotValidator,
  promoTileValidator,
  roleValidator,
  socialLinksValidator,
  specItemValidator,
  stockAdjustmentReasonValidator,
} from "./lib/validators";

export default defineSchema({
  // Convex Auth system tables (sessions, verification codes, accounts)
  ...authTables,

  // Users (extended with Convex Auth in Step 3)
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    role: roleValidator,
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_created", ["createdAt"]),

  // Product categories (supports up to two levels via parentId)
  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    parentId: v.optional(v.id("categories")),
    description: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
    sortOrder: v.number(),
    isActive: v.boolean(),
    specTemplate: v.optional(v.array(v.string())),
  })
    .index("by_slug", ["slug"])
    .index("by_parent_and_sort", ["parentId", "sortOrder"]),

  // Products
  products: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(), // Markdown string
    categoryId: v.id("categories"),
    brand: v.optional(v.string()),
    sku: v.optional(v.string()),
    price: v.number(), // Integer in pesewas
    salePrice: v.optional(v.number()), // Integer in pesewas
    stock: v.number(), // Physical units on hand
    reservedStock: v.number(), // Units reserved by unpaid/unconfirmed orders
    imageIds: v.array(v.id("_storage")),
    specs: v.array(specItemValidator),
    isActive: v.boolean(),
    isFeatured: v.boolean(),
    searchText: v.string(), // Maintained by code: name + brand + sku + category, lowercased
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_category_active", ["categoryId", "isActive"])
    .index("by_active_created", ["isActive", "createdAt"])
    .index("by_featured_active", ["isFeatured", "isActive"])
    .index("by_sku", ["sku"])
    .index("by_brand", ["brand"])
    .searchIndex("search_text", {
      searchField: "searchText",
      filterFields: ["isActive", "categoryId"],
    }),

  // Persistent shopping carts for authenticated users
  carts: defineTable({
    userId: v.id("users"),
    items: v.array(cartItemValidator),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Saved user delivery addresses
  addresses: defineTable({
    userId: v.id("users"),
    label: v.string(),
    recipientName: v.string(),
    phone: v.string(),
    line1: v.string(),
    line2: v.optional(v.string()),
    city: v.string(),
    region: v.string(),
    notes: v.optional(v.string()),
    isDefault: v.boolean(),
  }).index("by_user", ["userId"]),

  // Customer orders
  orders: defineTable({
    orderNumber: v.string(), // e.g. "ORD-000123"
    userId: v.optional(v.id("users")),
    guestToken: v.optional(v.string()),
    checkoutKey: v.string(), // For idempotency — prevents duplicate order submission

    // Customer snapshot (immutable at checkout)
    customer: customerValidator,

    // Fulfillment
    fulfillment: fulfillmentValidator,
    deliveryAddress: v.optional(deliveryAddressValidator),
    deliveryZoneId: v.optional(v.id("deliveryZones")),
    deliveryZoneName: v.optional(v.string()),
    pickupLocationId: v.optional(v.id("pickupLocations")),
    pickupSnapshot: v.optional(pickupSnapshotValidator),

    // Items (immutable snapshot at checkout)
    items: v.array(orderItemValidator),

    // Money (all in pesewas — integers)
    subtotal: v.number(),
    deliveryFee: v.number(), // 0 for pickup and COD (fee collected on arrival)
    total: v.number(),
    currency: v.string(), // "GHS"

    // Status
    status: orderStatusValidator,

    // Payment
    paymentMethod: paymentMethodValidator,
    paymentStatus: paymentStatusValidator,

    // MoMo-specific fields (null for COD / pay-in-store orders)
    momoNetwork: v.optional(momoNetworkValidator), // Network customer used
    momoPhone: v.optional(v.string()),             // Number customer sent from
    momoReference: v.optional(v.string()),         // Reference/transaction ID customer provides

    // Timestamps
    paidAt: v.optional(v.number()),
    cancelReason: v.optional(v.string()),

    // Admin tooling
    needsAttention: v.boolean(),
    attentionReason: v.optional(v.string()),
    customerNote: v.optional(v.string()),
    internalNote: v.optional(v.string()),

    // Auto-cancel unpaid MoMo orders after configurable window
    expiresAt: v.optional(v.number()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_order_number", ["orderNumber"])
    .index("by_user_created", ["userId", "createdAt"])
    .index("by_status_created", ["status", "createdAt"])
    .index("by_payment_status", ["paymentStatus"])
    .index("by_payment_method", ["paymentMethod"])
    .index("by_checkout_key", ["checkoutKey"])
    .index("by_email", ["customer.email"])
    .index("by_expires_at", ["status", "expiresAt"])
    .index("by_needs_attention", ["needsAttention"]),

  // Audit trail of events and state transitions for each order
  orderEvents: defineTable({
    orderId: v.id("orders"),
    type: orderEventTypeValidator,
    fromStatus: v.optional(v.string()),
    toStatus: v.optional(v.string()),
    message: v.string(),
    actorId: v.optional(v.string()), // userId or "system"
    createdAt: v.number(),
  }).index("by_order_created", ["orderId", "createdAt"]),

  // Delivery zones and pricing
  deliveryZones: defineTable({
    name: v.string(),
    fee: v.number(), // Pesewas
    estimatedDays: v.string(), // e.g. "1-2 business days"
    isActive: v.boolean(),
    sortOrder: v.number(),
  }).index("by_active_and_sort", ["isActive", "sortOrder"]),

  // In-store pickup locations
  pickupLocations: defineTable({
    name: v.string(),
    address: v.string(),
    phone: v.string(),
    openingHours: v.string(),
    isActive: v.boolean(),
    sortOrder: v.number(),
  }).index("by_active_and_sort", ["isActive", "sortOrder"]),

  // Singleton site settings and storefront configuration
  siteSettings: defineTable({
    shopName: v.string(),
    tagline: v.string(),
    currency: v.string(), // "GHS"
    defaultCountryCode: v.string(), // "GH"
    contactEmail: v.string(),
    contactPhone: v.string(),
    whatsappNumber: v.string(),
    address: v.string(),
    announcement: announcementValidator,
    hero: heroSettingsValidator,
    promoTiles: v.array(promoTileValidator),

    // Payment
    momoAccounts: v.array(momoAccountValidator), // Shop's MoMo numbers (shown to customer at checkout)
    cashOnDeliveryEnabled: v.boolean(),
    payInStoreEnabled: v.boolean(),

    // Thresholds
    freeDeliveryThreshold: v.optional(v.number()), // Pesewas; null = no free delivery
    orderExpiryMinutes: v.number(), // How long before an unpaid MoMo order is auto-cancelled
    lowStockThreshold: v.number(),
    maxCartQuantity: v.number(),
    pricesIncludeTaxNote: v.string(), // Shown near prices, e.g. "Prices include VAT"

    socialLinks: socialLinksValidator,
  }),

  // Content pages (about, terms, privacy, delivery-returns, warranty, faq)
  pages: defineTable({
    slug: v.string(),
    title: v.string(),
    body: v.string(), // Markdown
    isPublished: v.boolean(),
    showInFooter: v.boolean(),
    sortOrder: v.number(),
    updatedAt: v.number(),
  }).index("by_slug", ["slug"]),

  // Contact form submissions
  contactMessages: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    message: v.string(),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_created", ["createdAt"])
    .index("by_email_created", ["email", "createdAt"]),

  // Full inventory audit trail for physical and reserved stock changes
  stockAdjustments: defineTable({
    productId: v.id("products"),
    delta: v.number(), // Signed integer: + for restock, - for sale/reduction
    reason: stockAdjustmentReasonValidator,
    orderId: v.optional(v.id("orders")),
    actorId: v.optional(v.string()),
    note: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_product_created", ["productId", "createdAt"]).index("by_created", ["createdAt"]).index("by_reason_created", ["reason", "createdAt"]),

  // Atomic sequence counters (e.g. for generating ORD-000001)
  counters: defineTable({
    name: v.string(),
    value: v.number(),
  }).index("by_name", ["name"]),

  // Administrative audit trail
  auditLogs: defineTable({
    actorId: v.optional(v.string()),
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    summary: v.string(),
    createdAt: v.number(),
  })
    .index("by_created", ["createdAt"])
    .index("by_entity", ["entityType", "entityId"]),

  // Transactional email dispatch log
  emailLogs: defineTable({
    to: v.string(),
    template: v.string(),
    status: v.union(v.literal("sent"), v.literal("failed")),
    error: v.optional(v.string()),
    orderId: v.optional(v.id("orders")),
    createdAt: v.number(),
  }).index("by_created", ["createdAt"]),
});
