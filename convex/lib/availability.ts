/**
 * Product stock availability and effective price calculations.
 */

export type StockLabel = "in_stock" | "low_stock" | "out_of_stock";

/**
 * Available stock physically sellable right now (excluding stock held by unpaid pending orders).
 * Always at least 0.
 */
export function availableStock(product: {
  stock: number;
  reservedStock: number;
}): number {
  return Math.max(0, product.stock - (product.reservedStock || 0));
}

/**
 * Returns human-facing inventory level label.
 * - "out_of_stock" if available stock is 0
 * - "low_stock" if available stock is > 0 and <= lowThreshold
 * - "in_stock" if available stock > lowThreshold
 */
export function stockLabel(
  product: { stock: number; reservedStock: number },
  lowThreshold: number = 5
): StockLabel {
  const available = availableStock(product);

  if (available <= 0) {
    return "out_of_stock";
  }

  if (available <= lowThreshold) {
    return "low_stock";
  }

  return "in_stock";
}

/**
 * Computes the customer's effective unit price.
 * If salePrice is set, is positive, and strictly lower than the regular price,
 * the salePrice applies; otherwise, the regular price applies.
 */
export function effectivePrice(product: {
  price: number;
  salePrice?: number | null;
}): number {
  if (
    typeof product.salePrice === "number" &&
    product.salePrice > 0 &&
    product.salePrice < product.price
  ) {
    return product.salePrice;
  }
  return product.price;
}

/**
 * Helper to check if a product is on sale
 */
export function isOnSale(product: {
  price: number;
  salePrice?: number | null;
}): boolean {
  return (
    typeof product.salePrice === "number" &&
    product.salePrice > 0 &&
    product.salePrice < product.price
  );
}
