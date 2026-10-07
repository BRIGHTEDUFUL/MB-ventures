"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { PageEditor } from "@/components/admin/pages/PageEditor";
import { FOCUS_CLASS, type PageValues } from "@/components/admin/pages/types";
import { AlertCircle } from "lucide-react";

function LoadingPanel({ label }: { label: string }) {
  return (
    <div className="bg-surface border border-line rounded-lg p-8 text-center text-xs font-mono text-ink-muted">
      {label}
    </div>
  );
}

function NotFoundPanel() {
  return (
    <div className="p-12 bg-surface border border-line rounded-lg text-center space-y-3 max-w-md mx-auto">
      <AlertCircle className="w-10 h-10 text-danger mx-auto" aria-hidden="true" />
      <h2 className="font-heading font-bold text-lg text-ink">Page not found</h2>
      <p className="text-xs text-ink-muted">
        This page does not exist any more, or it was deleted.
      </p>
      <Link
        href="/admin/pages"
        className={`inline-flex items-center h-11 px-4 rounded-md border border-line bg-surface hover:bg-canvas text-ink text-xs font-semibold transition-colors ${FOCUS_CLASS}`}
      >
        Back to pages
      </Link>
    </div>
  );
}

export default function EditAdminPage() {
  const params = useParams();
  const pageId = params.id as Id<"pages">;

  const pages = useQuery(api.pagesAdmin.list, {});
  const page = pages === undefined ? undefined : pages.pages.find((row) => row._id === pageId);

  const storedBody = useQuery(api.pagesAdmin.get, { pageId });

  const isLoading = pages === undefined || storedBody === undefined;

  let content: ReactNode;
  if (isLoading) {
    content = <LoadingPanel label="Loading page..." />;
  } else if (!page || storedBody === null) {
    content = <NotFoundPanel />;
  } else {
    const initial: PageValues = {
      title: storedBody.title,
      slug: storedBody.slug,
      body: storedBody.body,
      isPublished: storedBody.isPublished,
      showInFooter: storedBody.showInFooter,
      sortOrder: storedBody.sortOrder,
    };
    content = (
      <PageEditor key={storedBody._id} mode="edit" pageId={storedBody._id} initial={initial} />
    );
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title={page ? `Edit: ${page.title}` : "Edit page"}
        description="Change the wording, address and visibility of a content page."
        breadcrumbs={[
          { label: "Pages", href: "/admin/pages" },
          ...(page ? [{ label: page.title }] : []),
        ]}
      />
      {content}
    </div>
  );
}
