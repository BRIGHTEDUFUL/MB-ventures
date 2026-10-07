import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./users";
import { buildSearchText } from "./lib/searchText";
import { specItemValidator } from "./lib/validators";
import type { Id } from "./_generated/dataModel";

/**
 * Admin Query: List products with filters, sorting, and stock calculations.
 */
export const list = query({
  args: {
    categoryId: v.optional(v.id("categories")),
    isActive: v.optional(v.boolean()),
    isFeatured: v.optional(v.boolean()),
    stockStatus: v.optional(v.string()), // "all" | "in_stock" | "low_stock" | "out_of_stock"
    search: v.optional(v.string()),
    sort: v.optional(v.string()), // "newest" | "name" | "price_asc" | "price_desc" | "stock_asc" | "stock_desc"
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    let products = await ctx.db.query("products").collect();
    const categories = await ctx.db.query("categories").collect();
    const siteSettings = await ctx.db.query("siteSettings").first();
    const lowStockThreshold = siteSettings?.lowStockThreshold ?? 3;

    const categoryMap = new Map(categories.map((c) => [c._id, c.name]));

    // Filter by category
    if (args.categoryId) {
      products = products.filter((p) => p.categoryId === args.categoryId);
    }

    // Filter by active
    if (args.isActive !== undefined) {
      products = products.filter((p) => p.isActive === args.isActive);
    }

    // Filter by featured
    if (args.isFeatured !== undefined) {
      products = products.filter((p) => p.isFeatured === args.isFeatured);
    }

    // Filter by stock status
    if (args.stockStatus && args.stockStatus !== "all") {
      products = products.filter((p) => {
        const available = p.stock - p.reservedStock;
        if (args.stockStatus === "out_of_stock") return available <= 0;
        if (args.stockStatus === "low_stock") return available > 0 && available <= lowStockThreshold;
        if (args.stockStatus === "in_stock") return available > lowStockThreshold;
        return true;
      });
    }

    // Filter by search query
    if (args.search?.trim()) {
      const q = args.search.trim().toLowerCase();
      products = products.filter((p) => {
        const matchName = p.name.toLowerCase().includes(q);
        const matchBrand = p.brand?.toLowerCase().includes(q);
        const matchSku = p.sku?.toLowerCase().includes(q);
        return matchName || matchBrand || matchSku;
      });
    }

    // Sort products
    const sort = args.sort || "newest";
    products.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "price_asc") return a.price - b.price;
      if (sort === "price_desc") return b.price - a.price;
      if (sort === "stock_asc") return (a.stock - a.reservedStock) - (b.stock - b.reservedStock);
      if (sort === "stock_desc") return (b.stock - b.reservedStock) - (a.stock - a.reservedStock);
      return b.createdAt - a.createdAt; // newest default
    });

    // Attach primary image URLs
    const productsWithMeta = await Promise.all(
      products.map(async (p) => {
        let primaryImageUrl: string | null = null;
        if (p.imageIds.length > 0) {
          primaryImageUrl = await ctx.storage.getUrl(p.imageIds[0]);
        }

        const availableStock = Math.max(0, p.stock - p.reservedStock);
        const categoryName = categoryMap.get(p.categoryId) || "Uncategorized";

        return {
          _id: p._id,
          name: p.name,
          slug: p.slug,
          brand: p.brand,
          sku: p.sku,
          price: p.price,
          salePrice: p.salePrice,
          stock: p.stock,
          reservedStock: p.reservedStock,
          availableStock,
          imageIds: p.imageIds,
          primaryImageUrl,
          categoryId: p.categoryId,
          categoryName,
          isActive: p.isActive,
          isFeatured: p.isFeatured,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        };
      })
    );

    return productsWithMeta;
  },
});

/**
 * Admin Query: Get full product details for editing.
 */
