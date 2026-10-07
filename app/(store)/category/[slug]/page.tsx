import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Container } from "@/components/shared/Container";
import { ProductCard } from "@/components/store/ProductCard";
import { ChevronRight, PackageX } from "lucide-react";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await fetchQuery(api.categories.getBySlug, { slug }).catch(
    () => null
  );

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
          className="flex items-center gap-1.5 text-xs text-ink-muted mb-4"
        >
          <Link href="/" className="hover:text-ink transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-ink-subtle" />
          <Link href="/catalog" className="hover:text-ink transition-colors">
            Catalog
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-ink-subtle" />
          <span className="text-ink font-semibold">{category.name}</span>
        </nav>

        {/* Category Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-line">
          <div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-ink tracking-tight">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-xs sm:text-sm text-ink-muted mt-1 max-w-2xl leading-relaxed">
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
          <div className="p-12 text-center bg-canvas border border-line rounded-lg mt-6">
            <PackageX className="w-10 h-10 text-ink-muted mx-auto mb-3" />
            <h3 className="font-heading font-semibold text-base text-ink">
              No products available in this category yet
            </h3>
            <p className="text-xs text-ink-muted mt-1 max-w-sm mx-auto">
              Check back shortly or browse other categories in our workspace catalog.
            </p>
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center mt-4 px-4 py-2 rounded-md bg-ink text-surface text-xs font-semibold hover:bg-ink/90 transition-colors"
            >
              Browse all products
            </Link>
          </div>
        )}
      </Container>
    </div>
  );
}
