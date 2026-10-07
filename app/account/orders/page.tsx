"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatMoney } from "@/lib/money";
import { ChevronRight, ShoppingBag } from "lucide-react";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";

export default function AccountOrdersPage() {
  const orders = useQuery(api.orders.listMyOrders);

  return (
    <div className="space-y-6">
      <h2 className="font-heading font-bold text-ink text-lg">Your orders</h2>

      {orders === undefined ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-surface border border-line rounded-lg p-5 h-20 animate-pulse"
            />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-surface border border-line rounded-lg p-10 text-center">
          <ShoppingBag className="w-10 h-10 text-ink-subtle mx-auto mb-3" />
          <p className="font-medium text-ink">No orders yet</p>
          <p className="text-ink-muted text-sm mt-1">
            Your order history will appear here once you place an order.
          </p>
          <Link
            href="/catalog"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 bg-brand text-white text-sm font-medium rounded-md hover:bg-brand-hover transition-colors"
          >
            Browse catalog
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order._id}
              href={`/account/orders/${order.orderNumber}`}
              className="bg-surface border border-line rounded-lg p-4 sm:p-5 flex flex-wrap items-start sm:items-center gap-3 hover:border-line-strong transition-colors group"
            >
              {/* Order number + date */}
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm font-semibold text-ink">{order.orderNumber}</p>
                <p className="text-xs text-ink-muted mt-0.5">
                  {new Date(order.createdAt).toLocaleDateString("en-GH", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  {" · "}
                  {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                  {" · "}
                  {order.fulfillment === "delivery" ? "Home delivery" : "In-store pickup"}
                </p>
              </div>

              {/* Status + total + arrow */}
              <div className="flex items-center gap-3 shrink-0 ml-auto">
                <OrderStatusBadge status={order.status} />
                <span className="font-mono font-semibold text-sm text-ink">
                  {formatMoney(order.total, "GHS")}
                </span>
                <ChevronRight className="w-4 h-4 text-ink-muted" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
