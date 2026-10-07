import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * List all active categories sorted by sortOrder.
 * Supports parentId filtering or retrieving root categories with their subcategories.
 */
export const list = query({
  args: {
    parentId: v.optional(v.union(v.id("categories"), v.null())),
  },
  handler: async (ctx, args) => {
    let q;
    if (args.parentId === null) {
      // Root categories only (parentId is undefined/null)
      const all = await ctx.db
        .query("categories")
        .withIndex("by_parent_and_sort")
        .collect();
      return all
        .filter((cat) => cat.isActive && cat.parentId === undefined)
        .sort((a, b) => a.sortOrder - b.sortOrder);
    } else if (args.parentId) {
      // Subcategories of a specific category
      const pid = args.parentId;
      q = ctx.db
        .query("categories")
        .withIndex("by_parent_and_sort", (q) => q.eq("parentId", pid));
      const list = await q.collect();
      return list.filter((cat) => cat.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
    } else {
      // All active categories
      const all = await ctx.db.query("categories").collect();
      return all.filter((cat) => cat.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
    }
  },
});

/**
 * Get category by unique slug.
 */
export const getBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!category || !category.isActive) {
      return null;
    }

    // Also fetch subcategories if any
    const subcategories = await ctx.db
      .query("categories")
      .withIndex("by_parent_and_sort", (q) => q.eq("parentId", category._id))
      .collect();

    return {
      ...category,
      subcategories: subcategories.filter((sub) => sub.isActive),
    };
  },
});