export const get = query({
  args: {
    id: v.id("products"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const product = await ctx.db.get(args.id);
    if (!product) return null;

    const category = await ctx.db.get(product.categoryId);

    // Resolve all image URLs
    const images = await Promise.all(
      product.imageIds.map(async (storageId) => {
        const url = await ctx.storage.getUrl(storageId);
        return {
          storageId,
          url: url || "",
        };
      })
    );

    return {
      ...product,
      categoryName: category?.name,
      images,
    };
  },
});

/**
 * Admin Mutation: Create a new product.
 */
export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    categoryId: v.id("categories"),
    brand: v.optional(v.string()),
    sku: v.optional(v.string()),
    price: v.number(), // Minor pesewas
    salePrice: v.optional(v.number()), // Minor pesewas
    stock: v.number(),
    imageIds: v.array(v.id("_storage")),
    specs: v.array(specItemValidator),
    isActive: v.boolean(),
    isFeatured: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { user } = await requireAdmin(ctx);

    const nameTrimmed = args.name.trim();
    const slugTrimmed = args.slug.trim().toLowerCase();
    const skuTrimmed = args.sku?.trim() || undefined;

    if (!nameTrimmed) throw new Error("Product name is required.");
    if (!slugTrimmed) throw new Error("Product slug is required.");
    if (args.price <= 0) throw new Error("Price must be greater than 0.");
    if (args.salePrice !== undefined && args.salePrice >= args.price) {
      throw new Error("Sale price must be strictly lower than regular price.");
    }

    // Check slug uniqueness
    const existingSlug = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", slugTrimmed))
      .first();

    if (existingSlug) {
      throw new Error(`A product with slug "${slugTrimmed}" already exists.`);
    }

    // Check SKU uniqueness if provided
    if (skuTrimmed) {
      const existingSku = await ctx.db
        .query("products")
        .withIndex("by_sku", (q) => q.eq("sku", skuTrimmed))
        .first();

      if (existingSku) {
        throw new Error(`A product with SKU "${skuTrimmed}" already exists.`);
      }
    }

    const category = await ctx.db.get(args.categoryId);
    const categoryName = category?.name || "";

    const now = Date.now();

    const productDoc = {
      name: nameTrimmed,
      slug: slugTrimmed,
      description: args.description.trim(),
      categoryId: args.categoryId,
      brand: args.brand?.trim() || undefined,
      sku: skuTrimmed,
      price: args.price,
      salePrice: args.salePrice,
      stock: Math.max(0, args.stock),
      reservedStock: 0,
      imageIds: args.imageIds,
      specs: args.specs,
      isActive: args.isActive,
      isFeatured: args.isFeatured,
      searchText: "",
      createdAt: now,
      updatedAt: now,
    };

    productDoc.searchText = buildSearchText(productDoc, categoryName);

    const productId = await ctx.db.insert("products", productDoc);

    // If initial stock was provided, record stock adjustment
    if (args.stock > 0) {
      await ctx.db.insert("stockAdjustments", {
        productId,
        delta: args.stock,
        reason: "restock",
        actorId: String(user._id),
        note: `Initial inventory created for "${nameTrimmed}"`,
        createdAt: now,
      });
    }

    return productId;
  },
});

/**
 * Admin Mutation: Update an existing product.
 */
export const update = mutation({
  args: {
    id: v.id("products"),
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    categoryId: v.id("categories"),
    brand: v.optional(v.string()),
    sku: v.optional(v.string()),
    price: v.number(),
    salePrice: v.optional(v.number()),
    stock: v.number(),
    imageIds: v.array(v.id("_storage")),
    specs: v.array(specItemValidator),
    isActive: v.boolean(),
    isFeatured: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { user } = await requireAdmin(ctx);

    const product = await ctx.db.get(args.id);
    if (!product) throw new Error("Product not found.");

    const nameTrimmed = args.name.trim();
    const slugTrimmed = args.slug.trim().toLowerCase();
    const skuTrimmed = args.sku?.trim() || undefined;

    if (!nameTrimmed) throw new Error("Product name is required.");
    if (!slugTrimmed) throw new Error("Product slug is required.");
    if (args.price <= 0) throw new Error("Price must be greater than 0.");
    if (args.salePrice !== undefined && args.salePrice >= args.price) {
      throw new Error("Sale price must be strictly lower than regular price.");
    }

    // Check slug uniqueness
    if (slugTrimmed !== product.slug) {
      const existingSlug = await ctx.db
        .query("products")
        .withIndex("by_slug", (q) => q.eq("slug", slugTrimmed))
        .first();

      if (existingSlug && existingSlug._id !== args.id) {
        throw new Error(`A product with slug "${slugTrimmed}" already exists.`);
      }
    }

    // Check SKU uniqueness
    if (skuTrimmed && skuTrimmed !== product.sku) {
      const existingSku = await ctx.db
        .query("products")
        .withIndex("by_sku", (q) => q.eq("sku", skuTrimmed))
        .first();

      if (existingSku && existingSku._id !== args.id) {
        throw new Error(`A product with SKU "${skuTrimmed}" already exists.`);
      }
    }

    // Check physical stock lower bound vs reservedStock
    if (args.stock < product.reservedStock) {
      throw new Error(
        `Physical stock cannot be set lower than ${product.reservedStock} (units currently reserved by pending orders).`
      );
    }

    const category = await ctx.db.get(args.categoryId);
    const categoryName = category?.name || "";

    const now = Date.now();

    const productDoc = {
      name: nameTrimmed,
      slug: slugTrimmed,
      description: args.description.trim(),
      categoryId: args.categoryId,
      brand: args.brand?.trim() || undefined,
      sku: skuTrimmed,
      price: args.price,
      salePrice: args.salePrice,
      stock: args.stock,
      imageIds: args.imageIds,
      specs: args.specs,
      isActive: args.isActive,
      isFeatured: args.isFeatured,
      searchText: "",
      updatedAt: now,
    };

    productDoc.searchText = buildSearchText({ ...product, ...productDoc }, categoryName);

    // Delete orphaned storage images
    const removedImageIds = product.imageIds.filter((id) => !args.imageIds.includes(id));
    for (const storageId of removedImageIds) {
      try {
        await ctx.storage.delete(storageId);
      } catch (e) {
        console.error("Failed to delete orphaned storage image:", e);
      }
    }

    // Record stock adjustment if stock changed
    if (args.stock !== product.stock) {
      const delta = args.stock - product.stock;
      await ctx.db.insert("stockAdjustments", {
        productId: product._id,
        delta,
        reason: delta > 0 ? "restock" : "manual",
        actorId: String(user._id),
        note: `Stock updated from ${product.stock} to ${args.stock}`,
        createdAt: now,
      });
    }

    await ctx.db.patch(product._id, productDoc);
    return { success: true };
  },
});

