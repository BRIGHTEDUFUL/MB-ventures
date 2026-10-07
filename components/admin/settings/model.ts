import type { Id } from "@/convex/_generated/dataModel";
import { fromMinor, toMinor } from "@/lib/money";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export type TabKey = "shop" | "homepage" | "orders";
export type MomoNetwork = "MTN" | "Telecel" | "AirtelTigo";

export interface ImageValue {
  imageId: Id<"_storage"> | null;
  previewUrl: string | null;
}

export interface MomoAccountForm {
  network: MomoNetwork;
  number: string;
  name: string;
}

export interface SocialLinksForm {
  facebook: string;
  instagram: string;
  x: string;
  tiktok: string;
  youtube: string;
  whatsapp: string;
}

export interface ShopForm {
  shopName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  address: string;
  currency: string;
  defaultCountryCode: string;
  socialLinks: SocialLinksForm;
  momoAccounts: MomoAccountForm[];
}

export interface AnnouncementForm {
  enabled: boolean;
  text: string;
  link: string;
}

export interface HeroForm {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  image: ImageValue;
}

export interface PromoTileForm {
  title: string;
  subtitle: string;
  link: string;
  image: ImageValue;
}

export interface HomepageForm {
  announcement: AnnouncementForm;
  hero: HeroForm;
  promoTiles: PromoTileForm[];
}

export interface OrdersForm {
  /** Major units as typed, "" means free delivery is switched off. */
  freeDeliveryThreshold: string;
  orderExpiryMinutes: string;
  lowStockThreshold: string;
  maxCartQuantity: string;
  pricesIncludeTaxNote: string;
  cashOnDeliveryEnabled: boolean;
  payInStoreEnabled: boolean;
}

export interface Forms {
  shop: ShopForm;
  homepage: HomepageForm;
  orders: OrdersForm;
}

/**
 * Mirrors the return shape of `api.siteSettings.getAdmin` from the Step 10
 * contract so the form can be typed before the backend lands.
 */
export interface AdminSettings {
  shopName: string;
  tagline: string;
  currency: string;
  defaultCountryCode: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  address: string;
  announcement: { enabled: boolean; text: string; link?: string };
  hero: {
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
    imageId?: Id<"_storage">;
  };
  promoTiles: Array<{
    title: string;
    subtitle: string;
    link: string;
    imageId?: Id<"_storage">;
    imageUrl: string | null;
  }>;
  momoAccounts: Array<{ network: MomoNetwork; number: string; name: string }>;
  cashOnDeliveryEnabled: boolean;
  payInStoreEnabled: boolean;
  freeDeliveryThreshold?: number;
  orderExpiryMinutes: number;
  lowStockThreshold: number;
  maxCartQuantity: number;
  pricesIncludeTaxNote: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    x?: string;
    tiktok?: string;
    youtube?: string;
    whatsapp?: string;
  };
  heroImageUrl: string | null;
}

/** Mirrors the `update` args from the Step 10 contract. Every field optional. */
export interface SiteSettingsUpdateArgs {
  shopName?: string;
  tagline?: string;
  currency?: string;
  defaultCountryCode?: string;
  contactEmail?: string;
  contactPhone?: string;
  whatsappNumber?: string;
  address?: string;
  announcement?: { enabled: boolean; text: string; link?: string };
  hero?: {
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
    imageId?: Id<"_storage">;
  };
  promoTiles?: Array<{
    title: string;
    subtitle: string;
    link: string;
    imageId?: Id<"_storage">;
  }>;
  momoAccounts?: Array<{ network: MomoNetwork; number: string; name: string }>;
  cashOnDeliveryEnabled?: boolean;
  payInStoreEnabled?: boolean;
  freeDeliveryThreshold?: number | null;
  orderExpiryMinutes?: number;
  lowStockThreshold?: number;
  maxCartQuantity?: number;
  pricesIncludeTaxNote?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    x?: string;
    tiktok?: string;
    youtube?: string;
    whatsapp?: string;
  };
}

/* -------------------------------------------------------------------------- */
/* Constants                                                                   */
/* -------------------------------------------------------------------------- */

export const TAB_LABELS: Record<TabKey, string> = {
  shop: "Shop info",
  homepage: "Homepage",
  orders: "Orders and stock",
};

export const CURRENCIES = ["GHS", "NGN", "USD", "GBP", "EUR"];
export const MOMO_NETWORKS: MomoNetwork[] = ["MTN", "Telecel", "AirtelTigo"];
export const MAX_PROMO_TILES = 3;

export const INPUT_CLASS =
  "w-full h-11 px-3 rounded-md border border-line-strong bg-surface text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus";
export const TEXTAREA_CLASS =
  "w-full p-3 rounded-md border border-line-strong bg-surface text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus";
export const PRIMARY_BTN =
  "inline-flex items-center justify-center gap-1.5 h-11 px-5 rounded-md bg-brand text-white text-xs font-semibold hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
export const SECONDARY_BTN =
  "inline-flex items-center justify-center gap-1.5 h-11 px-4 rounded-md border border-line bg-surface text-xs font-semibold text-ink hover:bg-canvas transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
export const ICON_BTN =
  "w-11 h-11 inline-flex items-center justify-center rounded hover:bg-danger-soft text-ink-muted hover:text-danger transition-colors";
export const SECTION_CLASS = "bg-surface border border-line rounded-lg p-5 space-y-4";

