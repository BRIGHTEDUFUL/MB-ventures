"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Check, Minus, Plus, MessageSquare, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface ProductActionsProps {
  name: string;
  sku?: string;
  availableStock: number;
  whatsappNumber?: string;
}

export function ProductActions({
  name,
  sku,
  availableStock,
  whatsappNumber = "+233240000000",
}: ProductActionsProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const isOutOfStock = availableStock <= 0;
  const maxAllowed = Math.min(Math.max(1, availableStock), 10);

  const handleDecrement = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrement = () => {
    setQuantity((prev) => Math.min(maxAllowed, prev + 1));
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    setIsAdding(true);
    // Add to cart simulation / local storage
    setTimeout(() => {
      setIsAdding(false);
      setIsAdded(true);
      toast.success(`Added ${quantity} × "${name}" to cart`);

      setTimeout(() => {
        setIsAdded(false);
      }, 2000);
    }, 250);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    toast.success(`Proceeding to checkout with ${quantity} × "${name}"`);
    router.push("/cart");
  };

  const whatsappMessage = encodeURIComponent(
    `Hello MB Ventures, I am interested in purchasing "${name}"${sku ? ` (SKU: ${sku})` : ""}. Is it currently available for delivery/pickup?`
  );

  return (
    <div className="space-y-4 pt-4 border-t border-line">
      {/* Quantity & Add to Cart Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Quantity Stepper */}
        <div className="flex items-center justify-between border border-line-strong rounded-md h-12 px-2 bg-surface min-w-[130px] shrink-0">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={quantity <= 1 || isOutOfStock}
            aria-label="Decrease quantity"
            className="w-8 h-8 flex items-center justify-center text-ink hover:text-ink-muted disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="font-mono font-semibold text-sm text-ink select-none px-2">
            {quantity}
          </span>
          <button
            type="button"
            onClick={handleIncrement}
            disabled={quantity >= maxAllowed || isOutOfStock}
            aria-label="Increase quantity"
            className="w-8 h-8 flex items-center justify-center text-ink hover:text-ink-muted disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Add to Cart Button */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAdding}
          className={`flex-1 h-12 px-6 rounded-md font-semibold text-sm flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
            isOutOfStock
              ? "bg-canvas-strong text-ink-subtle cursor-not-allowed border border-line"
              : isAdded
              ? "bg-success text-surface"
              : "bg-ink text-surface hover:bg-ink/90 active:bg-black"
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-4 h-4" />
              <span>Added to Cart</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" />
              <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
            </>
          )}
        </button>
      </div>

      {/* Secondary CTAs: Buy Now & WhatsApp */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={isOutOfStock}
          className="w-full sm:w-1/2 h-11 px-4 rounded-md border border-line-strong bg-surface text-ink text-xs font-semibold hover:bg-canvas transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <span>Buy Now (Direct Checkout)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <a
          href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-1/2 h-11 px-4 rounded-md border border-line bg-canvas hover:bg-canvas-strong text-ink text-xs font-medium transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <MessageSquare className="w-3.5 h-3.5 text-success" />
          <span>Ask on WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
