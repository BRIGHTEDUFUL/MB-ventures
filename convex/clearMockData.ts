import { internalMutation } from "./_generated/server";

/**
 * Clear all mock/demo data from the database to prepare for real products.
 * This is a destructive operation - use with caution!
 * 
 * Clears:
 * - All products
 * - All categories
 * - All delivery zones
 * - All pickup locations
 * - All orders (includes embedded order items)
 * - All carts (includes embedded cart items)
 * - All contact messages
 * - All stock adjustments
 * - All custom pages
 * - All saved addresses
 * 
 * Does NOT clear:
 * - Users (keeps admin and customer accounts)
 * - Audit logs (keeps history)
 * - Email logs (keeps history)
 * - Email rate limits and suppressed emails
 * - Site settings (keeps unless you uncomment that section)
 */
export const clearAllMockData = internalMutation({
  args: {},
  handler: async (ctx) => {
    console.log("Starting mock data cleanup...");

    // 1. Clear orders (includes embedded order items)
    const orders = await ctx.db.query("orders").collect();
    for (const order of orders) {
      await ctx.db.delete(order._id);
    }
    console.log(`Deleted ${orders.length} orders`);

    const orderEvents = await ctx.db.query("orderEvents").collect();
    for (const event of orderEvents) {
      await ctx.db.delete(event._id);
    }
    console.log(`Deleted ${orderEvents.length} order events`);

    // 2. Clear carts (includes embedded cart items)
    const carts = await ctx.db.query("carts").collect();
    for (const cart of carts) {
      await ctx.db.delete(cart._id);
    }
    console.log(`Deleted ${carts.length} carts`);

    // 3. Clear stock adjustments
    const stockAdjustments = await ctx.db.query("stockAdjustments").collect();
    for (const adjustment of stockAdjustments) {
      await ctx.db.delete(adjustment._id);
    }
    console.log(`Deleted ${stockAdjustments.length} stock adjustments`);

    // 4. Clear products
    const products = await ctx.db.query("products").collect();
    for (const product of products) {
      await ctx.db.delete(product._id);
    }
    console.log(`Deleted ${products.length} products`);

    // 5. Clear categories
    const categories = await ctx.db.query("categories").collect();
    for (const category of categories) {
      await ctx.db.delete(category._id);
    }
    console.log(`Deleted ${categories.length} categories`);

    // 6. Clear delivery zones
    const deliveryZones = await ctx.db.query("deliveryZones").collect();
    for (const zone of deliveryZones) {
      await ctx.db.delete(zone._id);
    }
    console.log(`Deleted ${deliveryZones.length} delivery zones`);

    // 7. Clear pickup locations
    const pickupLocations = await ctx.db.query("pickupLocations").collect();
    for (const location of pickupLocations) {
      await ctx.db.delete(location._id);
    }
    console.log(`Deleted ${pickupLocations.length} pickup locations`);

    // 8. Clear contact messages
    const contactMessages = await ctx.db.query("contactMessages").collect();
    for (const message of contactMessages) {
      await ctx.db.delete(message._id);
    }
    console.log(`Deleted ${contactMessages.length} contact messages`);

    // 9. Clear custom pages
    const pages = await ctx.db.query("pages").collect();
    for (const page of pages) {
      await ctx.db.delete(page._id);
    }
    console.log(`Deleted ${pages.length} custom pages`);

    // 10. Clear addresses (optional - you might want to keep user addresses)
    const addresses = await ctx.db.query("addresses").collect();
    for (const address of addresses) {
      await ctx.db.delete(address._id);
    }
    console.log(`Deleted ${addresses.length} saved addresses`);

    // 11. Optionally clear site settings (uncomment if you want to start fresh)
    // const siteSettings = await ctx.db.query("siteSettings").collect();
    // for (const setting of siteSettings) {
    //   await ctx.db.delete(setting._id);
    // }
    // console.log(`Deleted ${siteSettings.length} site settings`);

    console.log("Mock data cleanup completed successfully!");

    return {
      message: "All mock data cleared successfully",
      summary: {
        orders: orders.length,
        orderEvents: orderEvents.length,
        carts: carts.length,
        stockAdjustments: stockAdjustments.length,
        products: products.length,
        categories: categories.length,
        deliveryZones: deliveryZones.length,
        pickupLocations: pickupLocations.length,
        contactMessages: contactMessages.length,
        pages: pages.length,
        addresses: addresses.length,
      },
    };
  },
});
