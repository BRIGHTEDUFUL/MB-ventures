"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Search, Loader2, ArrowRight, Package } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Price } from "@/components/shared/Price";
import { Badge } from "@/components/ui/badge";

interface QuickSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickSearchDialog({ open, onOpenChange }: QuickSearchDialogProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [, startTransition] = useTransition();

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(() => {
        setDebouncedQuery(query.trim());
      });
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  // Query Convex full-text search
  const results = useQuery(
    api.products.search,
    debouncedQuery.length >= 2 ? { query: debouncedQuery, limit: 6 } : "skip"
  );

  const isSearching = debouncedQuery.length >= 2 && results === undefined;

  const handleSelectProduct = (slug: string) => {
    onOpenChange(false);
    setQuery("");
    router.push(`/product/${slug}`);
  };

  const handleViewAll = () => {
    if (!debouncedQuery) return;
    onOpenChange(false);
    router.push(`/catalog?q=${encodeURIComponent(debouncedQuery)}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-xl overflow-hidden rounded-lg bg-surface border-line shadow-layer">
        <DialogHeader className="sr-only">
          <DialogTitle>Search Products</DialogTitle>
        </DialogHeader>

        {/* Input area */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-line">
          <Search className="w-5 h-5 text-ink-muted shrink-0" aria-hidden="true" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && debouncedQuery) {
                handleViewAll();
              }
            }}
            placeholder="Search office chairs, standing desks, keyboards, hardware..."
            className="flex-1 bg-transparent text-ink placeholder:text-ink-muted text-sm font-normal focus:outline-none"
            autoFocus
          />
          {isSearching && <Loader2 className="w-4 h-4 text-ink-muted animate-spin shrink-0" />}
          <span className="text-[11px] font-mono text-ink-subtle border border-line rounded px-1.5 py-0.5 select-none hidden sm:inline-block">
            ESC
          </span>
        </div>

        {/* Results list */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-line">
          {debouncedQuery.length < 2 && (
            <div className="px-4 py-8 text-center text-xs text-ink-muted">
              Type at least 2 characters to search products and specifications.
            </div>
          )}

          {debouncedQuery.length >= 2 && results && results.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="text-sm font-medium text-ink">No matching products found</p>
              <p className="text-xs text-ink-muted mt-1">
                Try searching for &ldquo;chair&rdquo;, &ldquo;desk&rdquo;, &ldquo;keyboard&rdquo;,
                or &ldquo;SSD&rdquo;.
              </p>
            </div>
          )}

          {results &&
            results.map((product) => (
              <button
                key={product._id}
                type="button"
                onClick={() => handleSelectProduct(product.slug)}
                className="w-full text-left px-4 py-3 hover:bg-canvas flex items-center justify-between gap-4 transition-colors duration-150 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded bg-canvas-strong border border-line flex items-center justify-center shrink-0 overflow-hidden">
                    {product.primaryImageUrl ? (
                      <Image
                        src={product.primaryImageUrl}
                        alt={product.name}
                        width={40}
                        height={40}
                        unoptimized
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <Package className="w-5 h-5 text-ink-muted" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate group-hover:text-link">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {product.brand && (
                        <span className="text-xs text-ink-muted">{product.brand}</span>
                      )}
                      {product.sku && (
                        <span className="text-[11px] font-mono text-ink-subtle">{product.sku}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 flex flex-col items-end">
                  <Price
                    amount={product.effectivePrice}
                    dropZeroCents
                    className="text-sm font-semibold"
                  />
                  {product.isOnSale && (
                    <Badge variant="sale" className="mt-0.5">
                      Sale
                    </Badge>
                  )}
                </div>
              </button>
            ))}
        </div>

        {/* Footer actions */}
        {debouncedQuery.length >= 2 && results && results.length > 0 && (
          <div className="px-4 py-2.5 bg-canvas border-t border-line flex items-center justify-between text-xs text-ink-muted">
            <span>{results.length} results found</span>
            <button
              type="button"
              onClick={handleViewAll}
              className="inline-flex items-center gap-1 font-medium text-ink hover:text-link focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus rounded"
            >
              <span>View all results</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
