"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Price } from "@/components/shared/Price";
import { Users as UsersIcon } from "lucide-react";
import { RoleBadge } from "./RoleBadge";
import { RoleControl } from "./RoleControl";
import { FOCUS_CLASS, PAGE_SIZE, formatDate, type UserRole } from "./types";
import type { Id } from "@/convex/_generated/dataModel";

interface UsersTableProps {
  /** Debounced search term from the toolbar. */
  q?: string;
  role?: UserRole;
  offset: number;
  onOffsetChange: (offset: number) => void;
  hasFilters: boolean;
  onClearFilters: () => void;
}

export function UsersTable({
  q,
  role,
  offset,
  onOffsetChange,
  hasFilters,
  onClearFilters,
}: UsersTableProps) {
  const router = useRouter();
  const currentUser = useQuery(api.users.currentUser, {});
  const users = useQuery(api.usersAdmin.adminList, { q, role, offset, limit: PAGE_SIZE });

  const openUser = (userId: Id<"users">) => {
    router.push(`/admin/users/${userId}`);
  };

  // The name cell is a real link; clicks on it (or on a row button) are left alone.
  const handleRowClick = (event: MouseEvent<HTMLTableRowElement>, userId: Id<"users">) => {
    const target = event.target;
    if (target instanceof Element && (target.closest("a") || target.closest("button"))) return;
    openUser(userId);
  };

  const pagerButtonClass = `h-11 px-4 rounded-md border border-line-strong bg-surface text-xs font-semibold text-ink hover:bg-canvas transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${FOCUS_CLASS}`;

  if (users === undefined) {
    return (
      <div className="bg-surface border border-line rounded-lg p-8 text-center text-xs font-mono text-ink-muted">
        Loading users...
      </div>
    );
  }

  if (users.items.length === 0) {
    return (
      <div className="bg-surface border border-line rounded-lg p-12 text-center space-y-3">
        <UsersIcon className="w-10 h-10 text-ink-muted mx-auto stroke-[1.25]" aria-hidden="true" />
        <h3 className="font-heading font-semibold text-sm text-ink">
          {hasFilters ? "No users match your search" : "No users yet"}
        </h3>
        <p className="text-xs text-ink-muted max-w-sm mx-auto">
          {hasFilters
            ? "Try a different name or email, or change the role filter."
            : "Customer accounts appear here once they sign in."}
        </p>
        {hasFilters && (
          <button type="button" onClick={onClearFilters} className={pagerButtonClass}>
            Clear filters
          </button>
        )}
      </div>
    );
  }

  const rangeStart = offset + 1;
  const rangeEnd = offset + users.items.length;

  return (
    <div className="bg-surface border border-line rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[54rem] text-left text-xs">
          <caption className="sr-only">User accounts, newest first</caption>
          <thead className="bg-canvas border-b border-line text-ink-muted font-mono uppercase tracking-wider">
            <tr>
              <th scope="col" className="py-3 px-4">
                Name
              </th>
              <th scope="col" className="py-3 px-4">
                Email
              </th>
              <th scope="col" className="py-3 px-4">
                Role
              </th>
              <th scope="col" className="py-3 px-4">
                Orders
              </th>
              <th scope="col" className="py-3 px-4">
                Total spent
              </th>
              <th scope="col" className="py-3 px-4">
                Joined
              </th>
              <th scope="col" className="py-3 px-4 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.items.map((user) => {
              const isSelf = currentUser?._id === user._id;
              return (
                <tr
                  key={user._id}
                  onClick={(event) => handleRowClick(event, user._id)}
                  className="hover:bg-canvas/50 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-4">
                    <Link
                      href={`/admin/users/${user._id}`}
                      className="font-heading font-bold text-sm text-ink hover:text-focus hover:underline"
                    >
                      {user.name || "Unnamed user"}
                    </Link>
                    {isSelf && <span className="block text-[11px] text-ink-muted mt-0.5">You</span>}
                  </td>
                  <td className="py-3.5 px-4 text-ink-muted">
                    <span className="block truncate max-w-[15rem]">
                      {user.email || "Not provided"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-ink">{user.orderCount}</td>
                  <td className="py-3.5 px-4">
                    <Price amount={user.totalSpent} className="font-semibold" />
                  </td>
                  <td className="py-3.5 px-4 text-ink-muted font-mono text-[11px] whitespace-nowrap">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <RoleControl
                      userId={user._id}
                      name={user.name}
                      role={user.role}
                      isSelf={isSelf}
                      align="end"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-line px-4 py-3">
        <p className="text-[11px] font-mono text-ink-muted">
          Showing {rangeStart}-{rangeEnd} of {users.total} users
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOffsetChange(Math.max(0, offset - PAGE_SIZE))}
            disabled={offset === 0}
            className={pagerButtonClass}
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => onOffsetChange(offset + PAGE_SIZE)}
            disabled={!users.hasMore}
            className={pagerButtonClass}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