/* -------------------------------------------------------------------------- */
/* Defaults (used when no singleton document exists yet)                       */
/* -------------------------------------------------------------------------- */

export const DEFAULT_SOCIAL: SocialLinksForm = {
  facebook: "",
  instagram: "",
  x: "",
  tiktok: "",
  youtube: "",
  whatsapp: "https://wa.me/233240000000",
};

export const DEFAULT_SHOP_FORM: ShopForm = {
  shopName: "MB Ventures GH",
  tagline: "Premium Computer Accessories, Hardware & Ergonomic Office Furniture",
  contactEmail: "orders@mbventuresgh.com",
  contactPhone: "+233 24 000 0000",
  whatsappNumber: "+233 24 000 0000",
  address: "Circle Commercial Area, Accra, Ghana",
  currency: "GHS",
  defaultCountryCode: "GH",
  socialLinks: DEFAULT_SOCIAL,
  momoAccounts: [
    { network: "MTN", number: "0240000000", name: "MB VENTURES GH" },
    { network: "Telecel", number: "0200000000", name: "MB VENTURES GH" },
  ],
};

export const DEFAULT_HOMEPAGE_FORM: HomepageForm = {
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
    image: { imageId: null, previewUrl: null },
  },
  promoTiles: [],
};

export const DEFAULT_ORDERS_FORM: OrdersForm = {
  freeDeliveryThreshold: "",
  orderExpiryMinutes: "30",
  lowStockThreshold: "3",
  maxCartQuantity: "10",
  pricesIncludeTaxNote: "All prices inclusive of taxes",
  cashOnDeliveryEnabled: true,
  payInStoreEnabled: true,
};

export const DEFAULT_FORMS: Forms = {
  shop: DEFAULT_SHOP_FORM,
  homepage: DEFAULT_HOMEPAGE_FORM,
  orders: DEFAULT_ORDERS_FORM,
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

export function buildForms(settings: AdminSettings | null): Forms {
  if (!settings) return DEFAULT_FORMS;

  return {
    shop: {
      shopName: settings.shopName,
      tagline: settings.tagline,
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone,
      whatsappNumber: settings.whatsappNumber,
      address: settings.address,
      currency: settings.currency,
      defaultCountryCode: settings.defaultCountryCode,
      socialLinks: {
        facebook: settings.socialLinks?.facebook ?? "",
        instagram: settings.socialLinks?.instagram ?? "",
        x: settings.socialLinks?.x ?? "",
        tiktok: settings.socialLinks?.tiktok ?? "",
        youtube: settings.socialLinks?.youtube ?? "",
        whatsapp: settings.socialLinks?.whatsapp ?? "",
      },
      momoAccounts: (settings.momoAccounts ?? []).map((account) => ({
        network: account.network,
        number: account.number,
        name: account.name,
      })),
    },
    homepage: {
      announcement: {
        enabled: settings.announcement.enabled,
        text: settings.announcement.text,
        link: settings.announcement.link ?? "",
      },
      hero: {
        title: settings.hero.title,
        subtitle: settings.hero.subtitle,
        buttonText: settings.hero.buttonText,
        buttonLink: settings.hero.buttonLink,
        image: {
          imageId: settings.hero.imageId ?? null,
          previewUrl: settings.heroImageUrl,
        },
      },
      promoTiles: (settings.promoTiles ?? []).map((tile) => ({
        title: tile.title,
        subtitle: tile.subtitle,
        link: tile.link,
        image: {
          imageId: tile.imageId ?? null,
          previewUrl: tile.imageUrl,
        },
      })),
    },
    orders: {
      freeDeliveryThreshold:
        settings.freeDeliveryThreshold == null
          ? ""
          : String(fromMinor(settings.freeDeliveryThreshold)),
      orderExpiryMinutes: String(settings.orderExpiryMinutes),
      lowStockThreshold: String(settings.lowStockThreshold),
      maxCartQuantity: String(settings.maxCartQuantity),
      pricesIncludeTaxNote: settings.pricesIncludeTaxNote,
      cashOnDeliveryEnabled: settings.cashOnDeliveryEnabled,
      payInStoreEnabled: settings.payInStoreEnabled,
    },
  };
}

export function cloneForms<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function sameForm(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Links may be empty, start with "/" or start with "https://". */
export function isAllowedLink(raw: string): boolean {
  const value = raw.trim();
  return value === "" || value.startsWith("/") || value.startsWith("https://");
}

export function parseNumeric(raw: string): number | null {
  const value = raw.trim();
  if (value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseThreshold(raw: string): { empty: boolean; valid: boolean; minor: number } {
  const value = raw.trim();
  if (value === "") return { empty: true, valid: true, minor: 0 };
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return { empty: false, valid: false, minor: 0 };
  }
  return { empty: false, valid: true, minor: toMinor(parsed) };
}

export function buildSocialLinks(form: SocialLinksForm): NonNullable<SiteSettingsUpdateArgs["socialLinks"]> {
  const links: NonNullable<SiteSettingsUpdateArgs["socialLinks"]> = {};
  if (form.facebook.trim()) links.facebook = form.facebook.trim();
  if (form.instagram.trim()) links.instagram = form.instagram.trim();
  if (form.x.trim()) links.x = form.x.trim();
  if (form.tiktok.trim()) links.tiktok = form.tiktok.trim();
  if (form.youtube.trim()) links.youtube = form.youtube.trim();
  if (form.whatsapp.trim()) links.whatsapp = form.whatsapp.trim();
  return links;
}
