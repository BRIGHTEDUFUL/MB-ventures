import type { Metadata } from "next";
import Link from "next/link";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Container } from "@/components/shared/Container";
import { ProductCard } from "@/components/store/ProductCard";
import { ChevronRight, SlidersHorizontal, PackageX } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All Products",
  description:
    "Explore our complete catalog of ergonomic chairs, motorized standing desks, mechanical keyboards, monitors, and PC hardware.",
};

interface CatalogPageProps {
  searchParams: Promise<{
    category?: string;
    sort?: "latest" | "price_asc" | "price_desc";
    q?: string;
  }>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  const activeCategorySlug = params.category;
  const currentSort = params.sort || "latest";
  const searchQuery = params.q?.trim();

  const [categories, products] = await Promise.all([
    fetchQuery(api.categories.list, { parentId: null }).catch(() => []),
    searchQuery
      ? fetchQuery(api.products.search, { query: searchQuery, limit: 30 }).catch(() => [])
      : fetchQuery(api.products.listAll, {
          categorySlug: activeCategorySlug,
          sortBy: currentSort,
        }).catch(() => []),
  ]);

  const activeCategory = categories.find((c) => c.slug === activeCategorySlug);

  return (
    <div className="py-8 sm:py-12 space-y-8">
      <Container size="default">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-ink-muted mb-4">
          <Link href="/" className="hover:text-ink transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-ink-subtle" />
          <span className="text-ink font-medium">Catalog</span>
          {activeCategory && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-ink-subtle" />
              <span className="text-ink font-semibold">{activeCategory.name}</span>
            </>
          )}
          {searchQuery && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-ink-subtle" />
              <span className="text-ink font-semibold">Search: &ldquo;{searchQuery}&rdquo;</span>
            </>
          )}
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-line">
          <div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-ink tracking-tight">
              {searchQuery
                ? `Results for "${searchQuery}"`
                : activeCategory
                ? activeCategory.name
                : "Workspace & Computing Catalog"}
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted mt-1 max-w-xl">
              {searchQuery
                ? `Showing matching hardware, accessories, and ergonomics in stock.`
                : activeCategory?.description ||
                  "Specialist computing hardware, mechanical peripherals, ergonomic seating, and motorized desks."}
            </p>
          </div>

          <div className="text-xs font-mono text-ink-subtle shrink-0">
            {products.length} {products.length === 1 ? "product" : "products"}
          </div>
        </div>

        {/* Filters & Sorting Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-6">
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            <Link
              href={searchQuery ? `/catalog?q=${encodeURIComponent(searchQuery)}` : "/catalog"}
              className={`px-3 py-1.5 rounded text-xs font-medium shrink-0 transition-colors ${
                !activeCategorySlug
                  ? "bg-ink text-surface"
                  : "bg-surface border border-line text-ink hover:bg-canvas"
              }`}
            >
              All Categories
            </Link>
            {categories.map((cat) => {
              const isSelected = activeCategorySlug === cat.slug;
              const href = `/catalog?category=${cat.slug}${currentSort !== "latest" ? `&sort=${currentSort}` : ""}`;
              return (
                <Link
                  key={cat._id}
                  href={href}
                  className={`px-3 py-1.5 rounded text-xs font-medium shrink-0 transition-colors ${
                    isSelected
                      ? "bg-ink text-surface"
                      : "bg-surface border border-line text-ink hover:bg-canvas"
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </div>

          {/* Sort Controls */}
          {!searchQuery && (
            <div className="flex items-center gap-2 shrink-0 self-end md:self-auto text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-ink-muted" />
              <span className="text-ink-muted">Sort:</span>
              <div className="flex items-center gap-1">
                <Link
                  href={`/catalog?${activeCategorySlug ? `category=${activeCategorySlug}&` : ""}sort=latest`}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    currentSort === "latest"
                      ? "font-semibold text-ink bg-canvas border border-line"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  Newest
                </Link>
                <Link
                  href={`/catalog?${activeCategorySlug ? `category=${activeCategorySlug}&` : ""}sort=price_asc`}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    currentSort === "price_asc"
                      ? "font-semibold text-ink bg-canvas border border-line"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  Price: Low to High
                </Link>
                <Link
                  href={`/catalog?${activeCategorySlug ? `category=${activeCategorySlug}&` : ""}sort=price_desc`}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    currentSort === "price_desc"
                      ? "font-semibold text-ink bg-canvas border border-line"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  Price: High to Low
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Product Grid or Empty State */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 pt-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-canvas border border-line rounded-lg mt-6">
            <PackageX className="w-10 h-10 text-ink-muted mx-auto mb-3" />
            <h3 className="font-heading font-semibold text-base text-ink">
              No products found
            </h3>
            <p className="text-xs text-ink-muted mt-1 max-w-sm mx-auto">
              We couldn&apos;t find any items matching your selected criteria.
            </p>
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center mt-4 px-4 py-2 rounded-md bg-ink text-surface text-xs font-semibold hover:bg-ink/90 transition-colors"
            >
              Reset all filters
            </Link>
          </div>
        )}
      </Container>
    </div>
  );
}
