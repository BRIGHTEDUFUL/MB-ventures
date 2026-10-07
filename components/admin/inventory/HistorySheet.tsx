"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Pager } from "./Pager";
import {
  HISTORY_PAGE_SIZE,
  REASON_LABELS,
  formatDelta,
  formatMovementDate,
  type HistoryTarget,
} from "./types";

interface HistorySheetProps {
  product: HistoryTarget | null;
  onClose: () => void;
}

/** Right-hand drawer with one product's stock history and its own pagination. */
export function HistorySheet({ product, onClose }: HistorySheetProps) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    setOffset(0);
  }, [product?.id]);

  const history = useQuery(
    api.inventoryAdmin.stockHistory,
    product ? { productId: product.id, offset, limit: HISTORY_PAGE_SIZE } : "skip"
  );

  return (
    <Sheet open={product !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-lg flex flex-col gap-0 p-0">
        <div className="shrink-0 px-6 pt-6 pb-4 pr-12 border-b border-line">
          <SheetHeader>
            <SheetTitle className="font-heading font-bold text-lg text-ink">Stock history</SheetTitle>
            <SheetDescription className="text-xs text-ink-muted break-words">
              {product?.name ?? ""}
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-2">
          {history === undefined ? (
            <p className="py-6 text-center text-xs font-mono text-ink-muted">
              Loading stock history...
            </p>
          ) : history.items.length === 0 ? (
            <p className="py-6 text-center text-xs text-ink-muted">
              No stock changes recorded for this product yet.
            </p>
          ) : (
            <ul>
              {history.items.map((item) => (
                <li key={item._id} className="py-3 border-b border-line last:border-b-0">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[11px] font-mono text-ink-muted">
                      {formatMovementDate(item.createdAt)}
                    </span>
                    <span
                      className={`font-mono text-xs font-bold whitespace-nowrap ${
                        item.delta > 0 ? "text-success" : item.delta < 0 ? "text-danger" : "text-ink-muted"
                      }`}
                    >
                      {formatDelta(item.delta)}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                    <span className="font-semibold text-ink">{REASON_LABELS[item.reason]}</span>
                    <span className="text-ink-muted">by {item.actorName}</span>
                    {item.orderId && item.orderNumber && (
                      <Link
                        href={`/admin/orders/${item.orderId}`}
                        className="font-mono text-ink hover:underline"
                      >
                        {item.orderNumber}
                      </Link>
                    )}
                  </div>
                  {item.note && <p className="mt-1 text-[11px] text-ink-subtle">{item.note}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>

        {history && history.items.length > 0 && (
          <div className="shrink-0">
            <Pager
              offset={offset}
              limit={HISTORY_PAGE_SIZE}
              total={history.total}
              hasMore={history.hasMore}
              onOffsetChange={setOffset}
              label="Stock history pages"
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
