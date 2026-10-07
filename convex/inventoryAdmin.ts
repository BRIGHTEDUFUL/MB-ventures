import { v, type Infer } from "convex/values";
import { query, type QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { requireAdmin } from "./users";
import { stockAdjustmentReasonValidator } from "./lib/validators";

/** Units available at or below this are flagged low. Server-only: clients read `isLow`. */
const LOW_STOCK_THRESHOLD = 5;
/** Only the most recent N documents of a scan are considered (documented limitation). */
const MAX_SCAN = 2000;
const DEFAULT_LIST_LIMIT = 50;
const MAX_LIST_LIMIT = 100;
const DEFAULT_HISTORY_LIMIT = 20;
const DEFAULT_MOVEMENTS_LIMIT = 30;
const MAX_PAGE_LIMIT = 100;

/** One row of the inventory table. */
const listItemValidator = v.object({
  _id: v.id("products"),
  name: v.string(),
  slug: v.string(),
  sku: v.string(),
  categoryId: v.id("categories"),
  categoryName: v.string(),
  brand: v.string(),
  price: v.number(),
  salePrice: v.optional(v.number()),
  stock: v.number(),
  reserved: v.number(),
  available: v.number(),
  isLow: v.boolean(),
  isOut: v.boolean(),
  isActive: v.boolean(),
  imageUrls: v.array(v.string()),
});

/** One stock movement for a single product (order and admin resolved best-effort). */
const historyItemValidator = v.object({
  _id: v.id("stockAdjustments"),
  createdAt: v.number(),
  delta: v.number(),
  reason: stockAdjustmentReasonValidator,
  note: v.string(),
  orderId: v.optional(v.string()),
  orderNumber: v.string(),
  actorName: v.string(),
});

/** One stock movement across the whole shop, with the product it belongs to. */
const movementItemValidator = v.object({
  _id: v.id("stockAdjustments"),
  createdAt: v.number(),
  delta: v.number(),
  reason: stockAdjustmentReasonValidator,
  note: v.string(),
  orderId: v.optional(v.string()),
  orderNumber: v.string(),
  actorName: v.string(),
  productId: v.id("products"),
  productName: v.string(),
  productSlug: v.string(),
});

/** One row of the CSV export. */
const exportRowValidator = v.object({
  _id: v.id("products"),
  name: v.string(),
  sku: v.string(),
  categoryName: v.string(),
  brand: v.string(),
  price: v.number(),
  salePrice: v.optional(v.number()),
  stock: v.number(),
  reserved: v.number(),
  available: v.number(),
  isActive: v.boolean(),
});

type HistoryItem = Infer<typeof historyItemValidator>;
type MovementItem = Infer<typeof movementItemValidator>;

function normalizeOffset(offset: number | undefined): number {
  return Math.max(0, Math.floor(offset ?? 0));
}

function clampLimit(limit: number | undefined, fallback: number): number {
  return Math.min(Math.max(1, Math.floor(limit ?? fallback)), MAX_PAGE_LIMIT);
}

/** Loads every product up to the scan cap plus a category id -> name lookup. */
async function loadProducts(ctx: QueryCtx) {
  const [products, categories] = await Promise.all([
    ctx.db.query("products").withIndex("by_active_created").take(MAX_SCAN),
    ctx.db.query("categories").collect(),
  ]);
  const categoryNames = new Map(categories.map((c) => [c._id, c.name]));
  return { products, categoryNames };
}

/**
 * Shapes stock adjustment rows as history items. Order numbers and actor names are
 * resolved best-effort with per-call caching; unresolvable actors show as "system".
 */
async function toHistoryItems(
  ctx: QueryCtx,
  rows: Doc<"stockAdjustments">[]
): Promise<HistoryItem[]> {
  const orderNumbers = new Map<string, string>();
  const actorNames = new Map<string, string>();

  const items: HistoryItem[] = [];
  for (const row of rows) {
    let orderNumber = "";
    if (row.orderId) {
      const key = String(row.orderId);
      const cached = orderNumbers.get(key);
      if (cached !== undefined) {
        orderNumber = cached;
      } else {
        const order = await ctx.db.get(row.orderId);
        const resolved = order?.orderNumber ?? "";
        orderNumbers.set(key, resolved);
        orderNumber = resolved;
      }
    }

    let actorName = "system";
    if (row.actorId) {
      const cached = actorNames.get(row.actorId);
      if (cached !== undefined) {
        actorName = cached;
      } else {
        const actorId = ctx.db.normalizeId("users", row.actorId);
        const user = actorId ? await ctx.db.get(actorId) : null;
        const resolved = user ? user.name || user.email || "system" : "system";
        actorNames.set(row.actorId, resolved);
        actorName = resolved;
      }
    }

    items.push({
      _id: row._id,
      createdAt: row.createdAt,
      delta: row.delta,
      reason: row.reason,
      note: row.note ?? "",
      orderId: row.orderId ? String(row.orderId) : undefined,
      orderNumber,
      actorName,
    });
  }
  return items;
}

/**
 * Admin Query: page through products with search, stock filters and sorting.
 * available = stock - reserved; low/out flags are computed server-side.
 */
export const list = query({
  args: {
    q: v.optional(v.string()),
    filter: v.optional(
      v.union(v.literal("all"), v.literal("low"), v.literal("out"), v.literal("inactive"))
    ),
    categoryId: v.optional(v.id("categories")),
    sort: v.optional(
      v.union(
        v.literal("available_asc"),
        v.literal("available_desc"),
        v.literal("name_asc"),
        v.literal("stock_desc")
      )
    ),
    offset: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  returns: v.object({
    items: v.array(listItemValidator),
    total: v.number(),
    hasMore: v.boolean(),
  }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const offset = normalizeOffset(args.offset);
    const limit = Math.min(
      Math.max(1, Math.floor(args.limit ?? DEFAULT_LIST_LIMIT)),
      MAX_LIST_LIMIT
    );
    const search = args.q?.trim().toLowerCase() ?? "";
    const filter = args.filter ?? "all";
    const sort = args.sort ?? "available_asc";

    const { products, categoryNames } = await loadProducts(ctx);

    const rows = products
      .map((product) => {
        const available = product.stock - product.reservedStock;
        return {
          product,
          sku: product.sku ?? "",
          brand: product.brand ?? "",
          categoryName: categoryNames.get(product.categoryId) ?? "",
          available,
          isOut: available <= 0,
          isLow: available > 0 && available <= LOW_STOCK_THRESHOLD,
        };
      })
      .filter((row) => {
        if (args.categoryId && row.product.categoryId !== args.categoryId) return false;
        if (filter === "low" && !row.isLow) return false;
        if (filter === "out" && !row.isOut) return false;
        if (filter === "inactive" && row.product.isActive) return false;
        if (search) {
          const inName = row.product.name.toLowerCase().includes(search);
          const inSku = row.sku.toLowerCase().includes(search);
          if (!inName && !inSku) return false;
        }
        return true;
      });

    rows.sort((a, b) => {
      const byName = a.product.name.localeCompare(b.product.name);
      if (sort === "available_desc") return b.available - a.available || byName;
      if (sort === "name_asc") return byName;
      if (sort === "stock_desc") return b.product.stock - a.product.stock || byName;
      return a.available - b.available || byName;
    });

    const total = rows.length;
    const page = rows.slice(offset, offset + limit);

    const items = await Promise.all(
      page.map(async (row) => ({
        _id: row.product._id,
        name: row.product.name,
        slug: row.product.slug,
        sku: row.sku,
        categoryId: row.product.categoryId,
        categoryName: row.categoryName,
        brand: row.brand,
        price: row.product.price,
        salePrice: row.product.salePrice,
        stock: row.product.stock,
        reserved: row.product.reservedStock,
        available: row.available,
        isLow: row.isLow,
        isOut: row.isOut,
        isActive: row.product.isActive,
        imageUrls: (
          await Promise.all(row.product.imageIds.map((id) => ctx.storage.getUrl(id)))
        ).filter((url): url is string => url !== null),
      }))
    );

    return { items, total, hasMore: offset + page.length < total };
  },
});

/**
 * Admin Query: stock movement history for one product, newest first.
 */
export const stockHistory = query({
  args: {
    productId: v.id("products"),
    offset: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  returns: v.object({
    items: v.array(historyItemValidator),
    total: v.number(),
    hasMore: v.boolean(),
  }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const offset = normalizeOffset(args.offset);
    const limit = clampLimit(args.limit, DEFAULT_HISTORY_LIMIT);

    const rows = await ctx.db
      .query("stockAdjustments")
      .withIndex("by_product_created", (q) => q.eq("productId", args.productId))
      .order("desc")
      .take(MAX_SCAN);

    const total = rows.length;
    const items = await toHistoryItems(ctx, rows.slice(offset, offset + limit));

    return { items, total, hasMore: offset + items.length < total };
  },
});

/**
 * Admin Query: newest stock movements across the whole shop, optionally by reason.
 */
export const recentMovements = query({
  args: {
    reason: v.optional(stockAdjustmentReasonValidator),
    offset: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  returns: v.object({
    items: v.array(movementItemValidator),
    total: v.number(),
    hasMore: v.boolean(),
  }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const offset = normalizeOffset(args.offset);
    const limit = clampLimit(args.limit, DEFAULT_MOVEMENTS_LIMIT);
    const reason = args.reason;

    const rows = reason
      ? await ctx.db
          .query("stockAdjustments")
          .withIndex("by_reason_created", (q) => q.eq("reason", reason))
          .order("desc")
          .take(MAX_SCAN)
      : await ctx.db
          .query("stockAdjustments")
          .withIndex("by_created")
          .order("desc")
          .take(MAX_SCAN);

    const total = rows.length;
    const page = rows.slice(offset, offset + limit);
    const history = await toHistoryItems(ctx, page);

    const products = new Map<string, Doc<"products"> | null>();
    const items: MovementItem[] = [];
    for (let i = 0; i < page.length; i++) {
      const row = page[i];
      const key = String(row.productId);
      let product = products.get(key);
      if (product === undefined) {
        product = await ctx.db.get(row.productId);
        products.set(key, product);
      }
      items.push({
        ...history[i],
        productId: row.productId,
        productName: product?.name ?? "",
        productSlug: product?.slug ?? "",
      });
    }

    return { items, total, hasMore: offset + items.length < total };
  },
});

/**
 * Admin Query: every product's stock numbers for the client-side CSV export.
 */
export const exportRows = query({
  args: {},
  returns: v.object({ rows: v.array(exportRowValidator) }),
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const { products, categoryNames } = await loadProducts(ctx);

    return {
      rows: products.map((product) => ({
        _id: product._id,
        name: product.name,
        sku: product.sku ?? "",
        categoryName: categoryNames.get(product.categoryId) ?? "",
        brand: product.brand ?? "",
        price: product.price,
        salePrice: product.salePrice,
        stock: product.stock,
        reserved: product.reservedStock,
        available: product.stock - product.reservedStock,
        isActive: product.isActive,
      })),
    };
  },
});
