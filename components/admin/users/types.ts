export type UserRole = "admin" | "customer";

export type RoleFilter = "all" | UserRole;

/** Rows per page on /admin/users (adminList default limit). */
export const PAGE_SIZE = 20;

/** Helper text shown next to the disabled role control on your own account. */
export const SELF_HELPER_TEXT = "You cannot change your own role.";

export const FOCUS_CLASS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus";

export const INPUT_CLASS = `w-full h-11 px-3 rounded-md border border-line-strong bg-surface text-xs text-ink ${FOCUS_CLASS}`;

export const SELECT_CLASS = `h-11 px-3 rounded-md border border-line-strong bg-surface text-xs text-ink ${FOCUS_CLASS}`;

/** Short date used on the user list and detail pages. */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-GH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
