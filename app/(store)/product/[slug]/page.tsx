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
import {
  ChevronRight,
  Truck,
  Store,
  RotateCcw,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchQuery(api.products.getBySlug, { slug }).catch(
    () => null
  );

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
    <div className="py-8 sm:py-12 space-y-12 sm:space-y-16">
      <Container size="default">
        {/* Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-ink-muted mb-6 flex-wrap"
        >
          <Link href="/" className="hover:text-ink transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-ink-subtle shrink-0" />
          <Link href="/catalog" className="hover:text-ink transition-colors">
            Catalog
          </Link>
          {product.categorySlug && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-ink-subtle shrink-0" />
              <Link
                href={`/category/${product.categorySlug}`}
                className="hover:text-ink transition-colors"
              >
                {product.category}
              </Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-ink-subtle shrink-0" />
          <span className="text-ink font-medium truncate max-w-[200px] sm:max-w-xs">
            {product.name}
          </span>
        </nav>

        {/* Product Hero: Two-column layout (Gallery on left, Buy panel on right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Gallery */}
          <div className="lg:col-span-7">
            <ProductGallery
              name={product.name}
              imageUrls={product.imageUrls}
              isOnSale={product.isOnSale}
              inventoryStatus={product.inventoryStatus}
              availableStock={product.availableStock}
            />
          </div>

          {/* Right Column: Details & Purchasing */}
          <div className="lg:col-span-5 space-y-6">
            {/* Header / Brand / SKU */}
            <div>
              <div className="flex items-center gap-3 text-xs font-mono text-ink-muted mb-2">
                {product.brand && (
                  <span className="font-semibold uppercase tracking-wider text-ink">
                    {product.brand}
                  </span>
                )}
                {product.brand && product.sku && (
                  <span className="text-ink-subtle">·</span>
                )}
                {product.sku && (
                  <span className="text-ink-subtle">SKU: {product.sku}</span>
                )}
              </div>

              <h1 className="font-heading font-bold text-2xl sm:text-3xl text-ink tracking-tight leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Price section */}
            <div className="p-4 bg-canvas rounded-lg border border-line flex items-baseline justify-between gap-4">
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
                      className="text-base text-ink-muted line-through"
                    />
                  )}
                </div>
                <p className="text-xs text-ink-muted mt-0.5">
                  {settings?.pricesIncludeTaxNote || "Price includes all applicable taxes"}
                </p>
              </div>

              {/* Stock status indicator */}
              <div className="text-right">
                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-danger">
                    <span className="w-2 h-2 rounded-full bg-danger"></span>
                    Out of Stock
                  </span>
                ) : isLowStock ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-warning">
                    <span className="w-2 h-2 rounded-full bg-warning"></span>
                    Only {product.availableStock} left
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success">
                    <span className="w-2 h-2 rounded-full bg-success"></span>
                    In Stock ({product.availableStock} units)
                  </span>
                )}
              </div>
            </div>

            {/* Purchasing actions */}
            <ProductActions
              name={product.name}
              sku={product.sku}
              availableStock={product.availableStock}
              whatsappNumber={settings?.whatsappNumber}
            />

            {/* Delivery & Store Pickup Quick Summary */}
            <div className="border border-line rounded-lg divide-y divide-line text-xs bg-surface">
              <div className="p-3.5 flex items-start gap-3">
                <Truck className="w-4 h-4 text-ink-muted shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-ink">Scheduled Delivery</p>
                  <p className="text-ink-muted mt-0.5">
                    Same-day / 24 hours within Accra. Greater Accra: 1 - 2 business days.
                  </p>
                </div>
              </div>

              <div className="p-3.5 flex items-start gap-3">
                <Store className="w-4 h-4 text-ink-muted shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-ink">Free In-Store Pickup</p>
                  <p className="text-ink-muted mt-0.5">
                    Ready in 2 hours at MB Ventures Main Store (Circle Commercial District).
                  </p>
                </div>
              </div>

              <div className="p-3.5 flex items-start gap-3">
                <RotateCcw className="w-4 h-4 text-ink-muted shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-ink">Payment Methods</p>
                  <p className="text-ink-muted mt-0.5">
                    MTN MoMo, Telecel Cash, Cash on Delivery, or pay at our store counter.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description & Specifications Grid */}
        <div className="pt-12 sm:pt-16 border-t border-line grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left: Product Description */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="font-heading font-bold text-lg sm:text-xl text-ink tracking-tight">
              Product Overview
            </h2>
            <div className="prose prose-sm max-w-none text-ink-muted leading-relaxed whitespace-pre-line text-sm sm:text-base">
              {product.description}
            </div>
          </div>

          {/* Right: Technical Specifications */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="font-heading font-bold text-lg sm:text-xl text-ink tracking-tight">
              Specifications
            </h2>

            {product.specs && product.specs.length > 0 ? (
              <div className="border border-line rounded-lg overflow-hidden bg-surface">
                <dl className="divide-y divide-line text-xs">
                  {product.specs.map((spec: { label: string; value: string; group?: string }, index: number) => (
                    <div
                      key={index}
                      className={`grid grid-cols-3 p-3 gap-2 ${
                        index % 2 === 0 ? "bg-canvas/50" : "bg-surface"
                      }`}
                    >
                      <dt className="font-medium text-ink-muted">{spec.label}</dt>
                      <dd className="col-span-2 font-mono text-ink font-semibold">
                        {spec.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : (
              <p className="text-xs text-ink-muted italic">
                Standard retail manufacturer specifications apply.
              </p>
            )}
          </div>
        </div>

        {/* Related Products Carousel / Grid */}
        {relatedProducts.length > 0 && (
          <div className="pt-12 sm:pt-16 border-t border-line space-y-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-ink-subtle">
                  Complementary Gear
                </span>
                <h2 className="font-heading font-bold text-xl sm:text-2xl text-ink tracking-tight mt-0.5">
                  Related products in {product.category}
                </h2>
              </div>
              {product.categorySlug && (
                <Link
                  href={`/category/${product.categorySlug}`}
                  className="text-xs sm:text-sm font-medium text-ink hover:text-link flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus rounded"
                >
                  <span>View all in category</span>
                  <ChevronRight className="w-3.5 h-3.5" />
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
