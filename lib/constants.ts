/**
 * Shared application constants.
 */

export const DEFAULT_CURRENCY = "GHS";
export const DEFAULT_COUNTRY_CODE = "+233";

export const DEFAULT_MAX_CART_QUANTITY = 10;
export const DEFAULT_LOW_STOCK_THRESHOLD = 3;
export const DEFAULT_ORDER_EXPIRY_MINUTES = 30;

export const IMAGE_LIMITS = {
  maxImagesPerProduct: 8,
  maxSizeBytes: 5 * 1024 * 1024, // 5 MB
  allowedTypes: ["image/jpeg", "image/png", "image/webp"] as const,
};

export const ALLOWED_IMAGE_TYPES = IMAGE_LIMITS.allowedTypes;
export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];
