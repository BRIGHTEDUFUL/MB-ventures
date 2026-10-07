"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ProductForm, type ProductFormData } from "@/components/admin/ProductForm";
import { fromMinor } from "@/lib/money";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as Id<"products">;

  const product = useQuery(api.productsAdmin.get, { id: productId });
  const updateProduct = useMutation(api.productsAdmin.update);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (product === undefined) {
    return (
      <div className="space-y-6 animate-pulse max-w-5xl mx-auto">
        <div className="h-11 bg-surface rounded w-1/3" />
        <div className="h-96 bg-surface rounded-lg" />
      </div>
    );
  }

  if (product === null) {
    return (
      <div className="p-12 bg-surface border border-line rounded-lg text-center space-y-3 max-w-md mx-auto">
        <AlertCircle className="w-10 h-10 text-danger mx-auto" />
        <h2 className="font-heading font-bold text-lg text-ink">Product Not Found</h2>
        <p className="text-xs text-ink-muted">
          The requested product does not exist or was deleted.
        </p>
      </div>
    );
  }

  const initialFormData: ProductFormData = {
    id: product._id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    categoryId: product.categoryId,
    brand: product.brand || "",
    sku: product.sku || "",
    price: fromMinor(product.price).toFixed(2),
    salePrice: product.salePrice ? fromMinor(product.salePrice).toFixed(2) : "",
    stock: product.stock,
    reservedStock: product.reservedStock,
    images: product.images.map((img) => ({
      storageId: img.storageId,
      url: img.url,
    })),
    specs: product.specs,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
  };

  const handleSubmit = async (data: {
    id?: Id<"products">;
    name: string;
    slug: string;
    description: string;
    categoryId: Id<"categories">;
    brand?: string;
    sku?: string;
    price: number;
    salePrice?: number;
    stock: number;
    imageIds: Id<"_storage">[];
    specs: Array<{ group?: string; label: string; value: string }>;
    isActive: boolean;
    isFeatured: boolean;
  }) => {
    if (!data.id) return;
    setIsSubmitting(true);
    try {
      await updateProduct({
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        categoryId: data.categoryId,
        brand: data.brand,
        sku: data.sku,
        price: data.price,
        salePrice: data.salePrice,
        stock: data.stock,
        imageIds: data.imageIds,
        specs: data.specs,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
      });
      toast.success(`Product "${data.name}" updated successfully.`);
      router.push("/admin/products");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update product.";
      toast.error(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title={`Edit: ${product.name}`}
        description="Update pricing, physical inventory stock, specifications, and marketing images."
        breadcrumbs={[{ label: "Products", href: "/admin/products" }, { label: product.name }]}
      />

      <ProductForm
        initialData={initialFormData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
