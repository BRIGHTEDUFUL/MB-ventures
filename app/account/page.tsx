"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { formatMoney } from "@/lib/money";
import { Package, MapPin, User, ChevronRight, ShoppingBag } from "lucide-react";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";

export default function AccountOverviewPage() {
  const { user } = useCurrentUser();
  const orders = useQuery(api.orders.listMyOrders);

  const recentOrders = orders?.slice(0, 3) ?? [];

  return (
    <div className="space-y-8">
      {/* Welcome panel */}
      <div className="bg-surface border border-line rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-md bg-canvas-strong flex items-center justify-center shrink-0">
            <User className="w-6 h-6 text-ink-muted" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-ink text-lg">
              {user?.name ?? "Welcome back"}
            </h2>
            {user?.email && <p className="text-ink-muted text-sm mt-0.5">{user.email}</p>}
            {user?.phone && <p className="text-ink-muted text-sm">{user.phone}</p>}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            href: "/account/orders",
            icon: Package,
            label: "View all orders",
            desc: "Track and manage your orders",
          },
          {
            href: "/account/addresses",
            icon: MapPin,
            label: "Saved addresses",
            desc: "Manage delivery addresses",
          },
          {
            href: "/account/profile",
            icon: User,
            label: "Edit profile",
            desc: "Update name and phone",
          },
        ].map(({ href, icon: Icon, label, desc }) => (
          <Link
            key={href}
            href={href}
            className="bg-surface border border-line rounded-lg p-4 flex items-start gap-3 hover:border-line-strong transition-colors group"
          >
            <Icon className="w-5 h-5 text-ink-muted mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-ink text-sm group-hover:underline">{label}</p>
              <p className="text-xs text-ink-muted mt-0.5">{desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-ink-muted ml-auto mt-0.5 shrink-0" />
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-ink">Recent orders</h2>
          <Link href="/account/orders" className="text-sm text-link hover:underline">
            View all
          </Link>
        </div>

        {orders === undefined ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-surface border border-line rounded-lg p-4 h-20 animate-pulse"
              />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="bg-surface border border-line rounded-lg p-8 text-center">
            <ShoppingBag className="w-10 h-10 text-ink-subtle mx-auto mb-3" />
            <p className="font-medium text-ink">No orders yet</p>
            <p className="text-ink-muted text-sm mt-1">
              Browse our catalog and place your first order.
            </p>
            <Link
              href="/catalog"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 bg-brand text-white text-sm font-medium rounded-md hover:bg-brand-hover transition-colors"
            >
              Shop now
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <Link
                key={order._id}
                href={`/account/orders/${order.orderNumber}`}
                className="bg-surface border border-line rounded-lg p-4 flex flex-wrap items-center gap-3 hover:border-line-strong transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm font-medium text-ink">{order.orderNumber}</p>
                  <p className="text-xs text-ink-muted mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString("en-GH", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    {" · "}
                    {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                    {" · "}
                    {order.fulfillment === "delivery" ? "Home delivery" : "In-store pickup"}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
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
      </section>
    </div>
  );
}
