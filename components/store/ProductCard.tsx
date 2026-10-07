"use client";

import Link from "next/link";
import Image from "next/image";
import { Price } from "@/components/shared/Price";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart/CartContext";

export interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    slug: string;
    brand?: string;
    sku?: string;
    price: number;
    salePrice?: number;
    effectivePrice: number;
    isOnSale: boolean;
    availableStock: number;
    inventoryStatus: "in_stock" | "low_stock" | "out_of_stock";
    primaryImageUrl?: string | null;
    specs?: Array<{ label: string; value: string; group?: string }>;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const isOutOfStock = product.availableStock <= 0;
  const isLowStock = product.inventoryStatus === "low_stock";

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    addItem({
      _id: product._id,
      name: product.name,
      slug: product.slug,
      brand: product.brand,
      sku: product.sku,
      price: product.price,
      salePrice: product.salePrice,
      primaryImageUrl: product.primaryImageUrl,
      availableStock: product.availableStock,
    });

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1500);
  };

  return (
    <div className="group flex flex-col h-full bg-surface border border-line hover:border-line-strong rounded-lg p-3 sm:p-4 transition-colors duration-150 relative">
      {/* Product Image Container */}
      <Link
        href={`/product/${product.slug}`}
        className="block relative w-full aspect-square bg-canvas rounded-md overflow-hidden mb-3.5 flex items-center justify-center p-3"
      >
        {product.primaryImageUrl ? (
          <Image
            src={product.primaryImageUrl}
            alt={product.name}
            width={300}
            height={300}
            unoptimized
            className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-ink-subtle">
            <Package className="w-10 h-10 stroke-[1.25] text-ink-muted mb-1" />
            <span className="text-[11px] font-mono">MB Ventures</span>
          </div>
        )}

        {/* Badge in top corner */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.isOnSale && (
            <Badge variant="sale" className="text-[11px] px-2 py-0.5 font-semibold">
              Sale
            </Badge>
          )}
          {isLowStock && !product.isOnSale && (
            <Badge variant="warning" className="text-[11px] px-2 py-0.5">
              Only {product.availableStock} left
            </Badge>
          )}
          {isOutOfStock && (
            <Badge variant="secondary" className="text-[11px] px-2 py-0.5">
              Out of stock
            </Badge>
          )}
        </div>
      </Link>

      {/* Product Details */}
      <div className="flex flex-col flex-1">
        {/* Brand & SKU */}
        <div className="flex items-center justify-between gap-2 text-xs text-ink-muted mb-1 font-mono">
          {product.brand && <span className="uppercase tracking-wider">{product.brand}</span>}
          {product.sku && <span className="text-ink-subtle">{product.sku}</span>}
        </div>

        {/* Title */}
        <h3 className="font-heading font-semibold text-sm sm:text-base text-ink line-clamp-2 mb-2 group-hover:text-link transition-colors">
          <Link href={`/product/${product.slug}`}>{product.name}</Link>
        </h3>

        {/* Specs highlight snippet */}
        {product.specs && product.specs.length > 0 && (
          <p className="text-xs text-ink-muted line-clamp-1 mb-3">
            {product.specs[0].label}: <span className="text-ink">{product.specs[0].value}</span>
          </p>
        )}

        {/* Price & Add to Cart button */}
        <div className="mt-auto pt-3 border-t border-line flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <Price
                amount={product.effectivePrice}
                dropZeroCents
                className={`text-base sm:text-lg font-bold ${
                  product.isOnSale ? "text-accent" : "text-ink"
                }`}
              />
              {product.isOnSale && (
                <Price
                  amount={product.price}
                  dropZeroCents
                  className="text-xs text-ink-muted line-through"
                />
              )}
            </div>
            <p className="text-[10px] text-ink-subtle">Incl. taxes</p>
          </div>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleQuickAdd}
            aria-label={`Add ${product.name} to cart`}
            className={`shrink-0 min-h-[44px] px-2 rounded-md text-xs font-semibold flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
              isOutOfStock
                ? "bg-canvas-strong text-ink-subtle cursor-not-allowed"
                : isAdded
                  ? "bg-success text-surface"
                  : "bg-brand text-white hover:bg-brand-hover active:bg-brand-active"
            }`}
          >
            <span>{isAdded ? "Added" : "Add"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
