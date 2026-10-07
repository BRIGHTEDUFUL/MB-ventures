import { query } from "./_generated/server";

/**
 * Get public store settings (branding, announcement bar, contact info, MoMo accounts, delivery zones, pickup locations).
 */
export const getPublicSettings = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("siteSettings").first();
    const deliveryZones = await ctx.db
      .query("deliveryZones")
      .withIndex("by_active_and_sort", (q) => q.eq("isActive", true))
      .collect();
    const pickupLocations = await ctx.db
      .query("pickupLocations")
      .withIndex("by_active_and_sort", (q) => q.eq("isActive", true))
      .collect();

    let heroImageUrl = null;
    if (settings?.hero?.imageId) {
      heroImageUrl = await ctx.storage.getUrl(settings.hero.imageId);
    }

    return {
      shopName: settings?.shopName || "MB Ventures GH",
      tagline:
        settings?.tagline ||
        "Premium Computer Accessories, Hardware & Ergonomic Office Furniture",
      currency: settings?.currency || "GHS",
      contactEmail: settings?.contactEmail || "orders@mbventuresgh.com",
      contactPhone: settings?.contactPhone || "+233 24 000 0000",
      whatsappNumber: settings?.whatsappNumber || "+233 24 000 0000",
      address: settings?.address || "Circle Commercial Area, Accra, Ghana",
      announcement: settings?.announcement || {
        enabled: true,
        text: "Fast delivery across Accra & nationwide shipping available. Cash on delivery & MoMo accepted.",
        link: "/catalog",
      },
      hero: {
        title:
          settings?.hero?.title ||
          "Computer accessories, hardware, and ergonomic workspace furniture.",
        subtitle:
          settings?.hero?.subtitle ||
          "Specialist equipment for productive setups. High performance hardware, mechanical keyboards, ergonomic seating, and motorized standing desks in stock for immediate delivery or pickup in Accra.",
        buttonText: settings?.hero?.buttonText || "Shop workspace gear",
        buttonLink: settings?.hero?.buttonLink || "/catalog",
        imageUrl: heroImageUrl,
      },
      promoTiles: settings?.promoTiles || [],
      momoAccounts: settings?.momoAccounts || [
        {
          network: "MTN" as const,
          number: "0240000000",
          name: "MB VENTURES GH",
        },
        {
          network: "Telecel" as const,
          number: "0200000000",
          name: "MB VENTURES GH",
        },
      ],
      cashOnDeliveryEnabled: settings?.cashOnDeliveryEnabled ?? true,
      payInStoreEnabled: settings?.payInStoreEnabled ?? true,
      freeDeliveryThreshold: settings?.freeDeliveryThreshold,
      orderExpiryMinutes: settings?.orderExpiryMinutes ?? 30,
      lowStockThreshold: settings?.lowStockThreshold ?? 3,
      maxCartQuantity: settings?.maxCartQuantity ?? 10,
      pricesIncludeTaxNote: settings?.pricesIncludeTaxNote || "All prices inclusive of taxes",
      socialLinks: settings?.socialLinks || {
        whatsapp: "https://wa.me/233240000000",
      },
      deliveryZones: deliveryZones.map((z) => ({
        id: z._id,
        name: z.name,
        fee: z.fee,
        estimatedDays: z.estimatedDays,
      })),
      pickupLocations: pickupLocations.map((p) => ({
        id: p._id,
        name: p.name,
        address: p.address,
        phone: p.phone,
        openingHours: p.openingHours,
      })),
    };
  },
});
