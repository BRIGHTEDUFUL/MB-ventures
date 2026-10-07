"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { FOCUS_CLASS } from "@/components/admin/pages/types";
import { Badge } from "@/components/ui/badge";
import { Edit2, FileText, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminPagesPage() {
  const pages = useQuery(api.pagesAdmin.list, {});
  const removePage = useMutation(api.pagesAdmin.remove);

  const [deleteTarget, setDeleteTarget] = useState<{ id: Id<"pages">; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await removePage({ pageId: deleteTarget.id });
      toast.success(`Page "${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete this page.");
    } finally {
      setDeleting(false);
    }
  };

  const newPageButton = (
    <Link
      href="/admin/pages/new"
      className={`inline-flex items-center gap-1.5 h-11 px-5 rounded-md bg-brand text-white text-xs font-semibold hover:bg-brand-hover transition-colors ${FOCUS_CLASS}`}
    >
      <Plus className="w-3.5 h-3.5" aria-hidden="true" />
      <span>New page</span>
    </Link>
  );

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Pages"
        description="Write and manage the static pages customers read, such as delivery, warranty, terms and privacy."
        actions={newPageButton}
      />

      <div className="bg-surface border border-line rounded-lg overflow-hidden">
        {pages === undefined ? (
          <div className="p-8 text-center text-xs font-mono text-ink-muted">Loading pages...</div>
        ) : pages.pages.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText
              className="w-10 h-10 text-ink-muted mx-auto stroke-[1.25]"
              aria-hidden="true"
            />
            <h3 className="font-heading font-semibold text-sm text-ink">No pages yet</h3>
            <p className="text-xs text-ink-muted max-w-sm mx-auto">
              Create a page such as About us, Warranty or Terms and conditions, then link it from
              the footer.
            </p>
            {newPageButton}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[52rem] text-left text-xs">
              <thead className="bg-canvas border-b border-line text-ink-muted font-mono uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Published</th>
                  <th className="py-3 px-4">In footer</th>
                  <th className="py-3 px-4">Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {pages.pages.map((page) => (
                  <tr key={page._id} className="hover:bg-canvas/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/admin/pages/${page._id}`}
                        className="font-heading font-bold text-sm text-ink hover:underline"
                      >
                        {page.title}
                      </Link>
                      <span className="block text-[11px] font-mono text-ink-muted mt-0.5">
                        {page.bodyLength} characters
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-ink-muted whitespace-nowrap">
                      /{page.slug}
                    </td>
                    <td className="py-3.5 px-4">
                      {page.isPublished ? (
                        <Badge variant="success" className="font-semibold text-[11px]">
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="font-semibold text-[11px]">
                          Draft
                        </Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-ink-muted">
                      {page.showInFooter ? "Yes" : "No"}
                    </td>
                    <td className="py-3.5 px-4 text-ink-muted font-mono text-[11px] whitespace-nowrap">
                      {new Date(page.updatedAt).toLocaleDateString("en-GH", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/pages/${page._id}`}
                          aria-label={`Edit page ${page.title}`}
                          title="Edit page"
                          className={`w-11 h-11 inline-flex items-center justify-center rounded hover:bg-canvas text-ink-muted hover:text-ink transition-colors ${FOCUS_CLASS}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget({ id: page._id, title: page.title })}
                          aria-label={`Delete page ${page.title}`}
                          title="Delete page"
                          className={`w-11 h-11 inline-flex items-center justify-center rounded hover:bg-danger-soft text-ink-muted hover:text-danger transition-colors ${FOCUS_CLASS}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
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

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null);
        }}
        title={deleteTarget ? `Delete page "${deleteTarget.title}"?` : ""}
        description="Customers will no longer be able to open this page and the footer link stops working. This action is permanent."
        confirmLabel="Delete page"
        variant="danger"
        isLoading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
