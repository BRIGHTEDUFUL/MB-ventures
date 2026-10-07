"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { Price } from "@/components/shared/Price";
import { Search, Filter, Package, Truck, Store, ArrowRight } from "lucide-react";

const STATUS_TABS = [
  { id: "all", label: "All Orders" },
  { id: "pending_verification", label: "MoMo Verification", highlight: true },
  { id: "processing", label: "Processing" },
  { id: "ready_for_pickup", label: "Ready for Pickup" },
  { id: "out_for_delivery", label: "Out for Delivery" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

export default function AdminOrdersPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "all";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const orders = useQuery(api.adminOrders.list, {
    status: activeTab === "all" ? undefined : activeTab,
    paymentMethod: paymentFilter === "all" ? undefined : paymentFilter,
    search: searchQuery.trim() || undefined,
  });

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Orders"
        description="Inspect orders, verify mobile money reference codes, and advance fulfillment statuses."
      />

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-line pb-2 -mb-2 text-xs font-medium scrollbar-none">
        {STATUS_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-md transition-colors shrink-0 flex items-center gap-1.5 ${
                isActive
                  ? "bg-brand text-white font-semibold"
                  : tab.highlight
                    ? "bg-accent-soft text-accent hover:bg-accent-soft/80"
                    : "text-ink-muted hover:text-ink hover:bg-surface"
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-surface border border-line rounded-lg p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order #, customer name, phone, or MoMo ref..."
            className="w-full h-11 pl-9 pr-3 rounded-md border border-line-strong bg-surface text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          />
        </div>

        {/* Payment Method Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-ink-muted shrink-0" />
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="h-11 px-3 rounded-md border border-line-strong bg-surface text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <option value="all">All Payment Methods</option>
            <option value="momo">Mobile Money (MoMo)</option>
            <option value="cash_on_delivery">Cash on Delivery</option>
            <option value="pay_in_store">Pay in Store</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-surface border border-line rounded-lg overflow-hidden">
        {orders === undefined ? (
          <div className="p-8 text-center text-xs font-mono text-ink-muted">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package className="w-10 h-10 text-ink-muted mx-auto stroke-[1.25]" />
            <h3 className="font-heading font-semibold text-sm text-ink">No orders found</h3>
            <p className="text-xs text-ink-muted max-w-sm mx-auto">
              No customer orders match your selected filters or search terms.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas border-b border-line text-ink-muted font-mono uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Fulfillment</th>
                  <th className="py-3 px-4">Payment & Reference</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-canvas/50 transition-colors">
                    {/* Order Number */}
                    <td className="py-3.5 px-4 font-mono font-bold text-ink">
                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="hover:text-accent hover:underline block"
                      >
                        {order.orderNumber}
                      </Link>
                      <span className="text-[11px] text-ink-muted font-normal block mt-0.5">
                        {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-ink-muted font-mono text-[11px] whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString("en-GH", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      <span className="block text-ink-subtle">
                        {new Date(order.createdAt).toLocaleTimeString("en-GH", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-ink leading-tight">{order.customer.name}</p>
                      <p className="text-[11px] font-mono text-ink-muted mt-0.5">
                        {order.customer.phone}
                      </p>
                      <p className="text-[11px] text-ink-subtle truncate max-w-[150px]">
                        {order.customer.email}
                      </p>
                    </td>

                    {/* Fulfillment */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        {order.fulfillment === "delivery" ? (
                          <Truck className="w-3.5 h-3.5 text-ink-muted" />
                        ) : (
                          <Store className="w-3.5 h-3.5 text-ink-muted" />
                        )}
                        <span className="font-medium text-ink capitalize">{order.fulfillment}</span>
                      </div>
                      <span className="text-[11px] text-ink-muted block mt-0.5 truncate max-w-[130px]">
                        {order.deliveryZoneName || order.pickupSnapshot?.name || "Accra"}
                      </span>
                    </td>

                    {/* Payment & MoMo Ref */}
                    <td className="py-3.5 px-4 font-mono">
                      <span className="font-semibold text-ink uppercase block">
                        {order.paymentMethod.replace(/_/g, " ")}
                      </span>
                      {order.paymentMethod === "momo" && (
                        <div className="mt-0.5">
                          {order.momoReference ? (
                            <span className="text-[11px] font-bold text-accent block">
                              Ref: {order.momoReference}
                            </span>
                          ) : (
                            <span className="text-[10px] text-warning italic block">
                              No ref yet
                            </span>
                          )}
                          {order.momoPhone && (
                            <span className="text-[10px] text-ink-muted block">
                              {order.momoNetwork} · {order.momoPhone}
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Total */}
                    <td className="py-3.5 px-4 font-bold text-sm text-ink whitespace-nowrap">
                      <Price amount={order.total} />
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <OrderStatusBadge status={order.status} />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-line hover:border-line-strong hover:bg-surface text-ink text-xs font-semibold transition-colors"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
