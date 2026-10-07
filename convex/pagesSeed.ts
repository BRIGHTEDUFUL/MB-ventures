import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { pageDrafts } from "./lib/pageDrafts";

/**
 * Seeds the draft content pages from convex/lib/pageDrafts.ts.
 * Idempotent: a slug that already exists is skipped, so re-running never
 * overwrites edits made in the admin editor. All drafts are inserted
 * unpublished so the owner can review them first.
 * Dashboard: npx convex run pagesSeed:seedDrafts
 */
export const seedDrafts = internalMutation({
  args: {},
  returns: v.object({
    created: v.array(v.string()),
    skipped: v.array(v.string()),
  }),
  handler: async (ctx) => {
    const created: string[] = [];
    const skipped: string[] = [];
    const now = Date.now();

    for (const draft of pageDrafts) {
      const existing = await ctx.db
        .query("pages")
        .withIndex("by_slug", (q) => q.eq("slug", draft.slug))
        .first();

      if (existing) {
        skipped.push(draft.slug);
        continue;
      }

      await ctx.db.insert("pages", {
        slug: draft.slug,
        title: draft.title,
        body: draft.body,
        isPublished: false,
        showInFooter: draft.showInFooter,
        sortOrder: draft.sortOrder,
        updatedAt: now,
      });
      created.push(draft.slug);
    }

    return { created, skipped };
  },
});
