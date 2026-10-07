"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ImageUploader, type ImageItem } from "./ImageUploader";
import { slugify } from "@/lib/slug";
import { toMinor } from "@/lib/money";
import { toast } from "sonner";
import { Plus, Trash2, Eye, Edit3, ArrowLeft, Save } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { Id } from "@/convex/_generated/dataModel";

interface SpecRow {
  group?: string;
  label: string;
  value: string;
}

export interface ProductFormData {
  id?: Id<"products">;
  name: string;
  slug: string;
  description: string;
  categoryId: Id<"categories"> | "";
  brand: string;
  sku: string;
  price: string; // Major currency input e.g. "250.00"
  salePrice: string; // Major currency input e.g. "199.00"
  stock: number;
  reservedStock?: number;
  images: ImageItem[];
  specs: SpecRow[];
  isActive: boolean;
  isFeatured: boolean;
}

interface ProductFormProps {
  initialData?: ProductFormData;
  onSubmit: (data: {
    id?: Id<"products">;
    name: string;
    slug: string;
    description: string;
    categoryId: Id<"categories">;
    brand?: string;
    sku?: string;
    price: number; // Minor integer (pesewas)
    salePrice?: number; // Minor integer (pesewas)
    stock: number;
    imageIds: Id<"_storage">[];
    specs: SpecRow[];
    isActive: boolean;
    isFeatured: boolean;
  }) => Promise<void>;
  isSubmitting?: boolean;
}

const DEFAULT_DATA: ProductFormData = {
  name: "",
  slug: "",
  description: "",
  categoryId: "",
  brand: "",
  sku: "",
  price: "",
  salePrice: "",
  stock: 10,
  images: [],
  specs: [],
  isActive: true,
  isFeatured: false,
};

