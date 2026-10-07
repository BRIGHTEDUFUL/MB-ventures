import { v } from "convex/values";
import type { WithoutSystemFields } from "convex/server";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { normalizePhone } from "../lib/phone";
import { requireAdmin } from "./users";
import {
  announcementValidator,
  heroSettingsValidator,
  momoAccountValidator,
  promoTileValidator,
  socialLinksValidator,
} from "./lib/validators";

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

/**
 * Admin query: Raw site settings singleton plus resolved storage URLs for the
 * hero and promo tile images. Returns null when the singleton does not exist yet.
 */
export const getAdmin = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("siteSettings"),
      _creationTime: v.number(),
      shopName: v.string(),
      tagline: v.string(),
      currency: v.string(),
      defaultCountryCode: v.string(),
      contactEmail: v.string(),
      contactPhone: v.string(),
      whatsappNumber: v.string(),
      address: v.string(),
      announcement: announcementValidator,
      hero: heroSettingsValidator,
      promoTiles: v.array(
        v.object({
          title: v.string(),
          subtitle: v.string(),
          link: v.string(),
          imageId: v.optional(v.id("_storage")),
          imageUrl: v.union(v.string(), v.null()),
        })
      ),
      momoAccounts: v.array(momoAccountValidator),
      cashOnDeliveryEnabled: v.boolean(),
      payInStoreEnabled: v.boolean(),
      freeDeliveryThreshold: v.optional(v.number()),
      orderExpiryMinutes: v.number(),
      lowStockThreshold: v.number(),
      maxCartQuantity: v.number(),
      pricesIncludeTaxNote: v.string(),
      socialLinks: socialLinksValidator,
      heroImageUrl: v.union(v.string(), v.null()),
    })
  ),
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const settings = await ctx.db.query("siteSettings").first();
    if (!settings) return null;

    const heroImageUrl = settings.hero.imageId
      ? await ctx.storage.getUrl(settings.hero.imageId)
      : null;
    const promoTiles = await Promise.all(
      settings.promoTiles.map(async (tile) => ({
        ...tile,
        imageUrl: tile.imageId ? await ctx.storage.getUrl(tile.imageId) : null,
      }))
    );

    return { ...settings, heroImageUrl, promoTiles };
  },
});

type SiteSettingsDoc = WithoutSystemFields<Doc<"siteSettings">>;

type SocialLinks = (typeof socialLinksValidator)["type"];

const ALLOWED_CURRENCIES = ["GHS", "NGN", "USD", "GBP", "EUR"];

/**
 * Defaults mirror the public fallbacks in getPublicSettings so that creating
 * the singleton while saving one tab does not change what the storefront shows.
 */
const DEFAULT_SETTINGS: SiteSettingsDoc = {
  shopName: "MB Ventures GH",
  tagline: "Premium Computer Accessories, Hardware & Ergonomic Office Furniture",
  currency: "GHS",
  defaultCountryCode: "GH",
  contactEmail: "orders@mbventuresgh.com",
  contactPhone: "+233 24 000 0000",
  whatsappNumber: "+233 24 000 0000",
  address: "Circle Commercial Area, Accra, Ghana",
  announcement: {
    enabled: true,
    text: "Fast delivery across Accra & nationwide shipping available. Cash on delivery & MoMo accepted.",
    link: "/catalog",
  },
  hero: {
    title: "Computer accessories, hardware, and ergonomic workspace furniture.",
    subtitle:
      "Specialist equipment for productive setups. High performance hardware, mechanical keyboards, ergonomic seating, and motorized standing desks in stock for immediate delivery or pickup in Accra.",
    buttonText: "Shop workspace gear",
    buttonLink: "/catalog",
  },
  promoTiles: [],
  momoAccounts: [
    { network: "MTN", number: "0240000000", name: "MB VENTURES GH" },
    { network: "Telecel", number: "0200000000", name: "MB VENTURES GH" },
  ],
  cashOnDeliveryEnabled: true,
  payInStoreEnabled: true,
  orderExpiryMinutes: 30,
  lowStockThreshold: 3,
  maxCartQuantity: 10,
  pricesIncludeTaxNote: "All prices inclusive of taxes",
  socialLinks: {
    whatsapp: "https://wa.me/233240000000",
  },
};

