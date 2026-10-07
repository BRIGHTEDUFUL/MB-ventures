import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./users";
import { buildSearchText } from "./lib/searchText";

/**
 * Admin Query: List all categories with parent hierarchies and product counts.
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const categories = await ctx.db.query("categories").collect();
    const products = await ctx.db.query("products").collect();

    // Map parent names
    const categoryMap = new Map(categories.map((c) => [c._id, c]));

    // Compute product counts per category
    const countMap = new Map<string, { total: number; active: number }>();
    for (const p of products) {
      const existing = countMap.get(p.categoryId) || { total: 0, active: 0 };
      existing.total += 1;
      if (p.isActive) existing.active += 1;
      countMap.set(p.categoryId, existing);
    }

    const categoriesWithMeta = await Promise.all(
      categories.map(async (cat) => {
        let imageUrl: string | null = null;
        if (cat.imageId) {
          imageUrl = await ctx.storage.getUrl(cat.imageId);
        }

        const parent = cat.parentId ? categoryMap.get(cat.parentId) : null;
        const counts = countMap.get(cat._id) || { total: 0, active: 0 };

        return {
          _id: cat._id,
          name: cat.name,
          slug: cat.slug,
          parentId: cat.parentId,
          parentName: parent?.name,
          description: cat.description,
          imageId: cat.imageId,
          imageUrl,
          sortOrder: cat.sortOrder,
          isActive: cat.isActive,
          specTemplate: cat.specTemplate || [],
          totalProducts: counts.total,
          activeProducts: counts.active,
        };
      })
    );

    return categoriesWithMeta.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

/**
 * Admin Mutation: Create category with spec templates and unique slug check.
 */
export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    parentId: v.optional(v.id("categories")),
    description: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
    sortOrder: v.number(),
    isActive: v.boolean(),
    specTemplate: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const nameTrimmed = args.name.trim();
    const slugTrimmed = args.slug.trim().toLowerCase();

    if (!nameTrimmed) throw new Error("Category name is required.");
    if (!slugTrimmed) throw new Error("Category slug is required.");

    // Check slug uniqueness
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", slugTrimmed))
      .first();

    if (existing) {
      throw new Error(`A category with slug "${slugTrimmed}" already exists.`);
    }

    // Enforce 2-level maximum hierarchy
    if (args.parentId) {
      const parent = await ctx.db.get(args.parentId);
      if (!parent) throw new Error("Selected parent category does not exist.");
      if (parent.parentId) {
        throw new Error("Cannot nest under a subcategory. Maximum 2 levels permitted.");
      }
    }

    const categoryId = await ctx.db.insert("categories", {
      name: nameTrimmed,
      slug: slugTrimmed,
      parentId: args.parentId,
      description: args.description?.trim(),
      imageId: args.imageId,
      sortOrder: args.sortOrder,
      isActive: args.isActive,
      specTemplate: args.specTemplate?.map((s) => s.trim()).filter(Boolean),
    });

    return categoryId;
  },
});

/**
 * Admin Mutation: Update category fields and sync product search texts if name changes.
 */
export const update = mutation({
  args: {
    id: v.id("categories"),
    name: v.string(),
    slug: v.string(),
    parentId: v.optional(v.id("categories")),
    description: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
    sortOrder: v.number(),
    isActive: v.boolean(),
    specTemplate: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const category = await ctx.db.get(args.id);
    if (!category) throw new Error("Category not found.");

    const nameTrimmed = args.name.trim();
    const slugTrimmed = args.slug.trim().toLowerCase();

    if (!nameTrimmed) throw new Error("Category name is required.");
    if (!slugTrimmed) throw new Error("Category slug is required.");

    // Check slug uniqueness if changed
    if (slugTrimmed !== category.slug) {
      const existing = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", slugTrimmed))
        .first();

      if (existing && existing._id !== args.id) {
        throw new Error(`A category with slug "${slugTrimmed}" already exists.`);
      }
    }

    // Prevent self-parenting
    if (args.parentId && args.parentId === args.id) {
      throw new Error("A category cannot be its own parent.");
    }

    // Enforce 2-level limit
    if (args.parentId) {
      const parent = await ctx.db.get(args.parentId);
      if (parent?.parentId) {
        throw new Error("Cannot nest under a subcategory. Maximum 2 levels permitted.");
      }
    }

    await ctx.db.patch(category._id, {
      name: nameTrimmed,
      slug: slugTrimmed,
      parentId: args.parentId,
      description: args.description?.trim(),
      imageId: args.imageId,
      sortOrder: args.sortOrder,
      isActive: args.isActive,
      specTemplate: args.specTemplate?.map((s) => s.trim()).filter(Boolean),
    });

    // If category name changed, update searchText on associated products
    if (nameTrimmed !== category.name) {
      const products = await ctx.db
        .query("products")
        .withIndex("by_category_active", (q) => q.eq("categoryId", category._id))
        .collect();

      for (const p of products) {
        const searchText = buildSearchText(p, nameTrimmed);
        await ctx.db.patch(p._id, {
          searchText,
          updatedAt: Date.now(),
        });
      }
    }

    return { success: true };
  },
});

/**
 * Admin Mutation: Delete category with strict validation.
 */
export const remove = mutation({
  args: {
    id: v.id("categories"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const category = await ctx.db.get(args.id);
    if (!category) throw new Error("Category not found.");

    // Check if subcategories exist
    const children = await ctx.db
      .query("categories")
      .withIndex("by_parent_and_sort", (q) => q.eq("parentId", category._id))
      .collect();

    if (children.length > 0) {
      throw new Error(
        `Cannot delete "${category.name}" because it has ${children.length} subcategories. Please reassign or delete them first, or deactivate this category.`
      );
    }

    // Check if products exist in category
    const products = await ctx.db
      .query("products")
      .withIndex("by_category_active", (q) => q.eq("categoryId", category._id))
      .first();

    if (products) {
      throw new Error(
        `Cannot delete "${category.name}" because it contains products. Please move or delete the products first, or deactivate the category.`
      );
    }

    // Delete image from storage if present
    if (category.imageId) {
      try {
        await ctx.storage.delete(category.imageId);
      } catch (e) {
        console.error("Failed to delete category image:", e);
      }
    }

    await ctx.db.delete(category._id);
    return { success: true };
  },
});

/**
 * Admin Mutation: Toggle active status.
 */
export const toggleActive = mutation({
  args: {
    id: v.id("categories"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.id, { isActive: args.isActive });
    return { success: true };
  },
});
