"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { Price } from "@/components/shared/Price";
import { Badge } from "@/components/ui/badge";
import { RoleBadge } from "./RoleBadge";
import { RoleControl } from "./RoleControl";
import { FOCUS_CLASS, formatDate } from "./types";
import { ArrowLeft, MapPin, Package } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

interface UserDetailProps {
  userId: Id<"users">;
}

export function UserDetail({ userId }: UserDetailProps) {
  const data = useQuery(api.usersAdmin.adminGet, { userId });
  const currentUser = useQuery(api.users.currentUser, {});

  if (data === undefined) {
    return (
      <div className="space-y-6 animate-pulse" aria-hidden="true">
        <div className="h-11 bg-surface rounded w-1/3" />
        <div className="h-40 bg-surface rounded-lg" />
        <div className="h-64 bg-surface rounded-lg" />
      </div>
    );
  }

  const user = data.user;
  const displayName = user.name || "Unnamed user";
  const isSelf = currentUser?._id === user._id;

  return (
    <div className="space-y-6">
      <AdminHeader
        title={displayName}
        description={`Joined ${formatDate(user.createdAt)} · ${user.orderCount} ${
          user.orderCount === 1 ? "order" : "orders"
        }`}
        breadcrumbs={[{ label: "Users", href: "/admin/users" }, { label: displayName }]}
        actions={
          <Link
            href="/admin/users"
            className={`inline-flex items-center gap-1.5 h-11 px-4 rounded-md border border-line-strong bg-surface text-xs font-semibold text-ink hover:bg-canvas transition-colors ${FOCUS_CLASS}`}
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Back to users</span>
          </Link>
        }
      />

      {/* Profile */}
      <section
        aria-labelledby="user-profile-heading"
        className="bg-surface border border-line rounded-lg p-5 space-y-4"
      >
        <h2 id="user-profile-heading" className="font-heading font-semibold text-sm text-ink">
          Profile
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          <ProfileField label="Name" value={displayName} />
          <ProfileField label="Email" value={user.email || "Not provided"} />
          <ProfileField label="Phone" value={user.phone || "Not provided"} />
          <ProfileField label="Joined" value={formatDate(user.createdAt)} />
          <ProfileField label="Orders" value={String(user.orderCount)} />
          <ProfileField
            label="Total spent"
            value={<Price amount={user.totalSpent} className="font-semibold" />}
            hint="Sum of paid orders."
          />
        </div>

        <div className="border-t border-line pt-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold text-ink">Role</p>
            <RoleBadge role={user.role} />
          </div>
          <div className="sm:ml-auto">
            <RoleControl
              userId={user._id}
              name={user.name}
              role={user.role}
              isSelf={isSelf}
            />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Addresses */}
        <section
          aria-labelledby="user-addresses-heading"
          className="lg:col-span-5 bg-surface border border-line rounded-lg overflow-hidden"
        >
          <h2
            id="user-addresses-heading"
            className="font-heading font-semibold text-sm text-ink px-5 py-4 border-b border-line"
          >
            Addresses
          </h2>
          {data.addresses.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <MapPin
                className="w-8 h-8 text-ink-muted mx-auto stroke-[1.25]"
                aria-hidden="true"
              />
              <p className="text-xs text-ink-muted">No saved addresses on this account.</p>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {data.addresses.map((address) => (
                <li key={address._id} className="p-5 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-sm text-ink">
                      {address.label}
                    </span>
                    {address.isDefault && (
                      <Badge variant="secondary" className="text-[11px] font-semibold">
                        Default
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-ink">
                    {address.recipientName} · {address.phone}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {[address.line1, address.line2].filter(Boolean).join(", ")}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {address.city}, {address.region}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Orders */}
        <section
          aria-labelledby="user-orders-heading"
          className="lg:col-span-7 bg-surface border border-line rounded-lg overflow-hidden"
        >
          <h2
            id="user-orders-heading"
            className="font-heading font-semibold text-sm text-ink px-5 py-4 border-b border-line"
          >
            Orders
          </h2>
          {data.orders.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Package
                className="w-8 h-8 text-ink-muted mx-auto stroke-[1.25]"
                aria-hidden="true"
              />
              <p className="text-xs text-ink-muted">No orders yet from this account.</p>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {data.orders.map((order) => (
                <li key={order._id}>
                  <Link
                    href={`/admin/orders/${order._id}`}
                    className={`flex items-center justify-between gap-4 p-4 hover:bg-canvas/50 transition-colors ${FOCUS_CLASS}`}
                  >
                    <div className="space-y-1">
                      <span className="font-mono font-bold text-xs text-ink">
                        {order.orderNumber}
                      </span>
                      <p className="text-[11px] text-ink-muted">
                        {formatDate(order.createdAt)} · {order.itemCount}{" "}
                        {order.itemCount === 1 ? "item" : "items"}
                      </p>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <Price amount={order.total} className="font-semibold whitespace-nowrap" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function ProfileField({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">{label}</p>
      <p className="text-sm text-ink mt-1">{value}</p>
      {hint && <p className="text-[11px] text-ink-muted mt-0.5">{hint}</p>}
    </div>
  );
}
