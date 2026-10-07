"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatMoney } from "@/lib/money";
import {
  ORDER_STATUS_BADGES,
  PAYMENT_STATUS_BADGES,
  PAYMENT_METHOD_LABELS,
} from "@/convex/lib/constants";
import { toast } from "sonner";
import {
  Package,
  ChevronLeft,
  MapPin,
  Store,
  Check,
  Clock,
  AlertTriangle,
  Loader2,
  ExternalLink,
} from "lucide-react";

/** Timeline step for the order event log */
function TimelineItem({
  icon,
  label,
  note,
  time,
  active,
  done,
}: {
  icon: React.ReactNode;
  label: string;
  note?: string;
  time?: string;
  active?: boolean;
  done?: boolean;
}) {
  return (
    <li className="flex gap-3 relative">
      <div
        className={[
          "w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 z-10 mt-0.5",
          done
            ? "bg-success border-success text-white"
            : active
              ? "bg-brand border-brand text-white"
              : "bg-canvas border-line text-ink-muted",
        ].join(" ")}
      >
        {icon}
      </div>
      <div className="pb-6">
        <p
          className={["text-sm font-medium", done || active ? "text-ink" : "text-ink-muted"].join(
            " "
          )}
        >
          {label}
        </p>
        {note && <p className="text-xs text-ink-muted mt-0.5">{note}</p>}
        {time && <p className="text-xs text-ink-subtle mt-0.5 font-mono">{time}</p>}
      </div>
    </li>
  );
}

const CANCELLABLE_STATUSES = new Set(["pending", "awaiting_momo", "pending_verification"]);

