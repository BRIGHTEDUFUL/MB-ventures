import { v } from "convex/values";
import { query } from "./_generated/server";
import { availableStock, effectivePrice, isOnSale, stockLabel } from "./lib/availability";

/**
 * Helper to enrich a product document with resolved image URLs and computed pricing/stock.
 */
async function enrichProduct(
  ctx: { storage: { getUrl: (id: string) => Promise<string | null> } },
  product: any
) {
  const imageUrls = await Promise.all(
    (product.imageIds || []).map((id: string) => ctx.storage.getUrl(id))
  );

  const available = availableStock(product);
  const currentEffectivePrice = effectivePrice(product);
  const onSale = isOnSale(product);
  const inventoryStatus = stockLabel(product);

  return {
    ...product,
    imageUrls: imageUrls.filter((url): url is string => url !== null),
    primaryImageUrl: imageUrls[0] || null,
    availableStock: available,
    effectivePrice: currentEffectivePrice,
    isOnSale: onSale,
    inventoryStatus,
  };
}

/**
 * List all active products with optional category and search filtering.
 */
export const listAll = query({
  args: {
    categorySlug: v.optional(v.string()),
    sortBy: v.optional(v.union(v.literal("latest"), v.literal("price_asc"), v.literal("price_desc"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let category = null;
    if (args.categorySlug) {
      category = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", args.categorySlug!))
        .first();
    }

    let products;
    if (category) {
      products = await ctx.db
        .query("products")
        .withIndex("by_category_active", (q) =>
          q.eq("categoryId", category._id).eq("isActive", true)
        )
        .collect();
    } else {
      products = await ctx.db
        .query("products")
        .withIndex("by_active_created", (q) => q.eq("isActive", true))
        .order("desc")
        .collect();
    }

    if (args.sortBy === "price_asc") {
      products.sort((a, b) => effectivePrice(a) - effectivePrice(b));
    } else if (args.sortBy === "price_desc") {
      products.sort((a, b) => effectivePrice(b) - effectivePrice(a));
    }

    if (args.limit) {
      products = products.slice(0, args.limit);
    }

    return Promise.all(products.map((p) => enrichProduct(ctx, p)));
  },
});

/**
 * List featured products for the storefront homepage.
 */
export const listFeatured = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 8;
    const products = await ctx.db
      .query("products")
      .withIndex("by_featured_active", (q) =>
        q.eq("isFeatured", true).eq("isActive", true)
      )
      .take(limit);

    return Promise.all(products.map((p) => enrichProduct(ctx, p)));
  },
});

/**
 * List latest products for new arrivals.
 */
export const listLatest = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 8;
    const products = await ctx.db
      .query("products")
      .withIndex("by_active_created", (q) => q.eq("isActive", true))
      .order("desc")
      .take(limit);

    return Promise.all(products.map((p) => enrichProduct(ctx, p)));
  },
});

/**
 * List products by category slug.
 */
export const listByCategory = query({
  args: {
    categorySlug: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.categorySlug))
      .first();

    if (!category || !category.isActive) {
      return { category: null, products: [] };
    }

    const limit = args.limit ?? 24;
    const products = await ctx.db
      .query("products")
      .withIndex("by_category_active", (q) =>
        q.eq("categoryId", category._id).eq("isActive", true)
      )
      .take(limit);

    const enriched = await Promise.all(products.map((p) => enrichProduct(ctx, p)));

    return {
      category,
      products: enriched,
    };
  },
});

/**
 * List related products within the same category.
 */
export const listRelated = query({
  args: {
    productId: v.id("products"),
    categoryId: v.id("categories"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 4;
    const products = await ctx.db
      .query("products")
      .withIndex("by_category_active", (q) =>
        q.eq("categoryId", args.categoryId).eq("isActive", true)
      )
      .filter((q) => q.neq(q.field("_id"), args.productId))
      .take(limit);

    return Promise.all(products.map((p) => enrichProduct(ctx, p)));
  },
});

/**
 * Get product by unique slug.
 */
export const getBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!product || !product.isActive) {
      return null;
    }

    const category = await ctx.db.get(product.categoryId);
    const enriched = await enrichProduct(ctx, product);

    return {
      ...enriched,
      category: category?.name || "",
      categorySlug: category?.slug || "",
    };
  },
});

/**
 * Search products by keyword using full-text search index.
 */
export const search = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
    categoryId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    const term = args.query.trim().toLowerCase();
    if (!term) return [];

    let searchBuilder = ctx.db
      .query("products")
      .withSearchIndex("search_text", (q) => {
        let sq = q.search("searchText", term).eq("isActive", true);
        if (args.categoryId) {
          sq = sq.eq("categoryId", args.categoryId);
        }
        return sq;
      });

    const results = await searchBuilder.take(args.limit ?? 12);
    return Promise.all(results.map((p) => enrichProduct(ctx, p)));
  },
});
