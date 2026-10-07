"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { toast } from "sonner";
import { FOCUS_CLASS, SELF_HELPER_TEXT, type UserRole } from "./types";
import type { Id } from "@/convex/_generated/dataModel";

interface RoleControlProps {
  userId: Id<"users">;
  /** Current display name; "" for anonymised accounts. */
  name: string;
  role: UserRole;
  isSelf: boolean;
  /** "end" right-aligns the control and its helper text inside a table cell. */
  align?: "start" | "end";
}

export function RoleControl({ userId, name, role, isSelf, align = "start" }: RoleControlProps) {
  const updateRole = useMutation(api.usersAdmin.adminUpdateRole);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const displayName = name || "this user";
  const promoting = role === "customer";
  const nextRole: UserRole = promoting ? "admin" : "customer";

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await updateRole({ userId, role: nextRole });
      toast.success(
        promoting ? `${displayName} is now an admin.` : `${displayName} is now a customer.`
      );
      setOpen(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to change this role.");
    } finally {
      setSaving(false);
    }
  };

  if (isSelf) {
    return (
      <div
        className={`flex flex-col gap-1 ${
          align === "end" ? "items-end text-right" : "items-start text-left"
        }`}
      >
        <button
          type="button"
          disabled
          aria-describedby="self-role-helper"
          className={`h-11 px-4 rounded-md border border-line bg-canvas text-xs font-semibold text-ink-subtle cursor-not-allowed ${FOCUS_CLASS}`}
        >
          Change role
        </button>
        <span id="self-role-helper" className="text-[11px] text-ink-muted">
          {SELF_HELPER_TEXT}
        </span>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`h-11 px-4 rounded-md border border-line-strong bg-surface text-xs font-semibold text-ink hover:bg-canvas transition-colors ${FOCUS_CLASS}`}
      >
        Change role
      </button>

      <ConfirmDialog
        open={open}
        onOpenChange={(next) => {
          if (!next && !saving) setOpen(false);
        }}
        title={promoting ? `Make ${displayName} an admin?` : `Change ${displayName} to customer?`}
        description={
          promoting
            ? `${displayName} will be able to manage products, orders, inventory, pages, messages and settings.`
            : `${displayName} will lose access to the admin area right away. Their account, addresses and orders stay as they are.`
        }
        confirmLabel={promoting ? "Make admin" : "Change to customer"}
        variant={promoting ? "default" : "danger"}
        isLoading={saving}
        onConfirm={handleConfirm}
      />
    </>
  );
}
