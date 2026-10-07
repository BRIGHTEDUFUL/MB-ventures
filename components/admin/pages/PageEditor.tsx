"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Switch } from "@/components/ui/switch";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { MarkdownField } from "./MarkdownField";
import {
  DEFAULT_PAGE_VALUES,
  FOCUS_CLASS,
  INPUT_CLASS,
  type PageErrors,
  type PageValues,
} from "./types";
import { validatePage } from "./validation";

type PageEditorProps =
  | { mode: "create" }
  | {
      mode: "edit";
      pageId: Id<"pages">;
      initial: PageValues;
    };

export function PageEditor(props: PageEditorProps) {
  const router = useRouter();
  const createPage = useMutation(api.pagesAdmin.create);
  const updatePage = useMutation(api.pagesAdmin.update);

  const startValues = props.mode === "edit" ? props.initial : DEFAULT_PAGE_VALUES;

  const [values, setValues] = useState<PageValues>(startValues);
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);

  const errors: PageErrors = useMemo(() => validatePage(values), [values]);
  const titleError =
    errors.title && (showErrors || values.title.trim().length > 0) ? errors.title : undefined;
  const slugError =
    errors.slug && (showErrors || values.slug.trim().length > 0) ? errors.slug : undefined;
  const bodyError = errors.body && showErrors ? errors.body : undefined;
  const sortError = errors.sortOrder && showErrors ? errors.sortOrder : undefined;

  function setField<K extends keyof PageValues>(key: K, value: PageValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const found = validatePage(values);
    setShowErrors(true);
    if (Object.keys(found).length > 0) {
      toast.error("Fix the highlighted fields before saving.");
      return;
    }

    const payload = {
      title: values.title.trim(),
      slug: values.slug.trim().toLowerCase(),
      body: values.body,
      isPublished: values.isPublished,
      showInFooter: values.showInFooter,
      sortOrder: values.sortOrder,
    };

    setSaving(true);
    try {
      if (props.mode === "create") {
        await createPage(payload);
        toast.success(`Page "${payload.title}" created.`);
      } else {
        await updatePage({ pageId: props.pageId, ...payload });
        toast.success(`Page "${payload.title}" saved.`);
      }
      router.push("/admin/pages");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save this page.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Review note required by the content workflow; always visible above the editor. */}
      <div className="flex items-start gap-2 rounded-lg border border-line bg-warning-soft px-4 py-3">
        <FileText className="w-4 h-4 shrink-0 mt-0.5 text-warning" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-ink">
          Draft content prepared for your review. This is not legal advice. Replace every
          [bracketed] placeholder before publishing.
        </p>
      </div>

      <div className="bg-surface border border-line rounded-lg p-5 sm:p-6 space-y-4">
        <div>
          <label htmlFor="page-title" className="block text-xs font-semibold text-ink mb-1">
            Title <span className="text-danger">*</span>
          </label>
          <input
            id="page-title"
            type="text"
            value={values.title}
            onChange={(e) => setField("title", e.target.value)}
            aria-invalid={titleError ? true : undefined}
            aria-describedby={titleError ? "page-title-error" : "page-title-help"}
            className={INPUT_CLASS}
          />
          {titleError ? (
            <p id="page-title-error" className="text-[11px] text-danger mt-1">
              {titleError}
            </p>
          ) : (
            <p id="page-title-help" className="text-[11px] text-ink-subtle mt-1">
              Shown as the page heading and on the footer link.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="page-slug" className="block text-xs font-semibold text-ink mb-1">
            Web address (slug) <span className="text-danger">*</span>
          </label>
          <input
            id="page-slug"
            type="text"
            value={values.slug}
            onChange={(e) => setField("slug", e.target.value)}
            autoComplete="off"
            spellCheck={false}
            aria-invalid={slugError ? true : undefined}
            aria-describedby={slugError ? "page-slug-error" : "page-slug-help"}
            className={INPUT_CLASS}
          />
          {slugError ? (
            <p id="page-slug-error" className="text-[11px] text-danger mt-1">
              {slugError}
            </p>
          ) : (
            <p id="page-slug-help" className="text-[11px] text-ink-subtle mt-1">
              Lowercase letters, numbers and hyphens. Customers open this page at /
              {values.slug.trim().toLowerCase() || "your-slug"}.
            </p>
          )}
        </div>

        <MarkdownField
          id="page-body"
          value={values.body}
          onChange={(next) => setField("body", next)}
          error={bodyError}
        />

        <div className="flex items-center justify-between gap-3 border border-line rounded-lg p-4">
          <div className="min-w-0">
            <label htmlFor="page-published" className="block text-xs font-semibold text-ink">
              Published
            </label>
            <p className="text-[11px] text-ink-subtle mt-1 leading-tight">
              Published pages are open to customers. Drafts stay in this admin area.
            </p>
          </div>
          <Switch
            id="page-published"
            checked={values.isPublished}
            onCheckedChange={(checked) => setField("isPublished", checked)}
          />
        </div>

        <div className="flex items-center justify-between gap-3 border border-line rounded-lg p-4">
          <div className="min-w-0">
            <label
              htmlFor="page-footer"
              className={`block text-xs font-semibold ${
                values.isPublished ? "text-ink" : "text-ink-subtle"
              }`}
            >
              Show in footer
            </label>
            <p className="text-[11px] text-ink-subtle mt-1 leading-tight">
              {values.isPublished
                ? "Adds a link to this page in the shop footer."
                : "Publish this page first to show it in the footer."}
            </p>
          </div>
          <Switch
            id="page-footer"
            checked={values.showInFooter}
            disabled={!values.isPublished}
            onCheckedChange={(checked) => setField("showInFooter", checked)}
          />
        </div>

        <div className="flex items-center justify-between gap-3 border border-line rounded-lg p-4">
          <div className="min-w-0">
            <label htmlFor="page-sort" className="block text-xs font-semibold text-ink">
              Sort order
            </label>
            <p className="text-[11px] text-ink-subtle mt-1 leading-tight">
              Lower numbers appear first in the footer. Between 0 and 10000.
            </p>
          </div>
          <div className="w-24 shrink-0">
            <input
              id="page-sort"
              type="number"
              min={0}
              max={10000}
              step={1}
              inputMode="numeric"
              value={values.sortOrder}
              onChange={(e) => setField("sortOrder", Number.parseInt(e.target.value, 10) || 0)}
              aria-invalid={sortError ? true : undefined}
              aria-describedby={sortError ? "page-sort-error" : undefined}
              className={`${INPUT_CLASS} text-center font-mono`}
            />
          </div>
        </div>
        {sortError && (
          <p id="page-sort-error" className="text-[11px] text-danger">
            {sortError}
          </p>
        )}

        <div className="flex items-center justify-end gap-2.5 border-t border-line pt-4">
          <button
            type="button"
            onClick={() => router.push("/admin/pages")}
            className={`h-11 px-4 rounded-md border border-line bg-surface hover:bg-canvas text-ink text-xs font-semibold transition-colors ${FOCUS_CLASS}`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className={`h-11 px-5 rounded-md bg-brand text-white text-xs font-semibold hover:bg-brand-hover transition-colors disabled:opacity-50 ${FOCUS_CLASS}`}
          >
            {saving ? "Saving..." : props.mode === "create" ? "Create page" : "Save changes"}
          </button>
        </div>
      </div>
    </form>
  );
}