function normalizeRequiredPhone(value: string, label: string): string {
  const normalized = normalizePhone(value);
  if (!normalized) {
    throw new Error(
      `${label} is not a valid phone number. Use a format like "+233 24 000 0000".`
    );
  }
  return normalized;
}

/** Links are internal paths (`/…`), absolute HTTPS URLs, or empty. */
function normalizeLink(link: string, fieldLabel: string): string {
  const trimmed = link.trim();
  if (trimmed !== "" && !trimmed.startsWith("/") && !trimmed.startsWith("https://")) {
    throw new Error(`${fieldLabel} must be empty, start with "/", or start with "https://".`);
  }
  return trimmed;
}

function normalizeSocialLinks(links: SocialLinks): SocialLinks {
  const normalized: SocialLinks = {
    facebook: links.facebook?.trim() || undefined,
    instagram: links.instagram?.trim() || undefined,
    x: links.x?.trim() || undefined,
    tiktok: links.tiktok?.trim() || undefined,
    youtube: links.youtube?.trim() || undefined,
    whatsapp: links.whatsapp?.trim() || undefined,
  };

  for (const [network, url] of Object.entries(normalized)) {
    if (url !== undefined && !url.startsWith("https://")) {
      throw new Error(`Social link for ${network} must start with "https://".`);
    }
  }

  return normalized;
}

function collectImageIds(
  settings: Pick<SiteSettingsDoc, "hero" | "promoTiles"> | null
): Set<Id<"_storage">> {
  const ids = new Set<Id<"_storage">>();
  if (!settings) return ids;

  if (settings.hero.imageId) ids.add(settings.hero.imageId);
  for (const tile of settings.promoTiles) {
    if (tile.imageId) ids.add(tile.imageId);
  }
  return ids;
}

/**
 * Admin mutation: Merge the supplied fields into the site settings singleton,
 * creating it with sensible defaults when it does not exist yet. Object fields
 * (announcement, hero, promoTiles, momoAccounts, socialLinks) are replaced
 * wholesale — the client must send the existing imageId back when unchanged.
 */
