"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart/CartContext";
import { Container } from "@/components/shared/Container";
import { Price } from "@/components/shared/Price";
import {
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  ChevronRight,
  Truck,
  Store,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { FOCUS_RING } from "@/lib/focus";

export default function CartPage() {
  const router = useRouter();
  const { items, itemCount, subtotal, updateQuantity, removeItem, clearCart } = useCart();

  return (
    <div className="py-6 sm:py-10 bg-canvas min-h-[calc(100dvh-180px)]">
      <Container>
        {/* Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-ink-muted mb-6 flex-wrap"
        >
          <Link
            href="/"
            className={`hover:text-ink transition-colors duration-120 rounded ${FOCUS_RING}`}
          >
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-ink-subtle shrink-0" aria-hidden="true" />
          <span className="text-ink font-medium" aria-current="page">
            Cart
          </span>
        </nav>

        {/* Page Header */}
        <div className="flex items-center justify-between border-b border-line pb-4 mb-8 gap-4">
          <div className="flex items-center gap-3">
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-ink tracking-tight">
              Shopping cart
            </h1>
            <span className="text-xs font-mono font-semibold bg-surface border border-line px-2.5 py-1 rounded-sm text-ink-muted">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className={`min-h-11 px-2 text-xs text-ink-muted hover:text-danger-hover transition-colors duration-120 font-medium flex items-center gap-1.5 rounded ${FOCUS_RING}`}
            >
              <Trash2 className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
              <span>Clear cart</span>
            </button>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty state */
          <div className="bg-surface border border-line rounded-lg p-8 sm:p-12 max-w-xl">
            <h2 className="font-heading font-semibold text-xl text-ink">Your cart is empty</h2>
            <p className="text-sm text-ink-muted mt-2 leading-relaxed max-w-md">
              You have not added any items yet. Browse hardware, accessories, and office furniture,
              then return here to check out.
            </p>
            <Link
              href="/catalog"
              className={`inline-flex items-center justify-center gap-2 min-h-11 px-6 mt-6 rounded-md font-semibold text-sm bg-brand text-surface hover:bg-brand-hover active:bg-brand-active transition-colors duration-120 ease-snap ${FOCUS_RING}`}
            >
              <span>Shop the catalog</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
            </Link>
          </div>
        ) : (
          /* Cart grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left column: line items as hairline rows */}
            <div className="lg:col-span-8 border-t border-line divide-y divide-line">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="py-4 sm:py-5 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center"
                >
                  {/* Thumbnail */}
                  <Link
                    href={`/product/${item.slug}`}
                    className={`relative w-20 h-20 sm:w-24 sm:h-24 bg-canvas border border-line rounded-sm overflow-hidden shrink-0 flex items-center justify-center p-2 ${FOCUS_RING}`}
                    aria-label={`View ${item.name}`}
                  >
                    {item.primaryImageUrl ? (
                      <Image
                        src={item.primaryImageUrl}
                        alt={item.name}
                        width={96}
                        height={96}
                        unoptimized
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <ShoppingBag
                        className="w-6 h-6 text-ink-muted"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    )}
                  </Link>

                  {/* Title and brand */}
                  <div className="flex-1 min-w-0">
                    {item.brand && (
                      <span className="text-[11px] font-mono uppercase text-ink-muted tracking-wider block mb-0.5">
                        {item.brand}
                      </span>
                    )}
                    <Link
                      href={`/product/${item.slug}`}
                      className={`font-heading font-semibold text-sm sm:text-base text-ink hover:text-link line-clamp-2 leading-snug inline-block rounded ${FOCUS_RING}`}
                    >
                      {item.name}
                    </Link>
                    {item.sku && (
                      <span className="text-xs font-mono text-ink-subtle block mt-1">
                        SKU: {item.sku}
                      </span>
                    )}
                    <div className="sm:hidden mt-2 flex items-baseline gap-2">
                      <Price
                        amount={item.unitPrice}
                        className={`font-semibold text-sm ${
                          item.salePrice && item.salePrice < item.price ? "text-accent" : "text-ink"
                        }`}
                      />
                      {item.salePrice && item.salePrice < item.price && (
                        <Price
                          amount={item.price}
                          className="text-xs text-ink-subtle line-through"
                        />
                      )}
                    </div>
                  </div>

                  {/* Unit price (desktop) */}
                  <div className="hidden sm:block text-right min-w-[100px]">
                    <Price
                      amount={item.unitPrice}
                      className={`font-semibold text-sm block ${
                        item.salePrice && item.salePrice < item.price ? "text-accent" : "text-ink"
                      }`}
                    />
                    {item.salePrice && item.salePrice < item.price && (
                      <Price amount={item.price} className="text-xs text-ink-subtle line-through" />
                    )}
                  </div>

                  {/* Quantity stepper, line total and remove */}
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-line">
                    <div className="flex items-center border border-line-strong rounded-md bg-surface h-11 shrink-0 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        aria-label={`Decrease quantity of ${item.name}`}
                        className={`w-11 h-11 flex items-center justify-center text-ink-muted hover:text-ink hover:bg-canvas transition-colors duration-120 disabled:opacity-30 rounded-md ${FOCUS_RING}`}
                      >
                        <Minus className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
                      </button>
                      <span className="font-mono text-sm font-semibold px-2 text-ink select-none">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.availableStock}
                        aria-label={`Increase quantity of ${item.name}`}
                        className={`w-11 h-11 flex items-center justify-center text-ink-muted hover:text-ink hover:bg-canvas transition-colors duration-120 disabled:opacity-30 rounded-md ${FOCUS_RING}`}
                      >
                        <Plus className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
                      </button>
                    </div>

                    <div className="text-right min-w-[90px]">
                      <Price
                        amount={item.unitPrice * item.quantity}
                        className="font-bold text-base text-ink block"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      aria-label={`Remove ${item.name} from cart`}
                      className={`w-11 h-11 flex items-center justify-center text-ink-subtle hover:text-danger-hover rounded-md transition-colors duration-120 ${FOCUS_RING}`}
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right column: order summary */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-surface border border-line rounded-lg p-5 sm:p-6">
                <h2 className="font-heading font-bold text-lg text-ink">Order summary</h2>

                <dl className="mt-4 text-sm">
                  <div className="flex justify-between items-center py-2.5 border-b border-line">
                    <dt className="text-ink-muted">Subtotal</dt>
                    <dd>
                      <Price amount={subtotal} className="font-semibold text-base" />
                    </dd>
                  </div>

                  <div className="flex justify-between items-start py-2.5 border-b border-line gap-4">
                    <dt className="text-ink-muted">
                      Fulfillment
                      <span className="block text-xs text-ink-subtle mt-0.5">
                        Calculated at next step
                      </span>
                    </dt>
                    <dd className="text-xs text-ink-muted text-right shrink-0">
                      Delivery / pickup
                    </dd>
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <dt className="font-heading font-bold text-base text-ink">Estimated total</dt>
                    <dd>
                      <Price amount={subtotal} className="text-xl font-bold text-ink" />
                    </dd>
                  </div>
                </dl>

                <button
                  type="button"
                  onClick={() => router.push("/checkout")}
                  className={`w-full min-h-11 px-6 mt-5 rounded-md font-semibold text-sm bg-brand text-surface hover:bg-brand-hover active:bg-brand-active transition-colors duration-120 ease-snap flex items-center justify-center gap-2 ${FOCUS_RING}`}
                >
                  <span>Proceed to checkout</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
                </button>

                <div className="text-center mt-4">
                  <Link
                    href="/catalog"
                    className={`flex items-center justify-center min-h-11 w-full text-sm font-medium text-link hover:underline rounded ${FOCUS_RING}`}
                  >
                    Continue shopping
                  </Link>
                </div>
              </div>

              {/* Delivery and payment notes */}
              <div className="bg-surface border border-line rounded-lg px-4 text-xs divide-y divide-line">
                <div className="py-3 flex items-center gap-2.5 text-ink">
                  <Truck
                    className="w-4 h-4 text-ink-muted shrink-0"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <span>Doorstep delivery across Greater Accra</span>
                </div>
                <div className="py-3 flex items-center gap-2.5 text-ink">
                  <Store
                    className="w-4 h-4 text-ink-muted shrink-0"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <span>Free in-store pickup at Kwame Nkrumah Circle</span>
                </div>
                <div className="py-3 flex items-center gap-2.5 text-ink">
                  <ShieldCheck
                    className="w-4 h-4 text-ink-muted shrink-0"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <span>Pay via MoMo, Cash on Delivery or in-store</span>
                </div>
                <div className="py-3 flex items-center gap-2.5 text-ink">
                  <RotateCcw
                    className="w-4 h-4 text-ink-muted shrink-0"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <span>Warranty on all accessories &amp; hardware</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
