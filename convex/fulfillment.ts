import { query } from "./_generated/server";

/**
 * Public query: List active delivery zones ordered by sortOrder.
 */
export const listDeliveryZones = query({
  args: {},
  handler: async (ctx) => {
    const zones = await ctx.db
      .query("deliveryZones")
      .withIndex("by_active_and_sort", (q) => q.eq("isActive", true))
      .collect();

    return zones.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

/**
 * Public query: List active pickup locations ordered by sortOrder.
 */
export const listPickupLocations = query({
  args: {},
  handler: async (ctx) => {
    const locations = await ctx.db
      .query("pickupLocations")
      .withIndex("by_active_and_sort", (q) => q.eq("isActive", true))
      .collect();

    return locations.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});
