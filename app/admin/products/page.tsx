"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Price } from "@/components/shared/Price";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Search, Package, Edit2, Copy, Trash2, Star } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

export default function AdminProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  const categories = useQuery(api.categories.list, { parentId: null });
  const products = useQuery(api.productsAdmin.list, {
    categoryId: categoryFilter === "all" ? undefined : (categoryFilter as Id<"categories">),
    stockStatus: stockFilter === "all" ? undefined : stockFilter,
    search: searchQuery.trim() || undefined,
    sort: sortBy,
  });

  // Row shape returned by productsAdmin.list — inferred so the stock dialog stays type-safe
  type ProductRow = NonNullable<typeof products>[number];

  const toggleActive = useMutation(api.productsAdmin.toggleActive);
  const toggleFeatured = useMutation(api.productsAdmin.toggleFeatured);
  const duplicateProduct = useMutation(api.productsAdmin.duplicate);
  const deleteProduct = useMutation(api.productsAdmin.remove);
  const adjustStock = useMutation(api.productsAdmin.adjustStock);

  // Quick Stock Adjust Dialog
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductRow | null>(null);
  const [newStockValue, setNewStockValue] = useState<number>(0);
  const [stockReason, setStockReason] = useState<"restock" | "manual" | "correction">("restock");
  const [stockNote, setStockNote] = useState("");
  const [isAdjusting, setIsAdjusting] = useState(false);

  // Delete Dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{
    id: Id<"products">;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenStockDialog = (product: ProductRow) => {
    setSelectedProduct(product);
    setNewStockValue(product.stock);
    setStockReason("restock");
    setStockNote("");
    setStockDialogOpen(true);
  };

  const handleSaveStockAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    if (newStockValue < selectedProduct.reservedStock) {
      toast.error(
        `Physical stock cannot be less than ${selectedProduct.reservedStock} (units held by pending orders).`
      );
      return;
    }

    setIsAdjusting(true);
    try {
      await adjustStock({
        productId: selectedProduct._id,
        newPhysicalStock: newStockValue,
        reason: stockReason,
        note: stockNote.trim() || undefined,
      });
      toast.success(`Stock updated for "${selectedProduct.name}".`);
      setStockDialogOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to adjust stock";
      toast.error(msg);
    } finally {
      setIsAdjusting(false);
    }
  };

  const handleDuplicate = async (id: Id<"products">, name: string) => {
    try {
      await duplicateProduct({ id });
      toast.success(`Duplicated "${name}". New draft created.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to duplicate product";
      toast.error(msg);
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await deleteProduct({ id: productToDelete.id });
      toast.success(`Product "${productToDelete.name}" deleted.`);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete product";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Products"
        description="Manage product catalog, inventory physical stock, sale prices, and technical specifications."
        actions={
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-brand text-white text-xs font-semibold hover:bg-brand-hover transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </Link>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-surface border border-line rounded-lg p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, SKU, or brand..."
              className="w-full h-11 pl-9 pr-3 rounded-md border border-line-strong bg-surface text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full h-11 px-3 rounded-md border border-line-strong bg-surface text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              <option value="all">All Categories</option>
              {categories?.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="w-full h-11 px-3 rounded-md border border-line-strong bg-surface text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              <option value="all">All Stock Statuses</option>
              <option value="in_stock">In Stock (&gt; 3 units)</option>
              <option value="low_stock">Low Stock (≤ 3 units)</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full h-11 px-3 rounded-md border border-line-strong bg-surface text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              <option value="newest">Newest First</option>
              <option value="name">Name (A-Z)</option>
              <option value="price_asc">Price (Low to High)</option>
              <option value="price_desc">Price (High to Low)</option>
              <option value="stock_asc">Available Stock (Low First)</option>
              <option value="stock_desc">Available Stock (High First)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-surface border border-line rounded-lg overflow-hidden">
        {products === undefined ? (
          <div className="p-8 text-center text-xs font-mono text-ink-muted">
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package className="w-10 h-10 text-ink-muted mx-auto stroke-[1.25]" />
            <h3 className="font-heading font-semibold text-sm text-ink">No products found</h3>
            <p className="text-xs text-ink-muted max-w-sm mx-auto">
              Try adjusting your search query or filter settings.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas border-b border-line text-ink-muted font-mono uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4 text-center">Featured</th>
                  <th className="py-3 px-4 text-center">Active</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-canvas/50 transition-colors">
                    {/* Thumbnail & Title */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-canvas border border-line rounded overflow-hidden shrink-0 flex items-center justify-center p-1">
                          {product.primaryImageUrl ? (
                            <Image
                              src={product.primaryImageUrl}
                              alt={product.name}
                              width={44}
                              height={44}
                              unoptimized
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Package className="w-4 h-4 text-ink-muted" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/products/${product._id}`}
                            className="font-heading font-semibold text-xs sm:text-sm text-ink hover:text-accent hover:underline line-clamp-1 block"
                          >
                            {product.name}
                          </Link>
                          <div className="flex items-center gap-2 text-[11px] font-mono text-ink-muted mt-0.5">
                            {product.brand && <span className="uppercase">{product.brand}</span>}
                            {product.brand && product.sku && <span>·</span>}
                            {product.sku && (
                              <span className="text-ink-subtle">SKU: {product.sku}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 font-medium text-ink">{product.categoryName}</td>

                    {/* Price */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-baseline gap-1.5">
                        <Price
                          amount={product.salePrice ?? product.price}
                          className={`font-semibold ${product.salePrice ? "text-accent" : "text-ink"}`}
                        />
                        {product.salePrice && (
                          <Price
                            amount={product.price}
                            className="text-[11px] text-ink-muted line-through"
                          />
                        )}
                      </div>
                    </td>

                    {/* Stock */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div>
                          <span
                            className={`font-mono font-bold text-xs ${
                              product.availableStock === 0
                                ? "text-danger"
                                : product.availableStock <= 3
                                  ? "text-warning"
                                  : "text-ink"
                            }`}
                          >
                            {product.availableStock} available
                          </span>
                          <span className="text-[10px] text-ink-muted block font-mono">
                            {product.stock} on hand · {product.reservedStock} held
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenStockDialog(product)}
                          className="p-1 rounded text-ink-muted hover:text-ink hover:bg-canvas text-[11px] font-mono border border-line"
                          title="Quick stock adjust"
                        >
                          ± Edit
                        </button>
                      </div>
                    </td>

                    {/* Featured Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          toggleFeatured({ id: product._id, isFeatured: !product.isFeatured })
                        }
                        className={`p-1.5 rounded transition-colors ${
                          product.isFeatured
                            ? "text-accent bg-accent-soft"
                            : "text-ink-subtle hover:text-ink hover:bg-canvas"
                        }`}
                        title={product.isFeatured ? "Featured on homepage" : "Not featured"}
                      >
                        <Star className={`w-4 h-4 ${product.isFeatured ? "fill-current" : ""}`} />
                      </button>
                    </td>

                    {/* Active Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          toggleActive({ id: product._id, isActive: !product.isActive })
                        }
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                          product.isActive
                            ? "bg-success-soft text-success"
                            : "bg-canvas-strong text-ink-subtle"
                        }`}
                      >
                        {product.isActive ? "Active" : "Draft"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/products/${product._id}`}
                          className="p-1.5 rounded hover:bg-canvas text-ink-muted hover:text-ink transition-colors"
                          title="Edit product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDuplicate(product._id, product.name)}
                          className="p-1.5 rounded hover:bg-canvas text-ink-muted hover:text-ink transition-colors"
                          title="Duplicate product"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setProductToDelete({ id: product._id, name: product.name });
                            setDeleteDialogOpen(true);
                          }}
                          className="p-1.5 rounded hover:bg-danger-soft text-ink-muted hover:text-danger transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Stock Adjustment Dialog */}
      <Dialog open={stockDialogOpen} onOpenChange={setStockDialogOpen}>
        <DialogContent className="sm:max-w-md bg-surface border-line p-6">
          <DialogHeader className="border-b border-line pb-3">
            <DialogTitle className="font-heading font-bold text-lg text-ink">
              Adjust Inventory Stock
            </DialogTitle>
          </DialogHeader>

          {selectedProduct && (
            <form onSubmit={handleSaveStockAdjust} className="space-y-4 pt-3 text-xs">
              <div>
                <p className="font-semibold text-ink text-sm">{selectedProduct.name}</p>
                <p className="text-ink-muted font-mono mt-0.5">
                  Current Physical: {selectedProduct.stock} units · Reserved:{" "}
                  {selectedProduct.reservedStock} units
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  New Physical Units on Hand
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={selectedProduct.reservedStock}
                    required
                    value={newStockValue}
                    onChange={(e) => setNewStockValue(parseInt(e.target.value) || 0)}
                    className="w-32 h-11 px-3 rounded-md border border-line-strong bg-surface text-sm font-mono text-ink"
                  />
                  <span className="text-[11px] text-ink-muted">
                    Min allowed: {selectedProduct.reservedStock} (reserved)
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Adjustment Reason
                </label>
                <select
                  value={stockReason}
                  onChange={(e) =>
                    setStockReason(e.target.value as "restock" | "manual" | "correction")
                  }
                  className="w-full h-11 px-3 rounded-md border border-line-strong bg-surface text-xs text-ink"
                >
                  <option value="restock">New Shipment / Restock</option>
                  <option value="manual">Manual Adjustment</option>
                  <option value="correction">Inventory Audit Correction</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Adjustment Note (Optional)
                </label>
                <input
                  type="text"
                  value={stockNote}
                  onChange={(e) => setStockNote(e.target.value)}
                  placeholder="e.g. Received shipment container batch A2"
                  className="w-full h-11 px-3 rounded-md border border-line-strong bg-surface text-xs text-ink"
                />
              </div>

              <DialogFooter className="border-t border-line pt-4 flex flex-row items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setStockDialogOpen(false)}
                  className="h-11 px-4 rounded-md border border-line text-xs font-semibold text-ink hover:bg-canvas"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdjusting}
                  className="h-11 px-4 rounded-md bg-brand text-white text-xs font-semibold hover:bg-brand-hover"
                >
                  {isAdjusting ? "Saving..." : "Save Stock Adjustment"}
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={`Delete Product "${productToDelete?.name}"?`}
        description="Are you sure you want to delete this product? Hard delete is blocked if the product exists in past orders."
        confirmLabel="Delete Product"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
