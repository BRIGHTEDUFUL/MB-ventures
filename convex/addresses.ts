import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser } from "./users";
import { deliveryAddressValidator } from "./lib/validators";

const MAX_ADDRESSES = 10;

/** Address input shape (without isDefault — that's set by mutations) */
const addressInputValidator = v.object({
  label: v.string(),
  recipientName: v.string(),
  phone: v.string(),
  line1: v.string(),
  line2: v.optional(v.string()),
  city: v.string(),
  region: v.string(),
  notes: v.optional(v.string()),
});

/**
 * User-scoped query: list all saved addresses for the signed-in user.
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const { userId } = await requireUser(ctx);
    return ctx.db
      .query("addresses")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

/**
 * User-scoped mutation: create a new saved address.
 * If this is the user's first address it becomes default automatically.
 */
export const create = mutation({
  args: addressInputValidator,
  handler: async (ctx, args) => {
    const { userId } = await requireUser(ctx);

    const existing = await ctx.db
      .query("addresses")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    if (existing.length >= MAX_ADDRESSES) {
      throw new Error(`You can save up to ${MAX_ADDRESSES} addresses.`);
    }

    const isDefault = existing.length === 0;

    await ctx.db.insert("addresses", {
      userId,
      ...args,
      label: args.label.trim(),
      recipientName: args.recipientName.trim(),
      phone: args.phone.trim(),
      line1: args.line1.trim(),
      line2: args.line2?.trim(),
      city: args.city.trim(),
      region: args.region.trim(),
      notes: args.notes?.trim(),
      isDefault,
    });
  },
});

/**
 * User-scoped mutation: update an existing saved address.
 */
export const update = mutation({
  args: {
    addressId: v.id("addresses"),
    ...addressInputValidator.fields,
  },
  handler: async (ctx, args) => {
    const { userId } = await requireUser(ctx);

    const address = await ctx.db.get(args.addressId);
    if (!address || address.userId !== userId) {
      throw new Error("Address not found.");
    }

    const { addressId, ...fields } = args;
    await ctx.db.patch(addressId, {
      ...fields,
      label: fields.label.trim(),
      recipientName: fields.recipientName.trim(),
      phone: fields.phone.trim(),
      line1: fields.line1.trim(),
      line2: fields.line2?.trim(),
      city: fields.city.trim(),
      region: fields.region.trim(),
      notes: fields.notes?.trim(),
    });
  },
});

/**
 * User-scoped mutation: delete a saved address.
 * If it was the default, the most recently created remaining address
 * becomes the new default.
 */
export const remove = mutation({
  args: { addressId: v.id("addresses") },
  handler: async (ctx, args) => {
    const { userId } = await requireUser(ctx);

    const address = await ctx.db.get(args.addressId);
    if (!address || address.userId !== userId) {
      throw new Error("Address not found.");
    }

    const wasDefault = address.isDefault;
    await ctx.db.delete(args.addressId);

    if (wasDefault) {
      // Promote the most recently created remaining address to default
      const remaining = await ctx.db
        .query("addresses")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();
      if (remaining.length > 0) {
        // Sort by insertion order (no explicit createdAt, use _creationTime)
        const next = remaining.sort((a, b) => b._creationTime - a._creationTime)[0];
        await ctx.db.patch(next._id, { isDefault: true });
      }
    }
  },
});

/**
 * User-scoped mutation: set an address as the default.
 * Clears isDefault on any other address owned by the user.
 */
export const setDefault = mutation({
  args: { addressId: v.id("addresses") },
  handler: async (ctx, args) => {
    const { userId } = await requireUser(ctx);

    const address = await ctx.db.get(args.addressId);
    if (!address || address.userId !== userId) {
      throw new Error("Address not found.");
    }

    // Clear all existing defaults
    const all = await ctx.db
      .query("addresses")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    await Promise.all(
      all.map((a) => {
        if (a._id !== args.addressId && a.isDefault) {
          return ctx.db.patch(a._id, { isDefault: false });
        }
        return Promise.resolve();
      })
    );

    await ctx.db.patch(args.addressId, { isDefault: true });
  },
});
