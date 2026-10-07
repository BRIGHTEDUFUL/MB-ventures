import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * Public Query: published pages shown in the footer.
 * Returns public-safe fields only — never the body.
 */
export const listFooter = query({
  args: {},
  returns: v.object({
    pages: v.array(
      v.object({ _id: v.id("pages"), slug: v.string(), title: v.string() })
    ),
  }),
  handler: async (ctx) => {
    const published = await ctx.db
      .query("pages")
      .filter((q) =>
        q.and(q.eq(q.field("isPublished"), true), q.eq(q.field("showInFooter"), true))
      )
      .collect();

    return {
      pages: published
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(({ _id, slug, title }) => ({ _id, slug, title })),
    };
  },
});

/**
 * Public Query: one published page by slug, or null when missing/unpublished.
 */
export const getBySlug = query({
  args: { slug: v.string() },
  returns: v.union(
    v.object({
      slug: v.string(),
      title: v.string(),
      body: v.string(),
      updatedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const page = await ctx.db
      .query("pages")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!page || !page.isPublished) return null;
    return {
      slug: page.slug,
      title: page.title,
      body: page.body,
      updatedAt: page.updatedAt,
    };
  },
});
