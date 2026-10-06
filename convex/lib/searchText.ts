/**
 * Search text builder for products.
 * Combines product name, brand, SKU, and category name into a single lowercased, normalized string
 * for full-text search indexing in Convex.
 */

export function buildSearchText(
  product: {
    name: string;
    brand?: string | null;
    sku?: string | null;
  },
  categoryName?: string | null
): string {
  const parts: string[] = [product.name];

  if (product.brand && product.brand.trim().length > 0) {
    parts.push(product.brand.trim());
  }

  if (product.sku && product.sku.trim().length > 0) {
    parts.push(product.sku.trim());
  }

  if (categoryName && categoryName.trim().length > 0) {
    parts.push(categoryName.trim());
  }

  return parts
    .join(" ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}
