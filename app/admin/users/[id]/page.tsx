"use client";

import { useParams } from "next/navigation";
import { UserDetail } from "@/components/admin/users/UserDetail";
import { UserQueryBoundary } from "@/components/admin/users/UserQueryBoundary";
import type { Id } from "@/convex/_generated/dataModel";

export default function AdminUserDetailPage() {
  const params = useParams();
  const userId = params.id as Id<"users">;

  return (
    <UserQueryBoundary>
      <UserDetail userId={userId} />
    </UserQueryBoundary>
  );
}
