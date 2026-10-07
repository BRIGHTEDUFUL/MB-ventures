"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ProductForm } from "@/components/admin/ProductForm";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";

export default function NewProductPage() {
  const router = useRouter();
  const createProduct = useMutation(api.productsAdmin.create);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: {
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
    setIsSubmitting(true);
    try {
      await createProduct(data);
      toast.success(`Product "${data.name}" created successfully.`);
      router.push("/admin/products");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create product.";
      toast.error(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Create Product"
        description="Add a new item to your shop catalog with photos, pricing, inventory stock, and specifications."
        breadcrumbs={[{ label: "Products", href: "/admin/products" }, { label: "New Product" }]}
      />

      <ProductForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