export function ProductForm({ initialData, onSubmit, isSubmitting = false }: ProductFormProps) {
  const router = useRouter();
  const categories = useQuery(api.categories.list, { parentId: null });

  const [formData, setFormData] = useState<ProductFormData>(initialData || DEFAULT_DATA);
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [descTab, setDescTab] = useState<"write" | "preview">("write");

  // When category changes, auto-populate specTemplate if specs list is currently empty
  const handleCategoryChange = (catId: string) => {
    const selectedCat = categories?.find((c) => c._id === catId);
    setFormData((prev) => {
      let updatedSpecs = prev.specs;
      if (
        prev.specs.length === 0 &&
        selectedCat?.specTemplate &&
        selectedCat.specTemplate.length > 0
      ) {
        updatedSpecs = selectedCat.specTemplate.map((label) => ({
          label,
          value: "",
        }));
      }
      return {
        ...prev,
        categoryId: catId as Id<"categories">,
        specs: updatedSpecs,
      };
    });
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: isEditingSlug ? prev.slug : slugify(name),
    }));
  };

  const handleAddSpecRow = () => {
    setFormData((prev) => ({
      ...prev,
      specs: [...prev.specs, { label: "", value: "" }],
    }));
  };

  const handleRemoveSpecRow = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      specs: prev.specs.filter((_, i) => i !== index),
    }));
  };

  const handleSpecChange = (index: number, field: "label" | "value", val: string) => {
    setFormData((prev) => {
      const updated = [...prev.specs];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, specs: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter a product name.");
      return;
    }

    if (!formData.slug.trim()) {
      toast.error("Please enter a valid product URL slug.");
      return;
    }

    if (!formData.categoryId) {
      toast.error("Please select a product category.");
      return;
    }

    const priceMajor = parseFloat(formData.price);
    if (isNaN(priceMajor) || priceMajor <= 0) {
      toast.error("Please enter a valid regular price greater than 0.");
      return;
    }

    const priceMinor = toMinor(formData.price);
    let salePriceMinor: number | undefined = undefined;

    if (formData.salePrice.trim()) {
      const saleMajor = parseFloat(formData.salePrice);
      if (isNaN(saleMajor) || saleMajor <= 0) {
        toast.error("Please enter a valid sale price.");
        return;
      }
      salePriceMinor = toMinor(formData.salePrice);
      if (salePriceMinor >= priceMinor) {
        toast.error("Sale price must be strictly lower than regular price.");
        return;
      }
    }

    // Filter out empty spec rows
    const validSpecs = formData.specs
      .map((s) => ({ label: s.label.trim(), value: s.value.trim() }))
      .filter((s) => s.label && s.value);

    try {
      await onSubmit({
        id: formData.id,
        name: formData.name.trim(),
        slug: formData.slug.trim().toLowerCase(),
        description: formData.description.trim(),
        categoryId: formData.categoryId as Id<"categories">,
        brand: formData.brand.trim() || undefined,
        sku: formData.sku.trim() || undefined,
        price: priceMinor,
        salePrice: salePriceMinor,
        stock: Math.max(0, formData.stock),
        imageIds: formData.images.map((i) => i.storageId),
        specs: validSpecs,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
      });
    } catch (err: unknown) {
      console.error("Save product failed:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between border-b border-line pb-4 sticky top-16 bg-canvas z-20">
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-ink transition-colors p-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-brand text-white text-xs font-semibold hover:bg-brand-hover transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>
              {isSubmitting ? "Saving..." : formData.id ? "Update Product" : "Save Product"}
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Core Fields, Description, Specs (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Title, Slug, Category, Brand */}
          <div className="bg-surface border border-line rounded-lg p-5 sm:p-6 space-y-4">
            <h2 className="font-heading font-bold text-base text-ink border-b border-line pb-2">
              General Information
            </h2>

            {/* Product Name */}
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Product Title <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Keychron K2 Pro Wireless Mechanical Keyboard"
                className="w-full h-11 px-3.5 rounded-md border border-line-strong bg-surface text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              />
            </div>

            {/* Slug */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-ink">
                  URL Slug <span className="text-danger">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsEditingSlug(!isEditingSlug)}
                  className="text-[11px] text-accent hover:underline font-mono"
                >
                  {isEditingSlug ? "Auto-generate from name" : "Edit manually"}
                </button>
              </div>
              <input
                type="text"
                required
                value={formData.slug}
                readOnly={!isEditingSlug}
                onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
                className={`w-full h-11 px-3.5 rounded-md border text-xs font-mono text-ink ${
                  isEditingSlug
                    ? "border-line-strong bg-surface"
                    : "border-line bg-canvas text-ink-muted cursor-not-allowed"
                }`}
              />
            </div>

            {/* Category, Brand, SKU */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Category <span className="text-danger">*</span>
                </label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full h-11 px-3 rounded-md border border-line-strong bg-surface text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  <option value="">Select Category...</option>
                  {categories?.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Brand / Manufacturer
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="e.g. Keychron, Logitech"
                  className="w-full h-11 px-3 rounded-md border border-line-strong bg-surface text-xs text-ink"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  SKU (Stock Keeping Unit)
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="e.g. K2P-RGB-RED"
                  className="w-full h-11 px-3 rounded-md border border-line-strong bg-surface text-xs font-mono text-ink uppercase"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Markdown Description */}
          <div className="bg-surface border border-line rounded-lg p-5 sm:p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-line pb-2">
              <h2 className="font-heading font-bold text-base text-ink">Product Description</h2>
              <div className="flex items-center border border-line rounded-md overflow-hidden text-xs">
                <button
                  type="button"
                  onClick={() => setDescTab("write")}
                  className={`px-3 py-1 flex items-center gap-1 font-medium transition-colors ${
                    descTab === "write"
                      ? "bg-brand text-white"
                      : "bg-surface text-ink hover:bg-canvas"
                  }`}
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Write Markdown</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDescTab("preview")}
                  className={`px-3 py-1 flex items-center gap-1 font-medium transition-colors ${
                    descTab === "preview"
                      ? "bg-brand text-white"
                      : "bg-surface text-ink hover:bg-canvas"
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Live Preview</span>
                </button>
              </div>
            </div>

            {descTab === "write" ? (
              <div>
                <textarea
                  rows={8}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed product features, package contents, compatibility, and key selling points (supports standard Markdown)..."
                  className="w-full p-3 rounded-md border border-line-strong bg-surface text-xs font-sans text-ink leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                />
                <span className="text-[11px] text-ink-subtle">
                  Use markdown headings (###), bullet lists (*), bold (**), and specifications.
                </span>
              </div>
            ) : (
              <div className="p-4 rounded-md border border-line bg-canvas min-h-[200px] text-xs text-ink prose prose-sm max-w-none">
                {formData.description ? (
                  <ReactMarkdown>{formData.description}</ReactMarkdown>
                ) : (
                  <span className="text-ink-subtle italic">No description entered yet.</span>
                )}
              </div>
            )}
          </div>

          {/* Section 3: Technical Specifications */}
          <div className="bg-surface border border-line rounded-lg p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-2">
              <div>
                <h2 className="font-heading font-bold text-base text-ink">
                  Technical Specifications
                </h2>
                <p className="text-[11px] text-ink-muted mt-0.5">
                  Structured specs table displayed on the product detail page.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddSpecRow}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-brand text-white text-xs font-semibold hover:bg-brand-hover"
              >
                <Plus className="w-3 h-3" />
                <span>Add Spec</span>
              </button>
            </div>

            {formData.specs.length === 0 ? (
              <div className="p-6 border border-dashed rounded-md text-center text-xs text-ink-muted">
                No specifications added. Click &ldquo;Add Spec&rdquo; or select a category with spec
                templates.
              </div>
            ) : (
              <div className="space-y-2">
                {formData.specs.map((spec, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={spec.label}
                      onChange={(e) => handleSpecChange(i, "label", e.target.value)}
                      placeholder="Label (e.g. Connectivity)"
                      className="w-1/3 h-11 px-3 rounded-md border border-line-strong bg-surface text-xs text-ink"
                    />
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) => handleSpecChange(i, "value", e.target.value)}
                      placeholder="Value (e.g. Bluetooth 5.1 / USB-C)"
                      className="flex-1 h-11 px-3 rounded-md border border-line-strong bg-surface text-xs text-ink"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSpecRow(i)}
                      className="p-2 text-ink-subtle hover:text-danger rounded"
                      title="Remove row"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pricing, Inventory, Images, Visibility (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Pricing & Sale */}
          <div className="bg-surface border border-line rounded-lg p-5 space-y-4">
            <h2 className="font-heading font-bold text-base text-ink border-b border-line pb-2">
              Pricing (GHS)
            </h2>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Regular Price (GHS) <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-ink-muted">
                  GH₵
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  className="w-full h-11 pl-11 pr-3 rounded-md border border-line-strong bg-surface text-sm font-mono font-bold text-ink"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Sale Price (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-ink-muted">
                  GH₵
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                  placeholder="0.00"
                  className="w-full h-11 pl-11 pr-3 rounded-md border border-line-strong bg-surface text-sm font-mono font-bold text-accent"
                />
              </div>
              <span className="text-[10px] text-ink-subtle mt-1 block">
                Must be lower than regular price to activate sale badge.
              </span>
            </div>
          </div>

          {/* Inventory Physical Stock */}
          <div className="bg-surface border border-line rounded-lg p-5 space-y-4">
            <h2 className="font-heading font-bold text-base text-ink border-b border-line pb-2">
              Inventory & Stock
            </h2>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Physical Units on Hand <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                min={formData.reservedStock || 0}
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                className="w-full h-11 px-3 rounded-md border border-line-strong bg-surface text-sm font-mono font-bold text-ink"
              />
              {formData.reservedStock !== undefined && formData.reservedStock > 0 && (
                <p className="text-[11px] text-warning font-mono mt-1">
                  Note: {formData.reservedStock} units currently held by unpaid orders.
                </p>
              )}
            </div>
          </div>

          {/* Product Photos */}
          <div className="bg-surface border border-line rounded-lg p-5 space-y-4">
            <h2 className="font-heading font-bold text-base text-ink border-b border-line pb-2">
              Product Images
            </h2>

            <ImageUploader
              images={formData.images}
              onChange={(images) => setFormData({ ...formData, images })}
              maxImages={8}
            />
          </div>

          {/* Storefront Visibility & Featured Switch */}
          <div className="bg-surface border border-line rounded-lg p-5 space-y-3">
            <h2 className="font-heading font-bold text-base text-ink border-b border-line pb-2">
              Visibility
            </h2>

            <label className="flex items-center justify-between p-2.5 rounded-md border border-line hover:bg-canvas cursor-pointer transition-colors">
              <div>
                <span className="text-xs font-semibold text-ink block">Active (Published)</span>
                <span className="text-[11px] text-ink-muted block">
                  Visible to shoppers on catalog & search
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-ink rounded focus:ring-focus"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-md border border-line hover:bg-canvas cursor-pointer transition-colors">
              <div>
                <span className="text-xs font-semibold text-ink block">Featured Product</span>
                <span className="text-[11px] text-ink-muted block">
                  Showcase on homepage highlights
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 text-ink rounded focus:ring-focus"
              />
            </label>
          </div>
        </div>
      </div>
    </form>
  );
}