// TODO(audit): write an auditLogs row here once Step 25 (logAudit) lands.
export const update = mutation({
  args: {
    shopName: v.optional(v.string()),
    tagline: v.optional(v.string()),
    currency: v.optional(v.string()),
    defaultCountryCode: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    whatsappNumber: v.optional(v.string()),
    address: v.optional(v.string()),
    announcement: v.optional(announcementValidator),
    hero: v.optional(heroSettingsValidator),
    promoTiles: v.optional(v.array(promoTileValidator)),
    momoAccounts: v.optional(v.array(momoAccountValidator)),
    cashOnDeliveryEnabled: v.optional(v.boolean()),
    payInStoreEnabled: v.optional(v.boolean()),
    freeDeliveryThreshold: v.optional(v.union(v.number(), v.null())),
    orderExpiryMinutes: v.optional(v.number()),
    lowStockThreshold: v.optional(v.number()),
    maxCartQuantity: v.optional(v.number()),
    pricesIncludeTaxNote: v.optional(v.string()),
    socialLinks: v.optional(socialLinksValidator),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const currency = args.currency?.trim();
    if (currency !== undefined && !ALLOWED_CURRENCIES.includes(currency)) {
      throw new Error(`Currency must be one of: ${ALLOWED_CURRENCIES.join(", ")}.`);
    }

    const contactEmail = args.contactEmail?.trim();
    if (contactEmail !== undefined && !contactEmail.includes("@")) {
      throw new Error("Contact email must contain an '@'.");
    }

    const contactPhone =
      args.contactPhone !== undefined
        ? normalizeRequiredPhone(args.contactPhone, "Contact phone")
        : undefined;
    const whatsappNumber =
      args.whatsappNumber !== undefined
        ? normalizeRequiredPhone(args.whatsappNumber, "WhatsApp number")
        : undefined;

    if (
      args.orderExpiryMinutes !== undefined &&
      (args.orderExpiryMinutes < 10 || args.orderExpiryMinutes > 1440)
    ) {
      throw new Error("Order expiry must be between 10 and 1440 minutes.");
    }
    if (args.maxCartQuantity !== undefined && args.maxCartQuantity < 1) {
      throw new Error("Maximum cart quantity must be at least 1.");
    }
    if (args.lowStockThreshold !== undefined && args.lowStockThreshold < 0) {
      throw new Error("Low stock threshold cannot be negative.");
    }
    if (
      args.freeDeliveryThreshold !== undefined &&
      args.freeDeliveryThreshold !== null &&
      args.freeDeliveryThreshold <= 0
    ) {
      throw new Error("Free delivery threshold must be greater than 0.");
    }

    const socialLinks =
      args.socialLinks !== undefined ? normalizeSocialLinks(args.socialLinks) : undefined;

    const existing = await ctx.db.query("siteSettings").first();
    const base: SiteSettingsDoc = existing ?? DEFAULT_SETTINGS;

    const nextDoc: SiteSettingsDoc = {
      shopName: args.shopName?.trim() ?? base.shopName,
      tagline: args.tagline?.trim() ?? base.tagline,
      currency: currency ?? base.currency,
      defaultCountryCode: args.defaultCountryCode?.trim() ?? base.defaultCountryCode,
      contactEmail: contactEmail ?? base.contactEmail,
      contactPhone: contactPhone ?? base.contactPhone,
      whatsappNumber: whatsappNumber ?? base.whatsappNumber,
      address: args.address?.trim() ?? base.address,
      announcement: args.announcement
        ? {
            ...args.announcement,
            link:
              args.announcement.link === undefined
                ? undefined
                : normalizeLink(args.announcement.link, "Announcement link"),
          }
        : base.announcement,
      hero: args.hero
        ? { ...args.hero, buttonLink: normalizeLink(args.hero.buttonLink, "Hero button link") }
        : base.hero,
      promoTiles: args.promoTiles
        ? args.promoTiles.map((tile, index) => ({
            ...tile,
            link: normalizeLink(tile.link, `Promo tile ${index + 1} link`),
          }))
        : base.promoTiles,
      momoAccounts: args.momoAccounts ?? base.momoAccounts,
      cashOnDeliveryEnabled: args.cashOnDeliveryEnabled ?? base.cashOnDeliveryEnabled,
      payInStoreEnabled: args.payInStoreEnabled ?? base.payInStoreEnabled,
      // null clears the threshold; omitting the argument keeps the stored value.
      freeDeliveryThreshold:
        args.freeDeliveryThreshold === undefined
          ? base.freeDeliveryThreshold
          : (args.freeDeliveryThreshold ?? undefined),
      orderExpiryMinutes: args.orderExpiryMinutes ?? base.orderExpiryMinutes,
      lowStockThreshold: args.lowStockThreshold ?? base.lowStockThreshold,
      maxCartQuantity: args.maxCartQuantity ?? base.maxCartQuantity,
      pricesIncludeTaxNote: args.pricesIncludeTaxNote ?? base.pricesIncludeTaxNote,
      socialLinks: socialLinks ?? base.socialLinks,
    };

    if (existing) {
      await ctx.db.patch(existing._id, nextDoc);
    } else {
      await ctx.db.insert("siteSettings", nextDoc);
    }

    // Drop storage blobs whose ids were present before but are gone now.
    const nextImageIds = collectImageIds(nextDoc);
    for (const id of collectImageIds(existing)) {
      if (nextImageIds.has(id)) continue;
      try {
        await ctx.storage.delete(id);
      } catch {
        // Best-effort cleanup — the blob may already be gone.
      }
    }

    return { success: true };
  },
});
