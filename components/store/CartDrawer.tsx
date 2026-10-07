"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart/CartContext";
import { Price } from "@/components/shared/Price";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ShoppingBag, X, Minus, Plus, Trash2, ArrowRight, Truck, ShieldCheck } from "lucide-react";

export function CartDrawer() {
  const router = useRouter();
  const { items, itemCount, subtotal, isDrawerOpen, closeDrawer, updateQuantity, removeItem } =
    useCart();

  const handleCheckout = () => {
    closeDrawer();
    router.push("/checkout");
  };

  const handleViewCart = () => {
    closeDrawer();
    router.push("/cart");
  };

  return (
    <Sheet open={isDrawerOpen} onOpenChange={(open) => !open && closeDrawer()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col bg-surface border-l border-line z-50 focus-visible:outline-none"
      >
        {/* Drawer Header */}
        <SheetHeader className="px-5 py-4 border-b border-line flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-ink" />
            <SheetTitle className="font-heading text-base font-bold text-ink">
              Shopping Cart
            </SheetTitle>
            <span className="text-xs font-mono font-semibold bg-canvas-strong px-2 py-0.5 rounded text-ink-muted">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close cart"
            className="w-11 h-11 -mr-2 rounded-md flex items-center justify-center text-ink-muted hover:text-ink hover:bg-canvas transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <X className="w-5 h-5" />
          </button>
        </SheetHeader>

        {/* Free Delivery / Trust Ribbon */}
        <div className="bg-canvas px-5 py-2.5 border-b border-line flex items-center gap-2 text-xs text-ink-muted">
          <Truck className="w-4 h-4 text-ink shrink-0" />
          <span>Accra Fast Delivery & In-Store Pickup Available</span>
        </div>

        {/* Drawer Body: Cart Items List or Empty State */}
        {items.length === 0 ? (
          <div className="flex-1 px-5 py-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-canvas border border-line flex items-center justify-center text-ink-muted mb-4">
              <ShoppingBag className="w-8 h-8 stroke-[1.25]" />
            </div>
            <h3 className="font-heading text-base font-semibold text-ink mb-1">
              Your cart is empty
            </h3>
            <p className="text-sm text-ink-muted mb-6 max-w-xs">
              Browse our selection of computer accessories, hardware, chairs and tables.
            </p>
            <button
              type="button"
              onClick={() => {
                closeDrawer();
                router.push("/catalog");
              }}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-md font-semibold text-sm bg-brand text-white hover:bg-brand-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus min-h-[44px]"
            >
              Browse catalog
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 divide-y divide-line">
            {items.map((item) => (
              <div key={item.productId} className="py-4 flex gap-3.5">
                {/* Product Thumbnail */}
                <Link
                  href={`/product/${item.slug}`}
                  onClick={closeDrawer}
                  className="relative w-18 h-18 sm:w-20 sm:h-20 bg-canvas border border-line rounded-md overflow-hidden shrink-0 flex items-center justify-center p-1.5"
                >
                  {item.primaryImageUrl ? (
                    <Image
                      src={item.primaryImageUrl}
                      alt={item.name}
                      width={80}
                      height={80}
                      unoptimized
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <ShoppingBag className="w-6 h-6 text-ink-muted stroke-[1.25]" />
                  )}
                </Link>

                {/* Product Info & Controls */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={closeDrawer}
                        className="font-heading font-medium text-sm text-ink hover:underline line-clamp-2 leading-snug"
                      >
                        {item.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        aria-label={`Remove ${item.name} from cart`}
                        className="text-ink-subtle hover:text-danger p-1 -mr-1 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {item.brand && (
                      <p className="text-[11px] font-mono text-ink-muted mt-0.5 uppercase">
                        {item.brand}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-3">
                    {/* Stepper */}
                    <div className="flex items-center border border-line rounded h-11 bg-surface px-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        aria-label="Decrease quantity"
                        className="w-11 h-11 flex items-center justify-center text-ink-muted hover:text-ink transition-colors disabled:opacity-30 rounded"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono text-xs font-semibold px-2 text-ink select-none">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.availableStock}
                        aria-label="Increase quantity"
                        className="w-11 h-11 flex items-center justify-center text-ink-muted hover:text-ink transition-colors disabled:opacity-30 rounded"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Line Total */}
                    <div className="text-right">
                      <Price
                        amount={item.unitPrice * item.quantity}
                        className="text-sm font-semibold text-ink"
                      />
                      {item.quantity > 1 && (
                        <div className="text-[11px] text-ink-muted font-mono">
                          <Price amount={item.unitPrice} /> each
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Drawer Footer Summary */}
        {items.length > 0 && (
          <div className="border-t border-line p-5 bg-surface space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between items-center text-ink">
                <span className="font-medium">Subtotal</span>
                <Price amount={subtotal} className="text-base font-bold" />
              </div>
              <p className="text-xs text-ink-muted">
                Delivery fees & payment methods calculated at checkout.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleCheckout}
                className="w-full h-[52px] rounded-md font-semibold text-sm bg-brand text-white hover:bg-brand-hover transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleViewCart}
                className="w-full h-11 rounded-md font-medium text-xs border border-line hover:border-line-strong hover:bg-canvas text-ink transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                View Full Cart
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-ink-subtle pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-success" />
              <span>MoMo, Cash on Delivery & In-Store Pickup accepted</span>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
