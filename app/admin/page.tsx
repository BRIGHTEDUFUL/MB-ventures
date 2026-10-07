"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { Price } from "@/components/shared/Price";
import {
  CreditCard,
  Package,
  CircleDollarSign,
  AlertTriangle,
  ArrowRight,
  Clock,
  Plus,
} from "lucide-react";

export default function AdminDashboardPage() {
  const stats = useQuery(api.adminOrders.getDashboardStats, {});

  if (stats === undefined) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-11 bg-surface rounded-md w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-surface rounded-lg border border-line" />
          ))}
        </div>
      </div>
    );
  }

  const {
    pendingVerificationCount,
    activeOrdersCount,
    totalOrdersCount,
    totalRevenue,
    lowStockCount,
    recentOrders,
    pendingVerificationList,
  } = stats;

  return (
    <div className="space-y-8">
      {/* Header */}
      <AdminHeader
        title="Dashboard Overview"
        description="Live operational summary, mobile money verification queue, and store inventory status."
        actions={
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-brand text-white text-xs font-semibold hover:bg-brand-hover transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </Link>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          title="MoMo Verification"
          value={pendingVerificationCount}
          subtitle={
            pendingVerificationCount > 0
              ? `${pendingVerificationCount} orders need manual verification`
              : "All MoMo payments processed"
          }
          icon={CreditCard}
          href="/admin/orders?tab=pending_verification"
          variant={pendingVerificationCount > 0 ? "alert" : "default"}
        />

        <AdminStatCard
          title="Active Orders"
          value={activeOrdersCount}
          subtitle={`${totalOrdersCount} total orders recorded`}
          icon={Package}
          href="/admin/orders?tab=processing"
          variant="default"
        />

        <AdminStatCard
          title="Total Paid Revenue"
          value={<Price amount={totalRevenue} />}
          subtitle="Confirmed payments & sales"
          icon={CircleDollarSign}
          variant="success"
        />

        <AdminStatCard
          title="Low Stock Alerts"
          value={lowStockCount}
          subtitle={
            lowStockCount > 0
              ? `${lowStockCount} products below threshold`
              : "Healthy inventory levels"
          }
          icon={AlertTriangle}
          href="/admin/products?filter=low_stock"
          variant={lowStockCount > 0 ? "warning" : "default"}
        />
      </div>

      {/* Priority Action: MoMo Verification Queue (if any exist) */}
      {pendingVerificationList.length > 0 && (
        <div className="bg-surface border-2 border-warning/50 rounded-lg p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-warning" />
              <h2 className="font-heading font-bold text-base text-ink">
                Mobile Money Verification Queue
              </h2>
            </div>
            <Link
              href="/admin/orders?tab=pending_verification"
              className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
            >
              <span>View all pending</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas border-y border-line text-ink-muted font-mono uppercase">
                <tr>
                  <th className="py-2.5 px-3">Order Number</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Network & Reference</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {pendingVerificationList.map((order) => (
                  <tr key={order._id} className="hover:bg-canvas/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-ink">
                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="hover:text-accent hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-medium text-ink">{order.customerName}</p>
                      <p className="text-ink-muted font-mono text-[11px]">{order.customerPhone}</p>
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <span className="font-bold text-ink">{order.momoNetwork || "MoMo"}</span>
                      {order.momoReference ? (
                        <span className="block text-ink font-semibold">
                          Ref: {order.momoReference}
                        </span>
                      ) : (
                        <span className="block text-warning italic text-[11px]">
                          Awaiting reference from customer
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-semibold text-ink">
                      <Price amount={order.total} />
                    </td>
                    <td className="py-3 px-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-brand text-white font-semibold text-xs hover:bg-brand-hover transition-colors"
                      >
                        <span>Verify</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Two Column Grid: Recent Orders (8 cols) & Quick Links (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 bg-surface border border-line rounded-lg p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <h2 className="font-heading font-bold text-base text-ink">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-ink-muted hover:text-ink underline"
            >
              View all orders
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-8 text-center text-ink-muted text-xs">
              No orders have been placed yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-canvas border-y border-line text-ink-muted font-mono uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Order</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Fulfillment</th>
                    <th className="py-2.5 px-3">Total</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-canvas/50 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-ink">
                        <Link href={`/admin/orders/${order._id}`} className="hover:underline">
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-medium text-ink block truncate max-w-[140px]">
                          {order.customerName}
                        </span>
                      </td>
                      <td className="py-3 px-3 uppercase font-mono text-[11px] text-ink-muted">
                        {order.fulfillment}
                      </td>
                      <td className="py-3 px-3 font-semibold text-ink">
                        <Price amount={order.total} />
                      </td>
                      <td className="py-3 px-3">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          href={`/admin/orders/${order._id}`}
                          className="text-xs font-semibold text-ink hover:underline p-1"
                        >
                          Inspect →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Management Shortcuts */}
        <div className="lg:col-span-4 bg-surface border border-line rounded-lg p-5 sm:p-6 space-y-4">
          <h2 className="font-heading font-bold text-base text-ink border-b border-line pb-3">
            Quick Actions
          </h2>

          <div className="space-y-2 text-xs">
            <Link
              href="/admin/products/new"
              className="flex items-center justify-between p-3 rounded-md border border-line hover:border-line-strong hover:bg-canvas transition-colors font-medium text-ink"
            >
              <span>Create New Product</span>
              <Plus className="w-4 h-4 text-ink-muted" />
            </Link>

            <Link
              href="/admin/categories"
              className="flex items-center justify-between p-3 rounded-md border border-line hover:border-line-strong hover:bg-canvas transition-colors font-medium text-ink"
            >
              <span>Manage Categories</span>
              <ArrowRight className="w-4 h-4 text-ink-muted" />
            </Link>

            <Link
              href="/admin/delivery"
              className="flex items-center justify-between p-3 rounded-md border border-line hover:border-line-strong hover:bg-canvas transition-colors font-medium text-ink"
            >
              <span>Delivery Zones & Pickup Locations</span>
              <ArrowRight className="w-4 h-4 text-ink-muted" />
            </Link>

            <Link
              href="/admin/settings"
              className="flex items-center justify-between p-3 rounded-md border border-line hover:border-line-strong hover:bg-canvas transition-colors font-medium text-ink"
            >
              <span>Site & MoMo Accounts Settings</span>
              <ArrowRight className="w-4 h-4 text-ink-muted" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
