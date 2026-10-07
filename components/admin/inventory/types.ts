import type { Id } from "@/convex/_generated/dataModel";

export type TabValue = "products" | "movements";

export type ProductFilter = "all" | "low" | "out" | "inactive";

export type SortValue = "available_asc" | "available_desc" | "name_asc" | "stock_desc";

export type AdjustMode = "set" | "add";

/** Reasons an admin can pick when adjusting stock by hand. */
export type AdjustReason = "manual" | "restock" | "correction" | "damage_loss";

/** Every reason the backend can write to stockAdjustments. */
export type StockAdjustmentReason =
  | "sale"
  | "reservation_release"
  | "manual"
  | "restock"
  | "cancel_restock"
  | "damage_loss"
  | "import"
  | "correction";

export interface HistoryTarget {
  id: Id<"products">;
  name: string;
}

export interface InventoryExportRow {
  _id: Id<"products">;
  name: string;
  sku: string;
  categoryName: string;
  brand: string;
  price: number;
  salePrice?: number;
  stock: number;
  reserved: number;
  available: number;
  isActive: boolean;
}

export const PRODUCT_PAGE_SIZE = 50;
export const MOVEMENT_PAGE_SIZE = 30;
export const HISTORY_PAGE_SIZE = 20;
export const MAX_NOTE_LENGTH = 500;

export const FILTER_OPTIONS: Array<{ value: ProductFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "low", label: "Low stock" },
  { value: "out", label: "Out of stock" },
  { value: "inactive", label: "Inactive" },
];

export const SORT_OPTIONS: Array<{ value: SortValue; label: string }> = [
  { value: "available_asc", label: "Available (low first)" },
  { value: "available_desc", label: "Available (high first)" },
  { value: "name_asc", label: "Name (A-Z)" },
  { value: "stock_desc", label: "Stock (high first)" },
];

export const ADJUST_REASON_OPTIONS: Array<{ value: AdjustReason; label: string }> = [
  { value: "restock", label: "Restock" },
  { value: "correction", label: "Correction" },
  { value: "damage_loss", label: "Damage or loss" },
  { value: "manual", label: "Manual" },
];

export const REASON_OPTIONS: Array<{ value: StockAdjustmentReason | "all"; label: string }> = [
  { value: "all", label: "All reasons" },
  { value: "sale", label: "Sale" },
  { value: "reservation_release", label: "Reservation released" },
  { value: "cancel_restock", label: "Cancelled order restock" },
  { value: "restock", label: "Restock" },
  { value: "damage_loss", label: "Damage or loss" },
  { value: "correction", label: "Correction" },
  { value: "manual", label: "Manual" },
  { value: "import", label: "Import" },
];

export const REASON_LABELS: Record<StockAdjustmentReason, string> = {
  sale: "Sale",
  reservation_release: "Reservation released",
  manual: "Manual",
  restock: "Restock",
  cancel_restock: "Cancelled order restock",
  damage_loss: "Damage or loss",
  import: "Import",
  correction: "Correction",
};

/** e.g. "12 Oct 2026" with the time underneath, matching the orders table. */
export function formatMovementDate(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.toLocaleDateString("en-GH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })} · ${date.toLocaleTimeString("en-GH", { hour: "2-digit", minute: "2-digit" })}`;
}

/** Signed unit count so the direction is readable without colour. */
export function formatDelta(delta: number): string {
  return delta > 0 ? `+${delta}` : String(delta);
}

export const FOCUS_CLASS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus";

export const CONTROL_CLASS = `h-11 px-3 rounded-md border border-line-strong bg-surface text-xs text-ink ${FOCUS_CLASS}`;

export const INPUT_CLASS = `w-full h-11 px-3 rounded-md border border-line-strong bg-surface text-xs text-ink ${FOCUS_CLASS}`;

export const TEXTAREA_CLASS = `w-full p-2.5 rounded-md border border-line-strong bg-surface text-xs text-ink ${FOCUS_CLASS}`;

export const BUTTON_PRIMARY = `h-11 px-4 rounded-md bg-brand text-white text-xs font-semibold hover:bg-brand-hover transition-colors ${FOCUS_CLASS}`;

export const BUTTON_SECONDARY = `h-11 px-4 rounded-md border border-line-strong bg-surface text-xs font-semibold text-ink hover:bg-canvas transition-colors ${FOCUS_CLASS}`;
