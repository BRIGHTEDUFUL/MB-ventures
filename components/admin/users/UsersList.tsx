"use client";

import { useEffect, useState } from "react";
import { UsersTable } from "./UsersTable";
import { UsersToolbar } from "./UsersToolbar";
import { type RoleFilter, type UserRole } from "./types";

const SEARCH_DEBOUNCE_MS = 300;

export function UsersList() {
  const [searchInput, setSearchInput] = useState("");
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [offset, setOffset] = useState(0);

  // Debounce the search term and jump back to the first page.
  useEffect(() => {
    const timer = setTimeout(() => {
      setQ(searchInput.trim());
      setOffset(0);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleRoleChange = (value: RoleFilter) => {
    setRoleFilter(value);
    setOffset(0);
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setQ("");
    setRoleFilter("all");
    setOffset(0);
  };

  const role: UserRole | undefined = roleFilter === "all" ? undefined : roleFilter;

  return (
    <div className="space-y-6">
      <UsersToolbar
        search={searchInput}
        onSearchChange={setSearchInput}
        role={roleFilter}
        onRoleChange={handleRoleChange}
      />
      <UsersTable
        q={q || undefined}
        role={role}
        offset={offset}
        onOffsetChange={setOffset}
        hasFilters={q !== "" || roleFilter !== "all"}
        onClearFilters={handleClearFilters}
      />
    </div>
  );
}
