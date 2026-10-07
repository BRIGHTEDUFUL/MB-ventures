"use client";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { PageEditor } from "@/components/admin/pages/PageEditor";

export default function NewPagePage() {
  return (
    <div className="space-y-6">
      <AdminHeader
        title="New page"
        description="Write a page customers can open from the footer or a direct link."
        breadcrumbs={[{ label: "Pages", href: "/admin/pages" }, { label: "New page" }]}
      />
      <PageEditor mode="create" />
    </div>
  );
}
