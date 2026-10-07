"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { slugify } from "@/lib/slug";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Layers, FolderTree, CornerDownRight, X } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

interface CategoryFormState {
  id?: Id<"categories">;
  name: string;
  slug: string;
  parentId?: Id<"categories">;
  description: string;
  sortOrder: number;
  isActive: boolean;
  specTemplate: string[];
}

const DEFAULT_FORM: CategoryFormState = {
  name: "",
  slug: "",
  description: "",
  sortOrder: 1,
  isActive: true,
  specTemplate: [],
};

export default function AdminCategoriesPage() {
  const categories = useQuery(api.categoriesAdmin.list, {});
  const createCategory = useMutation(api.categoriesAdmin.create);
  const updateCategory = useMutation(api.categoriesAdmin.update);
  const deleteCategory = useMutation(api.categoriesAdmin.remove);
  const toggleActive = useMutation(api.categoriesAdmin.toggleActive);

  // Dialog states
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<CategoryFormState>(DEFAULT_FORM);
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [newSpecLabel, setNewSpecLabel] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{
    id: Id<"categories">;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const topLevelCategories = categories?.filter((c) => !c.parentId) || [];

  const handleOpenCreate = () => {
    setFormData({
      ...DEFAULT_FORM,
      sortOrder: (categories?.length || 0) + 1,
    });
    setIsEditingSlug(false);
    setNewSpecLabel("");
    setModalOpen(true);
  };

  // Row shape returned by categoriesAdmin.list — inferred so edits stay type-safe
  type CategoryRow = NonNullable<typeof categories>[number];

  const handleOpenEdit = (cat: CategoryRow) => {
    setFormData({
      id: cat._id,
      name: cat.name,
      slug: cat.slug,
      parentId: cat.parentId,
      description: cat.description || "",
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
      specTemplate: cat.specTemplate || [],
    });
    setIsEditingSlug(true);
    setNewSpecLabel("");
    setModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: isEditingSlug ? prev.slug : slugify(val),
    }));
  };

  const handleAddSpecTemplate = () => {
    const trimmed = newSpecLabel.trim();
    if (!trimmed) return;
    if (formData.specTemplate.includes(trimmed)) {
      toast.info("Spec template already contains this label.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      specTemplate: [...prev.specTemplate, trimmed],
    }));
    setNewSpecLabel("");
  };

  const handleRemoveSpecTemplate = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      specTemplate: prev.specTemplate.filter((_, i) => i !== index),
    }));
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Please enter a category name.");
      return;
    }
    if (!formData.slug.trim()) {
      toast.error("Please enter a category URL slug.");
      return;
    }

    setIsSaving(true);
    try {
      if (formData.id) {
        await updateCategory({
          id: formData.id,
          name: formData.name,
          slug: formData.slug,
          parentId: formData.parentId,
          description: formData.description || undefined,
          sortOrder: formData.sortOrder,
          isActive: formData.isActive,
          specTemplate: formData.specTemplate,
        });
        toast.success(`Category "${formData.name}" updated successfully.`);
      } else {
        await createCategory({
          name: formData.name,
          slug: formData.slug,
          parentId: formData.parentId,
          description: formData.description || undefined,
          sortOrder: formData.sortOrder,
          isActive: formData.isActive,
          specTemplate: formData.specTemplate,
        });
        toast.success(`Category "${formData.name}" created successfully.`);
      }
      setModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save category";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    try {
      await deleteCategory({ id: categoryToDelete.id });
      toast.success(`Category "${categoryToDelete.name}" deleted.`);
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete category";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Categories"
        description="Organize your shop catalog into top-level departments and subcategories with spec templates."
        actions={
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-brand text-white text-xs font-semibold hover:bg-brand-hover transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Category</span>
          </button>
        }
      />

      {/* Categories Tree Table */}
      <div className="bg-surface border border-line rounded-lg overflow-hidden">
        {categories === undefined ? (
          <div className="p-8 text-center text-xs font-mono text-ink-muted">
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Layers className="w-10 h-10 text-ink-muted mx-auto stroke-[1.25]" />
            <h3 className="font-heading font-semibold text-sm text-ink">
              No categories created yet
            </h3>
            <p className="text-xs text-ink-muted max-w-sm mx-auto">
              Create your first product category to organize your catalog.
            </p>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-brand text-white text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Category</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas border-b border-line text-ink-muted font-mono uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Name & Hierarchy</th>
                  <th className="py-3 px-4">URL Slug</th>
                  <th className="py-3 px-4">Products</th>
                  <th className="py-3 px-4">Spec Templates</th>
                  <th className="py-3 px-4">Sort</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {/* Render Parents with indented children */}
                {topLevelCategories.map((parent) => {
                  const children = categories.filter((c) => c.parentId === parent._id);

                  return (
                    <React.Fragment key={parent._id}>
                      {/* Parent Row */}
                      <tr className="hover:bg-canvas/50 transition-colors bg-surface font-medium">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <FolderTree className="w-4 h-4 text-ink shrink-0" />
                            <span className="font-heading font-bold text-sm text-ink">
                              {parent.name}
                            </span>
                          </div>
                          {parent.description && (
                            <p className="text-[11px] text-ink-muted pl-6 truncate max-w-md">
                              {parent.description}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-ink-muted">
                          /category/{parent.slug}
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          <span className="font-bold text-ink">{parent.activeProducts}</span>
                          <span className="text-ink-muted"> / {parent.totalProducts}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          {parent.specTemplate.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {parent.specTemplate.map((s, i) => (
                                <span
                                  key={i}
                                  className="px-1.5 py-0.5 bg-canvas rounded text-[10px] text-ink-muted font-mono"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-ink-subtle text-[11px]">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-ink-muted">{parent.sortOrder}</td>
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() =>
                              toggleActive({ id: parent._id, isActive: !parent.isActive })
                            }
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                              parent.isActive
                                ? "bg-success-soft text-success"
                                : "bg-canvas-strong text-ink-subtle"
                            }`}
                          >
                            {parent.isActive ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(parent)}
                              className="p-1.5 rounded hover:bg-canvas text-ink-muted hover:text-ink transition-colors"
                              title="Edit category"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setCategoryToDelete({ id: parent._id, name: parent.name });
                                setDeleteDialogOpen(true);
                              }}
                              className="p-1.5 rounded hover:bg-danger-soft text-ink-muted hover:text-danger transition-colors"
                              title="Delete category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Child Subcategories */}
                      {children.map((child) => (
                        <tr
                          key={child._id}
                          className="hover:bg-canvas/40 transition-colors bg-canvas/20"
                        >
                          <td className="py-3 px-4 pl-10">
                            <div className="flex items-center gap-2">
                              <CornerDownRight className="w-3.5 h-3.5 text-ink-subtle shrink-0" />
                              <span className="font-medium text-ink">{child.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-ink-muted">
                            /category/{child.slug}
                          </td>
                          <td className="py-3 px-4 font-mono">
                            <span className="font-bold text-ink">{child.activeProducts}</span>
                            <span className="text-ink-muted"> / {child.totalProducts}</span>
                          </td>
                          <td className="py-3 px-4">
                            {child.specTemplate.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {child.specTemplate.map((s, i) => (
                                  <span
                                    key={i}
                                    className="px-1.5 py-0.5 bg-canvas border border-line rounded text-[10px] text-ink font-mono"
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-ink-subtle text-[11px]">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono text-ink-muted">{child.sortOrder}</td>
                          <td className="py-3 px-4">
                            <button
                              type="button"
                              onClick={() =>
                                toggleActive({ id: child._id, isActive: !child.isActive })
                              }
                              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                                child.isActive
                                  ? "bg-success-soft text-success"
                                  : "bg-canvas-strong text-ink-subtle"
                              }`}
                            >
                              {child.isActive ? "Active" : "Inactive"}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(child)}
                                className="p-1.5 rounded hover:bg-canvas text-ink-muted hover:text-ink transition-colors"
                                title="Edit subcategory"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setCategoryToDelete({ id: child._id, name: child.name });
                                  setDeleteDialogOpen(true);
                                }}
                                className="p-1.5 rounded hover:bg-danger-soft text-ink-muted hover:text-danger transition-colors"
                                title="Delete subcategory"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Category Modal Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg bg-surface border-line p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b border-line pb-3">
            <DialogTitle className="font-heading font-bold text-lg text-ink">
              {formData.id ? "Edit Category" : "Create New Category"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveCategory} className="space-y-4 pt-3">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Category Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Ergonomic Chairs"
                className="w-full h-11 px-3 rounded-md border border-line-strong bg-surface text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
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
                className={`w-full h-11 px-3 rounded-md border text-xs font-mono text-ink ${
                  isEditingSlug
                    ? "border-line-strong bg-surface"
                    : "border-line bg-canvas text-ink-muted cursor-not-allowed"
                }`}
              />
            </div>

            {/* Parent Category */}
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Parent Category (Optional)
              </label>
              <select
                value={formData.parentId || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parentId: e.target.value ? (e.target.value as Id<"categories">) : undefined,
                  })
                }
                className="w-full h-11 px-3 rounded-md border border-line-strong bg-surface text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                <option value="">None (Top-Level Category)</option>
                {topLevelCategories
                  .filter((c) => c._id !== formData.id)
                  .map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Description (SEO) */}
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                SEO Description (Optional)
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Meta description for search engines..."
                className="w-full p-2.5 rounded-md border border-line-strong bg-surface text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              />
            </div>

            {/* Spec Templates Editor */}
            <div className="space-y-2 border-t border-line pt-3">
              <label className="block text-xs font-semibold text-ink">Spec Template Labels</label>
              <p className="text-[11px] text-ink-muted">
                These spec labels will automatically pre-fill when adding products to this category.
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newSpecLabel}
                  onChange={(e) => setNewSpecLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSpecTemplate();
                    }
                  }}
                  placeholder="e.g. Switch Type, Material, Battery Life..."
                  className="flex-1 h-11 px-3 rounded-md border border-line-strong bg-surface text-xs text-ink"
                />
                <button
                  type="button"
                  onClick={handleAddSpecTemplate}
                  className="h-11 px-3 rounded-md bg-brand text-white text-xs font-semibold hover:bg-brand-hover flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Spec</span>
                </button>
              </div>

              {formData.specTemplate.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {formData.specTemplate.map((spec, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-canvas border border-line text-xs font-mono text-ink"
                    >
                      <span>{spec}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecTemplate(i)}
                        className="text-ink-subtle hover:text-danger ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Sort Order & Active Switch */}
            <div className="grid grid-cols-2 gap-4 border-t border-line pt-3">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Sort Order</label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 1 })
                  }
                  className="w-full h-11 px-3 rounded-md border border-line-strong bg-surface text-xs text-ink font-mono"
                />
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 cursor-pointer pb-2.5">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-ink rounded focus:ring-focus"
                  />
                  <span className="text-xs font-semibold text-ink">Active on Storefront</span>
                </label>
              </div>
            </div>

            <DialogFooter className="border-t border-line pt-4 flex flex-row items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="h-11 px-4 rounded-md border border-line text-xs font-semibold text-ink hover:bg-canvas"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="h-11 px-5 rounded-md bg-brand text-white text-xs font-semibold hover:bg-brand-hover disabled:opacity-50"
              >
                {isSaving ? "Saving..." : formData.id ? "Update Category" : "Create Category"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={`Delete Category "${categoryToDelete?.name}"?`}
        description="Are you sure you want to delete this category? This action is permanent. Deletion will be blocked if products or subcategories belong to this category."
        confirmLabel="Delete Category"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
