import type { Metadata } from "next";
import Link from "next/link";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Container } from "@/components/shared/Container";
import { ProductCard } from "@/components/store/ProductCard";
import { FOCUS_RING } from "@/lib/focus";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronDown, ChevronRight, SlidersHorizontal } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All Products",
  description:
    "Browse our complete catalog of ergonomic chairs, motorized standing desks, mechanical keyboards, monitors, and PC hardware.",
};

const SORT_OPTIONS = [
  { value: "latest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
] as const;

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
  const activeSortLabel =
    SORT_OPTIONS.find((option) => option.value === currentSort)?.label ?? "Newest";

  return (
    <div className="py-8 sm:py-12 space-y-8">
      <Container size="default">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-ink-muted mb-4 flex-wrap"
        >
          <Link href="/" className="hover:text-ink transition-colors duration-120">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-ink-subtle shrink-0" aria-hidden="true" />
          <span className="text-ink font-medium">Catalog</span>
          {activeCategory && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-ink-subtle shrink-0" aria-hidden="true" />
              <span className="text-ink font-semibold">{activeCategory.name}</span>
            </>
          )}
          {searchQuery && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-ink-subtle shrink-0" aria-hidden="true" />
              <span className="text-ink font-semibold">Search: &ldquo;{searchQuery}&rdquo;</span>
            </>
          )}
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-line">
          <div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-ink tracking-tight">
              {searchQuery
                ? `Results for “${searchQuery}”`
                : activeCategory
                  ? activeCategory.name
                  : "Workspace & Computing Catalog"}
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted mt-1 max-w-xl">
              {searchQuery
                ? "Showing matching hardware, accessories, and ergonomics in stock."
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
          {/* Category filter chips */}
          <div
            className="flex flex-wrap items-center gap-2"
            role="group"
            aria-label="Filter by category"
          >
            <Link
              href={searchQuery ? `/catalog?q=${encodeURIComponent(searchQuery)}` : "/catalog"}
              aria-current={!activeCategorySlug ? "page" : undefined}
              className={`min-h-11 px-4 rounded-md text-sm font-medium shrink-0 flex items-center border transition-colors duration-120 ease-snap ${FOCUS_RING} ${
                !activeCategorySlug
                  ? "bg-brand-soft text-brand border-brand"
                  : "bg-surface border-line text-ink hover:border-line-strong hover:bg-canvas"
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
                  aria-current={isSelected ? "page" : undefined}
                  className={`min-h-11 px-4 rounded-md text-sm font-medium shrink-0 flex items-center border transition-colors duration-120 ease-snap ${FOCUS_RING} ${
                    isSelected
                      ? "bg-brand-soft text-brand border-brand"
                      : "bg-surface border-line text-ink hover:border-line-strong hover:bg-canvas"
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </div>

          {/* Sort dropdown */}
          {!searchQuery && (
            <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={`inline-flex items-center gap-2 min-h-11 px-4 rounded-md border border-line-strong bg-surface text-sm text-ink hover:bg-canvas transition-colors duration-120 ease-snap ${FOCUS_RING}`}
                  >
                    <SlidersHorizontal
                      className="w-4 h-4 text-ink-muted"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                    <span className="text-ink-muted">Sort</span>
                    <span className="font-semibold">{activeSortLabel}</span>
                    <ChevronDown
                      className="w-4 h-4 text-ink-muted"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="rounded-lg border border-line bg-surface shadow-layer p-1 text-ink"
                >
                  <DropdownMenuLabel className="text-xs font-normal uppercase tracking-[0.06em] text-ink-muted">
                    Sort by
                  </DropdownMenuLabel>
                  {SORT_OPTIONS.map((option) => {
                    const isSelected = currentSort === option.value;
                    const href = `/catalog?${
                      activeCategorySlug ? `category=${activeCategorySlug}&` : ""
                    }sort=${option.value}`;
                    return (
                      <DropdownMenuItem
                        key={option.value}
                        asChild
                        className={`min-h-11 gap-2 rounded-sm text-sm focus:bg-brand-soft focus:text-brand ${
                          isSelected ? "bg-brand-soft text-brand font-semibold" : "text-ink"
                        }`}
                      >
                        <Link href={href}>
                          <span>{option.label}</span>
                          {isSelected && (
                            <Check
                              className="w-4 h-4 ml-auto"
                              strokeWidth={1.5}
                              aria-hidden="true"
                            />
                          )}
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
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
          <div className="border-t border-line mt-6 pt-8 max-w-md">
            <h2 className="font-heading font-semibold text-base text-ink">
              {searchQuery ? "No products match this search" : "No products in this selection"}
            </h2>
            <p className="text-sm text-ink-muted mt-2 leading-relaxed">
              {searchQuery
                ? "Check the spelling or try a shorter keyword, or clear the filter to see everything we stock."
                : "Clear the category filter to see everything we stock."}
            </p>
            <Link
              href="/catalog"
              className={`inline-flex items-center justify-center gap-1.5 min-h-11 px-5 mt-4 rounded-md bg-brand text-surface text-sm font-semibold hover:bg-brand-hover active:bg-brand-active transition-colors duration-120 ease-snap ${FOCUS_RING}`}
            >
              <span>Browse all products</span>
            </Link>
          </div>
        )}
      </Container>
    </div>
  );
}
