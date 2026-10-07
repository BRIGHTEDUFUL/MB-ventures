import { v } from "convex/values";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { requireAdmin } from "./users";
import { RESERVED_SLUGS } from "./lib/reservedSlugs";

/** Lowercase kebab slug, e.g. "delivery-and-returns". */
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const pageArgs = {
  title: v.string(),
  slug: v.string(),
  body: v.string(),
  isPublished: v.boolean(),
  showInFooter: v.boolean(),
  sortOrder: v.number(),
};

/** Trim/normalise the shared page fields and validate them for create/update. */
function normalizeAndValidate(args: {
  title: string;
  slug: string;
  body: string;
  sortOrder: number;
}) {
  const title = args.title.trim();
  const slug = args.slug.trim().toLowerCase();
  const body = args.body;

  if (title.length < 2 || title.length > 120) {
    throw new Error("Title must be between 2 and 120 characters.");
  }
  if (slug.length < 1 || slug.length > 80) {
    throw new Error("Slug must be between 1 and 80 characters.");
  }
  if (!SLUG_PATTERN.test(slug)) {
    throw new Error("Slug may only use lowercase letters, numbers and hyphens.");
  }
  if (RESERVED_SLUGS.some((reserved) => reserved === slug)) {
    throw new Error(`"${slug}" is a reserved address. Please choose a different slug.`);
  }
  if (body.length < 1 || body.length > 100_000) {
    throw new Error("Page content must be between 1 and 100000 characters.");
  }
  if (!Number.isInteger(args.sortOrder) || args.sortOrder < 0 || args.sortOrder > 10000) {
    throw new Error("Sort order must be a whole number between 0 and 10000.");
  }

  return { title, slug, body };
}

/** Throws when another page already owns this slug. */
async function assertSlugFree(ctx: MutationCtx, slug: string, excludePageId?: string) {
  const existing = await ctx.db
    .query("pages")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .first();
  if (existing && existing._id !== excludePageId) {
    throw new Error(`A page with slug "${slug}" already exists.`);
  }
}

/**
 * Admin Query: every page for the /admin/pages table (body as a length only).
 */
export const list = query({
  args: {},
  returns: v.object({
    pages: v.array(
      v.object({
        _id: v.id("pages"),
        slug: v.string(),
        title: v.string(),
        isPublished: v.boolean(),
        showInFooter: v.boolean(),
        sortOrder: v.number(),
        updatedAt: v.number(),
        bodyLength: v.number(),
      })
    ),
  }),
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const pages = await ctx.db.query("pages").collect();
    return {
      pages: pages
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((page) => ({
          _id: page._id,
          slug: page.slug,
          title: page.title,
          isPublished: page.isPublished,
          showInFooter: page.showInFooter,
          sortOrder: page.sortOrder,
          updatedAt: page.updatedAt,
          bodyLength: page.body.length,
        })),
    };
  },
});

/**
 * Admin Query: one page including its body, so drafts can be edited too.
 */
export const get = query({
  args: { pageId: v.id("pages") },
  returns: v.union(
    v.object({
      _id: v.id("pages"),
      slug: v.string(),
      title: v.string(),
      body: v.string(),
      isPublished: v.boolean(),
      showInFooter: v.boolean(),
      sortOrder: v.number(),
      updatedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const page = await ctx.db.get(args.pageId);
    if (!page) return null;
    return {
      _id: page._id,
      slug: page.slug,
      title: page.title,
      body: page.body,
      isPublished: page.isPublished,
      showInFooter: page.showInFooter,
      sortOrder: page.sortOrder,
      updatedAt: page.updatedAt,
    };
  },
});

/**
 * Admin Mutation: create a content page.
 */
export const create = mutation({
  args: pageArgs,
  returns: v.object({ _id: v.id("pages") }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    // TODO(audit): write an auditLogs row here once Step 25 (logAudit) lands.

    const { title, slug, body } = normalizeAndValidate(args);
    await assertSlugFree(ctx, slug);

    const _id = await ctx.db.insert("pages", {
      title,
      slug,
      body,
      isPublished: args.isPublished,
      showInFooter: args.showInFooter,
      sortOrder: args.sortOrder,
      updatedAt: Date.now(),
    });
    return { _id };
  },
});

/**
 * Admin Mutation: update a content page. The slug may change unless it collides
 * with a different page; updatedAt is always refreshed.
 */
export const update = mutation({
  args: { pageId: v.id("pages"), ...pageArgs },
  returns: v.object({ ok: v.literal(true) }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    // TODO(audit): write an auditLogs row here once Step 25 (logAudit) lands.

    const page = await ctx.db.get(args.pageId);
    if (!page) throw new Error("Page not found.");

    const { title, slug, body } = normalizeAndValidate(args);
    await assertSlugFree(ctx, slug, args.pageId);

    await ctx.db.patch(args.pageId, {
      title,
      slug,
      body,
      isPublished: args.isPublished,
      showInFooter: args.showInFooter,
      sortOrder: args.sortOrder,
      updatedAt: Date.now(),
    });
    return { ok: true } as const;
  },
});

/**
 * Admin Mutation: delete a content page.
 */
export const remove = mutation({
  args: { pageId: v.id("pages") },
  returns: v.object({ ok: v.literal(true) }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    // TODO(audit): write an auditLogs row here once Step 25 (logAudit) lands.

    const page = await ctx.db.get(args.pageId);
    if (!page) throw new Error("Page not found.");

    await ctx.db.delete(args.pageId);
    return { ok: true } as const;
  },
});
