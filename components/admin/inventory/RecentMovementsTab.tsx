"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Pager } from "./Pager";
import {
  CONTROL_CLASS,
  MOVEMENT_PAGE_SIZE,
  REASON_LABELS,
  REASON_OPTIONS,
  formatDelta,
  formatMovementDate,
  type StockAdjustmentReason,
} from "./types";
import { ArrowLeftRight } from "lucide-react";

/** Recent movements tab: every stock change in the shop, newest first. */
export function RecentMovementsTab() {
  const [reason, setReason] = useState<StockAdjustmentReason | "all">("all");
  const [offset, setOffset] = useState(0);

  const movements = useQuery(api.inventoryAdmin.recentMovements, {
    reason: reason === "all" ? undefined : reason,
    offset,
    limit: MOVEMENT_PAGE_SIZE,
  });

  return (
    <div className="space-y-4">
      <div className="bg-surface border border-line rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <label htmlFor="movement-reason" className="text-xs font-semibold text-ink">
          Filter by reason
        </label>
        <select
          id="movement-reason"
          value={reason}
          onChange={(e) => {
            setReason(e.target.value as StockAdjustmentReason | "all");
            setOffset(0);
          }}
          className={`${CONTROL_CLASS} w-full sm:w-auto`}
        >
          {REASON_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-surface border border-line rounded-lg overflow-hidden">
        {movements === undefined ? (
          <div className="p-8 text-center text-xs font-mono text-ink-muted">
            Loading stock movements...
          </div>
        ) : movements.items.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ArrowLeftRight
              className="w-10 h-10 text-ink-muted mx-auto stroke-[1.25]"
              aria-hidden="true"
            />
            <h3 className="font-heading font-semibold text-sm text-ink">No movements found</h3>
            <p className="text-xs text-ink-muted max-w-sm mx-auto">
              Stock changes made by sales, admins and imports appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[56rem] text-left text-xs">
                <thead className="bg-canvas border-b border-line text-ink-muted font-mono uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4 text-right">Change</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Order</th>
                    <th className="py-3 px-4">Admin</th>
                    <th className="py-3 px-4">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {movements.items.map((movement) => (
                    <tr key={movement._id} className="hover:bg-canvas/50 transition-colors">
                      <td className="py-3.5 px-4 text-ink-muted font-mono text-[11px] whitespace-nowrap">
                        {formatMovementDate(movement.createdAt)}
                      </td>

                      <td className="py-3.5 px-4">
                        <Link
                          href={`/admin/products/${movement.productId}`}
                          className="font-heading font-semibold text-ink hover:underline line-clamp-1 block"
                        >
                          {movement.productName || "Deleted product"}
                        </Link>
                      </td>

                      <td
                        className={`py-3.5 px-4 text-right font-mono font-bold whitespace-nowrap ${
                          movement.delta > 0
                            ? "text-success"
                            : movement.delta < 0
                              ? "text-danger"
                              : "text-ink-muted"
                        }`}
                      >
                        {formatDelta(movement.delta)}
                      </td>

                      <td className="py-3.5 px-4 text-ink whitespace-nowrap">
                        {REASON_LABELS[movement.reason]}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {movement.orderId && movement.orderNumber ? (
                          <Link
                            href={`/admin/orders/${movement.orderId}`}
                            className="font-mono text-ink hover:underline"
                          >
                            {movement.orderNumber}
                          </Link>
                        ) : (
                          <span className="text-ink-subtle">-</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-ink-muted">{movement.actorName}</td>

                      <td className="py-3.5 px-4 text-ink-subtle max-w-[220px]">
                        <span className="line-clamp-2 block">{movement.note || "-"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pager
              offset={offset}
              limit={MOVEMENT_PAGE_SIZE}
              total={movements.total}
              hasMore={movements.hasMore}
              onOffsetChange={setOffset}
              label="Movement pages"
            />
          </>
        )}
      </div>
    </div>
  );
}