/**
 * Admin Mutation: Quick physical stock adjustment with reason note.
 */
export const adjustStock = mutation({
  args: {
    productId: v.id("products"),
    newPhysicalStock: v.number(),
    reason: v.union(v.literal("manual"), v.literal("restock"), v.literal("correction")),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { user } = await requireAdmin(ctx);

    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found.");

    if (args.newPhysicalStock < product.reservedStock) {
      throw new Error(
        `Cannot set stock to ${args.newPhysicalStock}. At least ${product.reservedStock} units are reserved by pending orders.`
      );
    }

    const delta = args.newPhysicalStock - product.stock;
    if (delta === 0) return { success: true };

    const now = Date.now();

    await ctx.db.patch(product._id, {
      stock: args.newPhysicalStock,
      updatedAt: now,
    });

    await ctx.db.insert("stockAdjustments", {
      productId: product._id,
      delta,
      reason: args.reason,
      actorId: String(user._id),
      note: args.note?.trim() || `Stock adjusted from ${product.stock} to ${args.newPhysicalStock}`,
      createdAt: now,
    });

    return { success: true };
  },
});

/**
 * Admin Mutation: Duplicate a product.
 */
export const duplicate = mutation({
  args: {
    id: v.id("products"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const product = await ctx.db.get(args.id);
    if (!product) throw new Error("Product not found.");

    const now = Date.now();
    const newName = `${product.name} (Copy)`;
    const newSlug = `${product.slug}-copy-${Math.random().toString(36).substring(2, 6)}`;

    const category = await ctx.db.get(product.categoryId);
    const categoryName = category?.name || "";

    const newProduct = {
      name: newName,
      slug: newSlug,
      description: product.description,
      categoryId: product.categoryId,
      brand: product.brand,
      sku: product.sku ? `${product.sku}-COPY` : undefined,
      price: product.price,
      salePrice: product.salePrice,
      stock: 0,
      reservedStock: 0,
      imageIds: product.imageIds,
      specs: product.specs,
      isActive: false,
      isFeatured: false,
      searchText: "",
      createdAt: now,
      updatedAt: now,
    };

    newProduct.searchText = buildSearchText(newProduct, categoryName);

    const duplicateId = await ctx.db.insert("products", newProduct);
    return duplicateId;
  },
});

/**
 * Admin Mutation: Delete a product with order history guard.
 */
export const remove = mutation({
  args: {
    id: v.id("products"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const product = await ctx.db.get(args.id);
    if (!product) throw new Error("Product not found.");

    // Check if product is referenced in any past orders
    const orders = await ctx.db.query("orders").collect();
    const hasOrderHistory = orders.some((o) =>
      o.items.some((i) => i.productId === product._id)
    );

    if (hasOrderHistory) {
      throw new Error(
        `Cannot delete "${product.name}" because it appears in past customer orders. Please deactivate the product instead to preserve order records.`
      );
    }

    // Delete image files from storage
    for (const storageId of product.imageIds) {
      try {
        await ctx.storage.delete(storageId);
      } catch (e) {
        console.error("Failed to delete storage image:", e);
      }
    }

    await ctx.db.delete(product._id);
    return { success: true };
  },
});

/**
 * Admin Mutation: Toggle active status.
 */
export const toggleActive = mutation({
  args: {
    id: v.id("products"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.id, { isActive: args.isActive, updatedAt: Date.now() });
    return { success: true };
  },
});

/**
 * Admin Mutation: Toggle featured status.
 */
export const toggleFeatured = mutation({
  args: {
    id: v.id("products"),
    isFeatured: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.id, { isFeatured: args.isFeatured, updatedAt: Date.now() });
    return { success: true };
  },
});