export default function AccountOrderDetailPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;
  const order = useQuery(api.orders.getMineByOrderNumber, { orderNumber });
  const cancelOrder = useMutation(api.orders.cancelMine);

  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  async function handleCancel() {
    setCancelling(true);
    try {
      await cancelOrder({ orderNumber });
      toast.success("Order cancelled. Your reservation has been released.");
      setConfirmCancel(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not cancel order.";
      toast.error(msg);
    } finally {
      setCancelling(false);
    }
  }

  if (order === undefined) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-canvas-strong rounded animate-pulse" />
        <div className="h-64 bg-canvas-strong rounded-lg animate-pulse" />
        <div className="h-48 bg-canvas-strong rounded-lg animate-pulse" />
      </div>
    );
  }

  if (order === null) {
    return (
      <div className="bg-surface border border-line rounded-lg p-10 text-center">
        <Package className="w-10 h-10 text-ink-subtle mx-auto mb-3" />
        <p className="font-medium text-ink">Order not found</p>
        <p className="text-ink-muted text-sm mt-1">This order does not belong to your account.</p>
        <Link
          href="/account/orders"
          className="mt-4 inline-flex min-h-[44px] items-center gap-2 px-4 py-2.5 bg-brand text-white text-sm font-medium rounded-md hover:bg-brand-hover transition-colors"
        >
          Back to orders
        </Link>
      </div>
    );
  }

  const statusBadge = ORDER_STATUS_BADGES[order.status];
  const payBadge = PAYMENT_STATUS_BADGES[order.paymentStatus];
  const canCancel = CANCELLABLE_STATUSES.has(order.status);
  const isCancelled = order.status === "cancelled";
  const isDelivery = order.fulfillment === "delivery";

  // Build timeline steps based on fulfillment type
  type StepDef = { id: string; label: string };
  const deliverySteps: StepDef[] = [
    { id: "placed", label: "Order placed" },
    { id: "payment", label: "Payment confirmed" },
    { id: "processing", label: "Packed and ready" },
    { id: "out_for_delivery", label: "Out for delivery" },
    { id: "completed", label: "Delivered" },
  ];
  const pickupSteps: StepDef[] = [
    { id: "placed", label: "Order placed" },
    { id: "payment", label: "Payment confirmed" },
    { id: "processing", label: "Packed and ready" },
    { id: "ready_for_pickup", label: "Ready for pickup" },
    { id: "completed", label: "Picked up" },
  ];
  const steps = isDelivery ? deliverySteps : pickupSteps;

  // Map order status to a progress index
  function getProgressIndex(status: string) {
    const map: Record<string, number> = {
      pending: 0,
      awaiting_momo: 0,
      pending_verification: 1,
      processing: 2,
      ready_for_pickup: 3,
      out_for_delivery: 3,
      completed: 4,
      cancelled: -1,
    };
    return map[status] ?? 0;
  }

  const progressIdx = getProgressIndex(order.status);

  const formatDateTime = (ts: number) =>
    new Date(ts).toLocaleString("en-GH", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/account/orders"
        className="inline-flex min-h-[44px] items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to orders
      </Link>

      {/* Header */}
      <div className="bg-surface border border-line rounded-lg p-5 sm:p-6">
        <div className="flex flex-wrap items-start gap-3 justify-between">
          <div>
            <p className="text-xs text-ink-muted uppercase tracking-wide font-mono mb-0.5">Order</p>
            <h2 className="font-mono font-bold text-xl text-ink">{order.orderNumber}</h2>
            <p className="text-xs text-ink-muted mt-1">Placed {formatDateTime(order.createdAt)}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={[
                "inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-medium border",
                statusBadge.className,
              ].join(" ")}
            >
              {statusBadge.label}
            </span>
            <span
              className={[
                "inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-medium border",
                payBadge.className,
              ].join(" ")}
            >
              {payBadge.label}
            </span>
          </div>
        </div>

        {/* Payment info */}
        <div className="mt-4 pt-4 border-t border-line">
          <p className="text-sm text-ink-muted">
            Payment method:{" "}
            <span className="text-ink font-medium">
              {PAYMENT_METHOD_LABELS[order.paymentMethod]}
            </span>
          </p>
          {order.momoReference && (
            <p className="text-sm text-ink-muted mt-0.5">
              Reference: <span className="font-mono text-ink">{order.momoReference}</span>
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Left column: items + fulfillment */}
        <div className="space-y-6">
          {/* Items */}
          <section className="bg-surface border border-line rounded-lg overflow-hidden">
            <h3 className="font-heading font-semibold text-ink text-sm px-5 py-3.5 border-b border-line">
              Items ({order.items.reduce((s, i) => s + i.quantity, 0)})
            </h3>
            <ul className="divide-y divide-line">
              {order.items.map((item) => (
                <li key={`${item.productId}-${item.quantity}`} className="flex gap-3 p-4 sm:p-5">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-canvas rounded shrink-0 overflow-hidden">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="object-contain w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-ink-subtle" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-ink leading-tight">{item.name}</p>
                    {item.sku && (
                      <p className="font-mono text-xs text-ink-muted mt-0.5">SKU: {item.sku}</p>
                    )}
                    <p className="text-xs text-ink-muted mt-1">
                      {formatMoney(item.unitPrice, "GHS")} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-mono font-semibold text-sm text-ink shrink-0">
                    {formatMoney(item.unitPrice * item.quantity, "GHS")}
                  </p>
                </li>
              ))}
            </ul>
            {/* Totals */}
            <div className="border-t border-line p-4 sm:p-5 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-ink-muted">Subtotal</span>
                <span className="font-mono text-ink">{formatMoney(order.subtotal, "GHS")}</span>
              </div>
              {isDelivery && (
                <div className="flex justify-between text-sm">
                  <span className="text-ink-muted">Delivery fee</span>
                  <span className="font-mono text-ink">
                    {order.deliveryFee === 0 ? "Free" : formatMoney(order.deliveryFee, "GHS")}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm font-semibold pt-1 border-t border-line">
                <span className="text-ink">Total</span>
                <span className="font-mono text-ink">{formatMoney(order.total, "GHS")}</span>
              </div>
            </div>
          </section>

          {/* Fulfillment details */}
          <section className="bg-surface border border-line rounded-lg p-5">
            <h3 className="font-heading font-semibold text-ink text-sm mb-3">
              {isDelivery ? (
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Delivery address
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Store className="w-4 h-4" /> Pickup location
                </span>
              )}
            </h3>
            {isDelivery && order.deliveryAddress ? (
              <div className="text-sm text-ink-muted space-y-0.5">
                {order.deliveryZoneName && (
                  <p className="text-ink font-medium">{order.deliveryZoneName}</p>
                )}
                <p>{order.deliveryAddress.line1}</p>
                {order.deliveryAddress.line2 && <p>{order.deliveryAddress.line2}</p>}
                <p>
                  {order.deliveryAddress.city}, {order.deliveryAddress.region}
                </p>
                {order.deliveryAddress.notes && (
                  <p className="text-ink-subtle italic text-xs mt-1">
                    {order.deliveryAddress.notes}
                  </p>
                )}
              </div>
            ) : order.pickupSnapshot ? (
              <div className="text-sm text-ink-muted space-y-0.5">
                <p className="text-ink font-medium">{order.pickupSnapshot.name}</p>
                <p>{order.pickupSnapshot.address}</p>
                <p className="text-xs text-ink-subtle mt-1">
                  Hours: {order.pickupSnapshot.openingHours}
                </p>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(order.pickupSnapshot.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center gap-1 text-xs text-link hover:underline mt-1"
                >
                  Get directions <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ) : null}
          </section>

          {/* Customer note */}
          {order.customerNote && (
            <section className="bg-surface border border-line rounded-lg p-5">
              <h3 className="font-heading font-semibold text-ink text-sm mb-2">Your note</h3>
              <p className="text-sm text-ink-muted">{order.customerNote}</p>
            </section>
          )}

          {/* Cancel action */}
          {canCancel && !isCancelled && (
            <section className="bg-surface border border-line rounded-lg p-5">
              <h3 className="font-heading font-semibold text-ink text-sm mb-2">Cancel order</h3>
              <p className="text-sm text-ink-muted mb-4">
                Unpaid orders can be cancelled. Your cart reservation will be released.
              </p>
              {!confirmCancel ? (
                <button
                  onClick={() => setConfirmCancel(true)}
                  className="px-4 py-2.5 border border-danger text-danger text-sm font-medium rounded-md hover:bg-danger-soft transition-colors min-h-[44px]"
                >
                  Cancel this order
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-ink font-medium">Are you sure you want to cancel?</p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancel}
                      disabled={cancelling}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-danger text-white text-sm font-medium rounded-md hover:bg-danger/90 disabled:opacity-60 transition-colors min-h-[44px]"
                    >
                      {cancelling && <Loader2 className="w-4 h-4 animate-spin" />}
                      Yes, cancel order
                    </button>
                    <button
                      onClick={() => setConfirmCancel(false)}
                      className="px-4 py-2.5 border border-line-strong text-ink text-sm font-medium rounded-md hover:bg-canvas transition-colors min-h-[44px]"
                    >
                      Keep order
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>

        {/* Right column: status timeline */}
        <aside className="space-y-6">
          {/* Status timeline */}
          <section className="bg-surface border border-line rounded-lg p-5">
            <h3 className="font-heading font-semibold text-ink text-sm mb-5">Order progress</h3>
            {isCancelled ? (
              <div className="flex items-start gap-3 p-3 bg-danger-soft rounded-md">
                <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-danger">Order cancelled</p>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Reserved items have been released.
                  </p>
                </div>
              </div>
            ) : (
              <ul className="relative before:absolute before:left-3.5 before:top-3.5 before:bottom-3.5 before:w-px before:bg-line">
                {steps.map((step, i) => {
                  const done = i < progressIdx;
                  const active = i === progressIdx;
                  // Find corresponding event
                  const event = order.events.find(
                    (e) => e.type === "status" && e.toStatus === step.id
                  );
                  return (
                    <TimelineItem
                      key={step.id}
                      icon={
                        done ? (
                          <Check className="w-3 h-3" />
                        ) : active ? (
                          <Clock className="w-3 h-3" />
                        ) : null
                      }
                      label={step.label}
                      note={event?.message}
                      time={event ? formatDateTime(event.createdAt) : undefined}
                      done={done}
                      active={active}
                    />
                  );
                })}
              </ul>
            )}
          </section>

          {/* Activity log */}
          {order.events.length > 0 && (
            <section className="bg-surface border border-line rounded-lg p-5">
              <h3 className="font-heading font-semibold text-ink text-sm mb-4">Activity</h3>
              <ul className="space-y-3">
                {[...order.events].reverse().map((event) => (
                  <li key={event._id} className="text-sm">
                    <p className="text-ink">{event.message}</p>
                    <p className="text-xs text-ink-subtle font-mono mt-0.5">
                      {formatDateTime(event.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
