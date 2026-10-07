"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { buildInventoryCsv, downloadInventoryCsv, inventoryCsvFilename } from "./csv";
import { BUTTON_SECONDARY } from "./types";
import { Download } from "lucide-react";
import { toast } from "sonner";

/** Fetches every product's stock numbers, then downloads the CSV built in the browser. */
export function ExportCsvButton() {
  const [requested, setRequested] = useState(false);
  const exportRows = useQuery(api.inventoryAdmin.exportRows, requested ? {} : "skip");

  useEffect(() => {
    if (!requested || !exportRows) return;
    try {
      downloadInventoryCsv(buildInventoryCsv(exportRows.rows), inventoryCsvFilename());
      toast.success(`Exported ${exportRows.rows.length} products to CSV.`);
    } catch {
      toast.error("The CSV file could not be created. Try again.");
    } finally {
      setRequested(false);
    }
  }, [requested, exportRows]);

  const preparing = requested && exportRows === undefined;

  return (
    <button
      type="button"
      onClick={() => setRequested(true)}
      disabled={preparing}
      className={`${BUTTON_SECONDARY} inline-flex items-center gap-1.5 disabled:opacity-50`}
    >
      <Download className="w-3.5 h-3.5" aria-hidden="true" />
      <span>{preparing ? "Preparing..." : "Export CSV"}</span>
    </button>
  );
}
