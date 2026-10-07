/**
 * Slugs that content pages may not claim — they collide with real app routes
 * or admin paths. The storefront [slug] route keeps an inline copy of this list
 * for defense in depth (it cannot import from convex/ in a server component).
 */
export const RESERVED_SLUGS = [
  "cart", "checkout", "search", "category", "product", "account", "admin",
  "track", "contact", "sign-in", "sign-up", "forgot-password", "reset-password",
  "order", "catalog", "orders",
] as const;
