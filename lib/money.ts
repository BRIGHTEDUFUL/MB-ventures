/**
 * Money utilities for minor-unit (pesewas/cents) calculations and formatting.
 * All monetary amounts in the database are stored as integers representing the smallest unit.
 */

/**
 * Converts a major unit currency amount (e.g. 19.99 GHS or "19.99") to minor unit integer (1999 pesewas).
 * Uses Math.round to avoid floating point representation issues.
 */
export function toMinor(major: number | string): number {
  const parsed = typeof major === "string" ? parseFloat(major) : major;
  if (isNaN(parsed) || !isFinite(parsed)) {
    return 0;
  }
  return Math.round(parsed * 100);
}

/**
 * Converts a minor unit integer (e.g. 1999 pesewas) to major unit number (19.99 GHS).
 */
export function fromMinor(minor: number): number {
  if (isNaN(minor) || !isFinite(minor)) {
    return 0;
  }
  return minor / 100;
}

/**
 * Formats a minor unit integer into a human-readable currency string.
 * Example: formatMoney(1999, "GHS") -> "GH₵ 19.99" or "GHS 19.99"
 */
export function formatMoney(
  minor: number,
  currency: string = "GHS",
  locale: string = "en-GH"
): string {
  const major = fromMinor(minor);
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(major);
  } catch {
    // Fallback if currency or locale is invalid
    return `${currency.toUpperCase()} ${major.toFixed(2)}`;
  }
}
