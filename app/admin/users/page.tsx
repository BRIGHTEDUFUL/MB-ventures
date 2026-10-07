"use client";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { UsersList } from "@/components/admin/users/UsersList";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <AdminHeader
        title="Users"
        description="Search accounts, check what customers have spent, and manage admin access."
      />
      <UsersList />
    </div>
  );
}
