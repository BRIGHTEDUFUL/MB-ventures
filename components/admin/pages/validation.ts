import type { PageErrors, PageValues } from "./types";

/**
 * Client-side copy of convex/lib/reservedSlugs.ts. Client components must not import
 * from convex/, so this local list gives instant feedback while the server keeps
 * enforcing the authoritative copy.
 */
const RESERVED_SLUGS: readonly string[] = [
  "cart",
  "checkout",
  "search",
  "category",
  "product",
  "account",
  "admin",
  "track",
  "contact",
  "sign-in",
  "sign-up",
  "forgot-password",
  "reset-password",
  "order",
  "catalog",
  "orders",
];

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Slug rules, mirroring convex/pagesAdmin.ts. Pass the trimmed, lower-cased slug. */
export function slugError(slug: string): string | null {
  if (slug.length < 1 || slug.length > 80) {
    return "Slug must be between 1 and 80 characters.";
  }
  if (!SLUG_PATTERN.test(slug)) {
    return "Slug may only use lowercase letters, numbers and hyphens.";
  }
  if (RESERVED_SLUGS.includes(slug)) {
    return `"${slug}" is a reserved address. Please choose a different slug.`;
  }
  return null;
}

/** Mirrors the server validation so bad input is caught before the round trip. */
export function validatePage(values: PageValues): PageErrors {
  const errors: PageErrors = {};

  const title = values.title.trim();
  if (title.length < 2 || title.length > 120) {
    errors.title = "Title must be between 2 and 120 characters.";
  }

  const slugProblem = slugError(values.slug.trim().toLowerCase());
  if (slugProblem) errors.slug = slugProblem;

  if (values.body.length < 1 || values.body.length > 100_000) {
    errors.body = "Page content must be between 1 and 100000 characters.";
  }

  if (!Number.isInteger(values.sortOrder) || values.sortOrder < 0 || values.sortOrder > 10000) {
    errors.sortOrder = "Sort order must be a whole number between 0 and 10000.";
  }

  return errors;
}
