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
