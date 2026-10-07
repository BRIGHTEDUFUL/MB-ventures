"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { HistorySheet } from "./HistorySheet";
import { Pager } from "./Pager";
import { StockAdjustPopover } from "./StockAdjustPopover";
import {
  CONTROL_CLASS,
  FILTER_OPTIONS,
  FOCUS_CLASS,
  PRODUCT_PAGE_SIZE,
  SORT_OPTIONS,
  type HistoryTarget,
  type ProductFilter,
  type SortValue,
} from "./types";
import { Package, Search } from "lucide-react";

/** Products tab: search, filter chips, sorting and offset pagination. */
export function ProductsTab() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ProductFilter>("all");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [sort, setSort] = useState<SortValue>("available_asc");
  const [offset, setOffset] = useState(0);
  const [history, setHistory] = useState<HistoryTarget | null>(null);

  // Debounce the search box and land back on the first page
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setOffset(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const categories = useQuery(api.categories.list, { parentId: null });
  const products = useQuery(api.inventoryAdmin.list, {
    q: search || undefined,
    filter,
    categoryId: categoryId === "all" ? undefined : (categoryId as Id<"categories">),
    sort,
    offset,
    limit: PRODUCT_PAGE_SIZE,
  });

  const selectFilter = (value: ProductFilter) => {
    setFilter(value);
    setOffset(0);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-surface border border-line rounded-lg p-3.5 space-y-3">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Stock filters">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={filter === option.value}
              onClick={() => selectFilter(option.value)}
              className={`h-11 px-3.5 rounded-md text-xs font-semibold transition-colors ${FOCUS_CLASS} ${
                filter === option.value
                  ? "bg-brand text-white"
                  : "border border-line-strong bg-surface text-ink-muted hover:text-ink hover:bg-canvas"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="relative">
            <Search
              className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <label htmlFor="inventory-search" className="sr-only">
              Search products
            </label>
            <input
              id="inventory-search"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name or SKU..."
              className={`w-full h-11 pl-9 pr-3 rounded-md border border-line-strong bg-surface text-xs text-ink ${FOCUS_CLASS}`}
            />
          </div>

          <div>
            <label htmlFor="inventory-category" className="sr-only">
              Category
            </label>
            <select
              id="inventory-category"
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setOffset(0);
              }}
              className={`${CONTROL_CLASS} w-full`}
            >
              <option value="all">All categories</option>
              {categories?.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="inventory-sort" className="sr-only">
              Sort by
            </label>
            <select
              id="inventory-sort"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as SortValue);
                setOffset(0);
              }}
              className={`${CONTROL_CLASS} w-full`}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-line rounded-lg overflow-hidden">
        {products === undefined ? (
          <div className="p-8 text-center text-xs font-mono text-ink-muted">Loading products...</div>
        ) : products.items.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package className="w-10 h-10 text-ink-muted mx-auto stroke-[1.25]" aria-hidden="true" />
            <h3 className="font-heading font-semibold text-sm text-ink">No products found</h3>
            <p className="text-xs text-ink-muted max-w-sm mx-auto">
              Try a different search, category or stock filter.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[64rem] text-left text-xs">
                <thead className="bg-canvas border-b border-line text-ink-muted font-mono uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Stock</th>
                    <th className="py-3 px-4 text-right">Reserved</th>
                    <th className="py-3 px-4 text-right">Available</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {products.items.map((product) => (
                    <tr key={product._id} className="hover:bg-canvas/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 bg-canvas border border-line rounded overflow-hidden shrink-0 flex items-center justify-center p-1">
                            {product.imageUrls[0] ? (
                              <Image
                                src={product.imageUrls[0]}
                                alt={product.name}
                                width={44}
                                height={44}
                                sizes="44px"
                                unoptimized
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <Package className="w-4 h-4 text-ink-muted" aria-hidden="true" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/admin/products/${product._id}`}
                              className="font-heading font-semibold text-xs sm:text-sm text-ink hover:underline line-clamp-1 block"
                            >
                              {product.name}
                            </Link>
                            {product.brand && (
                              <span className="text-[11px] font-mono text-ink-muted uppercase block mt-0.5">
                                {product.brand}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-ink-muted whitespace-nowrap">
                        {product.sku || "-"}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-ink whitespace-nowrap">
                        {product.categoryName || "-"}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-ink">
                        {product.stock}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-ink-muted">
                        {product.reserved}
                      </td>

                      <td
                        className={`py-3.5 px-4 text-right font-mono font-bold ${
                          product.isOut
                            ? "text-danger"
                            : product.isLow
                              ? "text-warning"
                              : "text-ink"
                        }`}
                      >
                        {product.available}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {product.isOut ? (
                            <Badge variant="destructive">Out</Badge>
                          ) : product.isLow ? (
                            <Badge variant="warning">Low</Badge>
                          ) : (
                            <Badge variant="secondary">In stock</Badge>
                          )}
                          {!product.isActive && <Badge variant="outline">Inactive</Badge>}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <StockAdjustPopover
                            productId={product._id}
                            name={product.name}
                            stock={product.stock}
                            reserved={product.reserved}
                          />
                          <button
                            type="button"
                            onClick={() => setHistory({ id: product._id, name: product.name })}
                            className={`h-11 px-3 rounded-md border border-line bg-surface text-xs font-semibold text-ink hover:border-line-strong hover:bg-canvas transition-colors ${FOCUS_CLASS}`}
                            aria-label={`View stock history for ${product.name}`}
                          >
                            History
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pager
              offset={offset}
              limit={PRODUCT_PAGE_SIZE}
              total={products.total}
              hasMore={products.hasMore}
              onOffsetChange={setOffset}
              label="Product pages"
            />
          </>
        )}
      </div>

      <HistorySheet product={history} onClose={() => setHistory(null)} />
    </div>
  );
}
