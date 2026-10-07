"use client";

import { Filter, Search } from "lucide-react";
import { INPUT_CLASS, SELECT_CLASS, type RoleFilter } from "./types";

interface UsersToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  role: RoleFilter;
  onRoleChange: (value: RoleFilter) => void;
}

export function UsersToolbar({ search, onSearchChange, role, onRoleChange }: UsersToolbarProps) {
  return (
    <div className="bg-surface border border-line rounded-lg p-3.5 flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-3">
      <div className="flex-1 sm:max-w-md space-y-1">
        <label htmlFor="users-search" className="block text-xs font-semibold text-ink">
          Search users
        </label>
        <div className="relative">
          <Search
            className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            id="users-search"
            type="text"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Name or email"
            className={`${INPUT_CLASS} pl-9`}
          />
        </div>
      </div>

      <div className="space-y-1 sm:w-52">
        <label htmlFor="users-role" className="block text-xs font-semibold text-ink">
          Role
        </label>
        <div className="relative">
          <Filter
            className="w-3.5 h-3.5 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <select
            id="users-role"
            value={role}
            onChange={(event) => onRoleChange(event.target.value as RoleFilter)}
            className={`${SELECT_CLASS} w-full pl-8`}
          >
            <option value="all">All roles</option>
            <option value="admin">Admin</option>
            <option value="customer">Customer</option>
          </select>
        </div>
      </div>
    </div>
  );
}
