import { fromMinor } from "@/lib/money";
import type { InventoryExportRow } from "./types";

const HEADERS = [
  "Name",
  "SKU",
  "Category",
  "Brand",
  "Price",
  "Sale price",
  "Stock",
  "Reserved",
  "Available",
  "Status",
];

/** Wraps a cell in quotes when it holds a comma, quote or line break. */
function escapeCell(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function money(minor: number): string {
  return fromMinor(minor).toFixed(2);
}

/** Builds the inventory export as CSV text with a UTF-8 BOM. */
export function buildInventoryCsv(rows: InventoryExportRow[]): string {
  const lines = [HEADERS.map(escapeCell).join(",")];

  for (const row of rows) {
    lines.push(
      [
        row.name,
        row.sku,
        row.categoryName,
        row.brand,
        money(row.price),
        row.salePrice === undefined ? "" : money(row.salePrice),
        String(row.stock),
        String(row.reserved),
        String(row.available),
        row.isActive ? "Active" : "Inactive",
      ]
        .map((cell) => escapeCell(cell))
        .join(",")
    );
  }

  return `\uFEFF${lines.join("\r\n")}\r\n`;
}

/** inventory-YYYY-MM-DD.csv using the visitor's local date. */
export function inventoryCsvFilename(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `inventory-${year}-${month}-${day}.csv`;
}

export function downloadInventoryCsv(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
