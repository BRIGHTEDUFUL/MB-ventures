import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Container } from "@/components/shared/Container";
import { Price } from "@/components/shared/Price";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductGallery } from "@/components/store/ProductGallery";
import { ProductActions } from "@/components/store/ProductActions";
import { ChevronRight, Truck, Store, RotateCcw } from "lucide-react";

export const dynamic = "force-dynamic";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchQuery(api.products.getBySlug, { slug }).catch(() => null);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: product.primaryImageUrl ? [{ url: product.primaryImageUrl }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    fetchQuery(api.products.getBySlug, { slug }).catch(() => null),
    fetchQuery(api.siteSettings.getPublicSettings, {}).catch(() => null),
  ]);

  if (!product) {
    notFound();
  }

  const relatedProducts = await fetchQuery(api.products.listRelated, {
    productId: product._id,
    categoryId: product.categoryId,
    limit: 4,
  }).catch(() => []);

  const isOutOfStock = product.availableStock <= 0;
  const isLowStock = product.inventoryStatus === "low_stock";

  return (
    <div className="py-6 sm:py-10">
      <Container size="default">
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
          <Link
            href="/catalog"
            className={`hover:text-ink transition-colors duration-120 rounded ${FOCUS_RING}`}
          >
            Catalog
          </Link>
          {product.categorySlug && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-ink-subtle shrink-0" aria-hidden="true" />
              <Link
                href={`/category/${product.categorySlug}`}
                className={`hover:text-ink transition-colors duration-120 rounded ${FOCUS_RING}`}
              >
                {product.category}
              </Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-ink-subtle shrink-0" aria-hidden="true" />
          <span className="text-ink font-medium truncate max-w-[200px] sm:max-w-xs">
            {product.name}
          </span>
        </nav>

        {/* Product hero: gallery left, purchase panel right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left column: gallery */}
          <div className="lg:col-span-7">
            <ProductGallery
              name={product.name}
              imageUrls={product.imageUrls}
              isOnSale={product.isOnSale}
              inventoryStatus={product.inventoryStatus}
              availableStock={product.availableStock}
            />
          </div>

          {/* Right column: details and purchasing */}
          <div className="lg:col-span-5 space-y-6">
            {/* Brand / SKU / title */}
            <div>
              <div className="flex items-center gap-3 text-xs font-mono text-ink-muted mb-2">
                {product.brand && (
                  <span className="font-semibold uppercase tracking-wider text-ink">
                    {product.brand}
                  </span>
                )}
                {product.brand && product.sku && (
                  <span className="text-ink-subtle" aria-hidden="true">
                    ·
                  </span>
                )}
                {product.sku && <span className="text-ink-subtle">SKU: {product.sku}</span>}
              </div>

              <h1 className="font-heading font-bold text-2xl sm:text-3xl text-ink tracking-tight leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Price and stock */}
            <div className="bg-canvas rounded-lg border border-line p-4 sm:p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-baseline gap-3">
                  <Price
                    amount={product.effectivePrice}
                    className={`text-2xl sm:text-3xl font-bold ${
                      product.isOnSale ? "text-accent" : "text-ink"
                    }`}
                  />
                  {product.isOnSale && (
                    <Price
                      amount={product.price}
                      className="text-base text-ink-subtle line-through"
                    />
                  )}
                </div>
                <p className="text-xs text-ink-muted mt-1">
                  {settings?.pricesIncludeTaxNote || "Price includes all applicable taxes"}
                </p>
              </div>

              <div className="sm:text-right">
                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-2 text-xs font-semibold text-danger bg-danger-soft border border-danger/30 rounded-sm px-2.5 py-1">
                    <span className="w-2 h-2 rounded-full bg-danger" aria-hidden="true" />
                    Out of stock
                  </span>
                ) : isLowStock ? (
                  <span className="inline-flex items-center gap-2 text-xs font-semibold text-warning bg-warning-soft border border-warning/30 rounded-sm px-2.5 py-1">
                    <span className="w-2 h-2 rounded-full bg-warning" aria-hidden="true" />
                    Only {product.availableStock} left
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 text-xs font-semibold text-success bg-success-soft border border-success/30 rounded-sm px-2.5 py-1">
                    <span className="w-2 h-2 rounded-full bg-success" aria-hidden="true" />
                    In stock: {product.availableStock} units
                  </span>
                )}
              </div>
            </div>

            {/* Purchasing actions */}
            <ProductActions
              productId={product._id}
              name={product.name}
              slug={product.slug}
              brand={product.brand}
              sku={product.sku}
              price={product.price}
              salePrice={product.salePrice}
              primaryImageUrl={product.imageUrls[0]}
              availableStock={product.availableStock}
              whatsappNumber={settings?.whatsappNumber}
            />

            {/* Delivery, pickup and payment facts */}
            <ul className="border-t border-line divide-y divide-line text-xs">
              <li className="py-3.5 flex items-start gap-3">
                <Truck
                  className="w-4 h-4 text-ink-muted shrink-0 mt-0.5"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <div>
                  <p className="font-semibold text-ink">Scheduled delivery</p>
                  <p className="text-ink-muted mt-0.5">
                    Same-day / 24 hours within Accra. Greater Accra: 1 - 2 business days.
                  </p>
                </div>
              </li>

              <li className="py-3.5 flex items-start gap-3">
                <Store
                  className="w-4 h-4 text-ink-muted shrink-0 mt-0.5"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <div>
                  <p className="font-semibold text-ink">Free in-store pickup</p>
                  <p className="text-ink-muted mt-0.5">
                    Ready in 2 hours at MB Ventures Main Store (Circle Commercial District).
                  </p>
                </div>
              </li>

              <li className="py-3.5 flex items-start gap-3">
                <RotateCcw
                  className="w-4 h-4 text-ink-muted shrink-0 mt-0.5"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <div>
                  <p className="font-semibold text-ink">Payment methods</p>
                  <p className="text-ink-muted mt-0.5">
                    MTN MoMo, Telecel Cash, Cash on Delivery, or pay at our store counter.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Description and specifications */}
        <div className="mt-8 sm:mt-12 border-t border-line pt-6 sm:pt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <h2 className="font-heading font-bold text-lg sm:text-xl text-ink tracking-tight">
              Product overview
            </h2>
            <div className="max-w-none text-ink-muted leading-relaxed whitespace-pre-line text-sm sm:text-base">
              {product.description}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <h2 className="font-heading font-bold text-lg sm:text-xl text-ink tracking-tight">
              Specifications
            </h2>

            {product.specs && product.specs.length > 0 ? (
              <div className="border border-line rounded-lg overflow-hidden bg-surface">
                <dl className="divide-y divide-line">
                  {product.specs.map(
                    (spec: { label: string; value: string; group?: string }, index: number) => (
                      <div key={index} className="grid grid-cols-3 gap-3 px-4 py-3">
                        <dt className="text-xs text-ink-muted">{spec.label}</dt>
                        <dd className="col-span-2 mono-specs text-ink">{spec.value}</dd>
                      </div>
                    )
                  )}
                </dl>
              </div>
            ) : (
              <p className="text-xs text-ink-muted">
                Standard retail manufacturer specifications apply.
              </p>
            )}
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-8 sm:mt-12 border-t border-line pt-6 sm:pt-8 space-y-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-[0.06em] text-ink-subtle block mb-1">
                  Complementary Gear
                </span>
                <h2 className="font-heading font-bold text-xl sm:text-2xl text-ink tracking-tight">
                  Related products in {product.category}
                </h2>
              </div>
              {product.categorySlug && (
                <Link
                  href={`/category/${product.categorySlug}`}
                  className={`text-sm font-medium text-link flex items-center gap-1.5 min-h-11 rounded ${FOCUS_RING}`}
                >
                  <span>View all in category</span>
                  <ChevronRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
                </Link>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct._id} product={relProduct} />
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
