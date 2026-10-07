import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Container } from "@/components/shared/Container";
import { ProductCard } from "@/components/store/ProductCard";
import { ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await fetchQuery(api.categories.getBySlug, { slug }).catch(() => null);

  if (!category) {
    return {
      title: "Category Not Found",
    };
  }

  return {
    title: category.name,
    description:
      category.description ||
      `Shop ${category.name} in stock with fast delivery in Accra and nationwide delivery across Ghana.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const { category, products } = await fetchQuery(api.products.listByCategory, {
    categorySlug: slug,
    limit: 50,
  }).catch(() => ({ category: null, products: [] }));

  if (!category) {
    notFound();
  }

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
          <Link href="/catalog" className="hover:text-ink transition-colors duration-120">
            Catalog
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-ink-subtle shrink-0" aria-hidden="true" />
          <span className="text-ink font-semibold" aria-current="page">
            {category.name}
          </span>
        </nav>

        {/* Category Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-line">
          <div>
            <span className="text-xs font-mono uppercase tracking-[0.06em] text-ink-subtle block mb-1">
              Category
            </span>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-ink tracking-tight">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-xs sm:text-sm text-ink-muted mt-2 max-w-2xl leading-relaxed">
                {category.description}
              </p>
            )}
          </div>

          <div className="text-xs font-mono text-ink-subtle shrink-0">
            {products.length} {products.length === 1 ? "item" : "items"} in stock
          </div>
        </div>

        {/* Product Grid or Empty State */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 pt-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="border-t border-line pt-8 max-w-md">
            <h2 className="font-heading font-semibold text-base text-ink">
              No products in this category yet
            </h2>
            <p className="text-sm text-ink-muted mt-2 leading-relaxed">
              Browse the full catalog to see the hardware, accessories, and office furniture we
              currently stock.
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
