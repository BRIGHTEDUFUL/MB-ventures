import type { Id } from "@/convex/_generated/dataModel";

export type TabValue = "zones" | "locations";

export interface ZoneFormState {
  id?: Id<"deliveryZones">;
  name: string;
  fee: string; // major units, converted with toMinor() on save
  estimatedDays: string;
  sortOrder: number;
  isActive: boolean;
}

export interface LocationFormState {
  id?: Id<"pickupLocations">;
  name: string;
  address: string;
  phone: string;
  openingHours: string;
  sortOrder: number;
  isActive: boolean;
}

export type DeleteTarget =
  | { kind: "zone"; id: Id<"deliveryZones">; name: string }
  | { kind: "location"; id: Id<"pickupLocations">; name: string };

export const DEFAULT_ZONE_FORM: ZoneFormState = {
  name: "",
  fee: "",
  estimatedDays: "",
  sortOrder: 1,
  isActive: true,
};

export const DEFAULT_LOCATION_FORM: LocationFormState = {
  name: "",
  address: "",
  phone: "",
  openingHours: "",
  sortOrder: 1,
  isActive: true,
};

/**
 * Moves a row past its neighbour and persists the new order.
 * Rows sharing a sortOrder fall back to name ordering, so in that rare case the
 * whole list is renumbered by position to make the swap stick.
 */
export async function reorderRows<T extends { sortOrder: number }>(
  rows: T[],
  index: number,
  direction: -1 | 1,
  persist: (row: T, sortOrder: number) => Promise<void>
): Promise<void> {
  const target = index + direction;
  if (target < 0 || target >= rows.length) return;

  const moved = rows[index];
  const neighbour = rows[target];

  if (moved.sortOrder !== neighbour.sortOrder) {
    await persist(moved, neighbour.sortOrder);
    await persist(neighbour, moved.sortOrder);
    return;
  }

  const reordered = [...rows];
  reordered[index] = neighbour;
  reordered[target] = moved;
  for (let i = 0; i < reordered.length; i++) {
    if (reordered[i].sortOrder !== i + 1) {
      await persist(reordered[i], i + 1);
    }
  }
}

export const INPUT_CLASS =
  "w-full h-11 px-3 rounded-md border border-line-strong bg-surface text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus";
export const TEXTAREA_CLASS =
  "w-full p-2.5 rounded-md border border-line-strong bg-surface text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus";
export const FOCUS_CLASS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus";
