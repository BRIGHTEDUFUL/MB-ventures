"use client";

import { useState } from "react";
import Image from "next/image";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProductGalleryProps {
  name: string;
  imageUrls: string[];
  isOnSale?: boolean;
  inventoryStatus?: "in_stock" | "low_stock" | "out_of_stock";
  availableStock: number;
}

export function ProductGallery({
  name,
  imageUrls,
  isOnSale,
  inventoryStatus,
  availableStock,
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const activeImage = imageUrls[selectedIndex] || imageUrls[0] || null;

  return (
    <div className="flex flex-col gap-3">
      {/* Main Image Viewport */}
      <div className="relative w-full aspect-square bg-canvas rounded-lg border border-line flex items-center justify-center p-6 overflow-hidden">
        {activeImage ? (
          <Image
            src={activeImage}
            alt={`${name} - view ${selectedIndex + 1}`}
            width={600}
            height={600}
            unoptimized
            priority
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-ink-subtle">
            <Package className="w-16 h-16 stroke-[1.25] text-ink-muted mb-2" />
            <span className="text-xs font-mono">MB Ventures Product</span>
          </div>
        )}

        {/* Badges in top-left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {isOnSale && (
            <Badge variant="sale" className="text-xs px-2.5 py-0.5 font-semibold">
              Sale Offer
            </Badge>
          )}
          {inventoryStatus === "low_stock" && !isOnSale && (
            <Badge variant="warning" className="text-xs px-2.5 py-0.5">
              Only {availableStock} units remaining
            </Badge>
          )}
          {availableStock <= 0 && (
            <Badge variant="secondary" className="text-xs px-2.5 py-0.5">
              Out of stock
            </Badge>
          )}
        </div>
      </div>

      {/* Thumbnails (if multiple images) */}
      {imageUrls.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {imageUrls.map((url, idx) => (
            <button
              key={url}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              aria-label={`Select product image ${idx + 1}`}
              className={`w-16 h-16 rounded-md bg-canvas border p-1.5 shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
                selectedIndex === idx
                  ? "border-brand ring-1 ring-brand"
                  : "border-line hover:border-line-strong"
              }`}
            >
              <Image
                src={url}
                alt={`${name} thumbnail ${idx + 1}`}
                width={64}
                height={64}
                unoptimized
                className="w-full h-full object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
