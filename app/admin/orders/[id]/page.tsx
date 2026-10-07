"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Price } from "@/components/shared/Price";
import { toast } from "sonner";
import {
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Package,
  MessageSquare,
  Phone,
  Mail,
  User,
  MapPin,
  ArrowRight,
  FileText,
  Save,
} from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import type { OrderStatus } from "@/convex/lib/constants";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = params.id as Id<"orders">;

  const order = useQuery(api.adminOrders.get, { orderId });
  const verifyMomo = useMutation(api.adminOrders.verifyMomoPayment);
  const rejectMomo = useMutation(api.adminOrders.rejectMomoPayment);
  const updateStatus = useMutation(api.adminOrders.updateStatus);
  const updateNote = useMutation(api.adminOrders.updateInternalNote);

  // States
  const [internalNoteInput, setInternalNoteInput] = useState<string | null>(null);
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Rejection dialog
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  // Status transition dialog
  const [transitionDialogOpen, setTransitionDialogOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<OrderStatus | null>(null);
  const [transitionNote, setTransitionNote] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);

  if (order === undefined) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-11 bg-surface rounded w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-96 bg-surface rounded-lg" />
          <div className="lg:col-span-4 h-96 bg-surface rounded-lg" />
        </div>
      </div>
    );
  }

  if (order === null) {
    return (
      <div className="p-12 bg-surface border border-line rounded-lg text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-danger mx-auto" />
        <h2 className="font-heading font-bold text-lg text-ink">Order Not Found</h2>
        <p className="text-xs text-ink-muted">The requested order does not exist or was deleted.</p>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1 px-4 py-2 rounded-md bg-brand text-white text-xs font-semibold"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  const handleVerifyMomo = async () => {
    try {
      await verifyMomo({ orderId: order._id });
      toast.success("MoMo payment verified! Order advanced to processing.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to verify MoMo payment";
      toast.error(msg);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please enter a reason for flagging this MoMo payment.");
      return;
    }
    setIsRejecting(true);
    try {
      await rejectMomo({ orderId: order._id, reason: rejectReason.trim() });
      toast.success("MoMo reference rejected. Customer flagged for new payment/reference.");
      setRejectDialogOpen(false);
      setRejectReason("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to reject MoMo payment";
      toast.error(msg);
    } finally {
      setIsRejecting(false);
    }
  };

  const handleConfirmStatusChange = async () => {
    if (!targetStatus) return;
    setIsTransitioning(true);
    try {
      await updateStatus({
        orderId: order._id,
        toStatus: targetStatus,
        note: transitionNote.trim() || undefined,
      });
      toast.success(`Order status updated to ${targetStatus}.`);
      setTransitionDialogOpen(false);
      setTargetStatus(null);
      setTransitionNote("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update status";
      toast.error(msg);
    } finally {
      setIsTransitioning(false);
    }
  };

  const handleSaveInternalNote = async () => {
    if (internalNoteInput === null) return;
    setIsSavingNote(true);
    try {
      await updateNote({ orderId: order._id, internalNote: internalNoteInput });
      toast.success("Internal note saved.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save note";
      toast.error(msg);
    } finally {
      setIsSavingNote(false);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hello ${order.customer.name}, this is MB Ventures regarding your Order ${order.orderNumber}.`
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminHeader
        title={order.orderNumber}
        description={`Placed on ${new Date(order.createdAt).toLocaleString("en-GH", { dateStyle: "medium", timeStyle: "short" })}`}
        breadcrumbs={[{ label: "Orders", href: "/admin/orders" }, { label: order.orderNumber }]}
        actions={
          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/${order.customer.phone.replace(/[^0-9]/g, "")}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-success text-surface text-xs font-semibold hover:bg-success/90 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Customer</span>
            </a>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Action Panels & Order Items (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* MoMo Verification Panel */}
          {order.paymentMethod === "momo" && (
            <div
              className={`p-5 sm:p-6 rounded-lg border-2 space-y-4 ${
                order.paymentStatus === "paid"
                  ? "bg-surface border-success/40"
                  : "bg-surface border-warning/60"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard
                    className={`w-5 h-5 ${order.paymentStatus === "paid" ? "text-success" : "text-warning"}`}
                  />
                  <h2 className="font-heading font-bold text-base text-ink">
                    Mobile Money Verification
                  </h2>
                </div>
                <span
                  className={`text-xs font-mono font-semibold px-2.5 py-1 rounded ${
                    order.paymentStatus === "paid"
                      ? "bg-success-soft text-success"
                      : "bg-warning-soft text-warning"
                  }`}
                >
                  {order.paymentStatus === "paid" ? "PAID & VERIFIED" : "VERIFICATION REQUIRED"}
                </span>
              </div>

              {/* MoMo Reference Info */}
              <div className="p-3.5 bg-canvas rounded-md border border-line grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div>
                  <span className="text-ink-muted block text-[11px]">Network:</span>
                  <span className="font-bold text-ink text-sm">{order.momoNetwork || "MTN"}</span>
                </div>
                <div>
                  <span className="text-ink-muted block text-[11px]">Sender Number:</span>
                  <span className="font-bold text-ink text-sm">
                    {order.momoPhone || order.customer.phone}
                  </span>
                </div>
                <div>
                  <span className="text-ink-muted block text-[11px]">Transaction Reference:</span>
                  {order.momoReference ? (
                    <span className="font-bold text-accent text-sm select-all">
                      {order.momoReference}
                    </span>
                  ) : (
                    <span className="text-warning italic text-xs">No reference submitted</span>
                  )}
                </div>
              </div>

              {/* MoMo Verification Actions */}
              {order.paymentStatus !== "paid" && (
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleVerifyMomo}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-brand text-white text-xs font-semibold hover:bg-brand-hover transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span>Confirm MoMo Payment Received</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRejectDialogOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border border-danger/40 bg-surface text-danger text-xs font-semibold hover:bg-danger-soft transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Flag / Reject Reference</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Fulfillment Status Advance Panel */}
          <div className="bg-surface border border-line rounded-lg p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-ink-muted" />
                <h2 className="font-heading font-bold text-base text-ink">
                  Fulfillment & Status Controls
                </h2>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>

            <div className="text-xs text-ink-muted space-y-2">
              <p>
                Current fulfillment type:{" "}
                <strong className="text-ink uppercase font-mono">{order.fulfillment}</strong>
              </p>

              {/* Status Action Buttons */}
              {order.allowedNextStatuses.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                  {order.allowedNextStatuses.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        setTargetStatus(st);
                        setTransitionDialogOpen(true);
                      }}
                      className={`px-3.5 py-2 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                        st === "completed"
                          ? "bg-success text-surface hover:bg-success/90"
                          : st === "cancelled"
                            ? "border border-danger/40 text-danger hover:bg-danger-soft"
                            : "bg-brand text-white hover:bg-brand-hover"
                      }`}
                    >
                      <span>Advance to: {st.replace(/_/g, " ")}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs font-semibold text-ink-subtle italic">
                  Order is in terminal state ({order.status}). No further transitions allowed.
                </p>
              )}
            </div>
          </div>

          {/* Order Items Table */}
          <div className="bg-surface border border-line rounded-lg p-5 sm:p-6 space-y-4">
            <h2 className="font-heading font-bold text-base text-ink border-b border-line pb-3">
              Order Items ({order.items.length})
            </h2>

            <div className="divide-y divide-line">
              {order.items.map((item, i) => (
                <div key={i} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 bg-canvas border border-line rounded overflow-hidden shrink-0 flex items-center justify-center p-1">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          width={48}
                          height={48}
                          unoptimized
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Package className="w-5 h-5 text-ink-muted" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold text-xs text-ink truncate leading-tight">
                        {item.name}
                      </p>
                      {item.sku && (
                        <p className="text-[11px] font-mono text-ink-muted mt-0.5">
                          SKU: {item.sku}
                        </p>
                      )}
                      <p className="text-[11px] text-ink-muted font-mono mt-0.5">
                        <Price amount={item.unitPrice} /> × {item.quantity}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <Price
                      amount={item.unitPrice * item.quantity}
                      className="font-bold text-sm text-ink"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="border-t border-line pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-ink">
                <span className="text-ink-muted">Subtotal</span>
                <Price amount={order.subtotal} className="font-semibold" />
              </div>

              <div className="flex justify-between text-ink">
                <span className="text-ink-muted">Delivery Fee</span>
                {order.deliveryFee === 0 ? (
                  <span className="font-mono font-bold text-success">FREE</span>
                ) : (
                  <Price amount={order.deliveryFee} className="font-semibold" />
                )}
              </div>

              <div className="flex justify-between items-baseline pt-2 border-t border-line text-ink">
                <span className="font-heading font-bold text-base">Grand Total</span>
                <Price amount={order.total} className="font-heading font-bold text-xl text-ink" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customer Info, Notes, Timeline (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Customer & Address Details */}
          <div className="bg-surface border border-line rounded-lg p-5 space-y-4 text-xs">
            <h3 className="font-heading font-bold text-sm text-ink flex items-center gap-2 border-b border-line pb-2.5">
              <User className="w-4 h-4 text-ink-muted" />
              <span>Customer Details</span>
            </h3>

            <div className="space-y-2">
              <p className="font-semibold text-sm text-ink">{order.customer.name}</p>
              <div className="flex items-center gap-2 text-ink-muted">
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <a href={`tel:${order.customer.phone}`} className="font-mono hover:text-ink">
                  {order.customer.phone}
                </a>
              </div>
              <div className="flex items-center gap-2 text-ink-muted">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <a href={`mailto:${order.customer.email}`} className="hover:text-ink truncate">
                  {order.customer.email}
                </a>
              </div>
            </div>

            <div className="pt-3 border-t border-line space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-ink">
                <MapPin className="w-3.5 h-3.5 text-ink-muted" />
                <span>
                  {order.fulfillment === "delivery" ? "Delivery Address" : "Pickup Branch"}
                </span>
              </div>

              {order.fulfillment === "delivery" && order.deliveryAddress ? (
                <div className="text-ink-muted space-y-0.5">
                  <p>{order.deliveryAddress.line1}</p>
                  <p>
                    {order.deliveryAddress.city}, {order.deliveryAddress.region}
                  </p>
                  {order.deliveryZoneName && (
                    <p className="font-mono text-[11px] text-ink pt-1 font-medium">
                      Zone: {order.deliveryZoneName}
                    </p>
                  )}
                  {order.deliveryAddress.notes && (
                    <p className="text-ink-subtle italic pt-1">
                      Note: &ldquo;{order.deliveryAddress.notes}&rdquo;
                    </p>
                  )}
                </div>
              ) : order.pickupSnapshot ? (
                <div className="text-ink-muted space-y-0.5">
                  <p className="font-medium text-ink">{order.pickupSnapshot.name}</p>
                  <p>{order.pickupSnapshot.address}</p>
                  <p className="font-mono text-[11px]">
                    Hours: {order.pickupSnapshot.openingHours}
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          {/* Internal Staff Notes */}
          <div className="bg-surface border border-line rounded-lg p-5 space-y-3 text-xs">
            <h3 className="font-heading font-bold text-sm text-ink flex items-center gap-2">
              <FileText className="w-4 h-4 text-ink-muted" />
              <span>Internal Admin Notes</span>
            </h3>

            <textarea
              rows={3}
              value={internalNoteInput !== null ? internalNoteInput : order.internalNote || ""}
              onChange={(e) => setInternalNoteInput(e.target.value)}
              placeholder="Add internal remarks (rider dispatched, payment received via agent, etc.)..."
              className="w-full p-2.5 rounded-md border border-line-strong bg-surface text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            />

            <button
              type="button"
              disabled={isSavingNote || internalNoteInput === null}
              onClick={handleSaveInternalNote}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-brand text-white text-xs font-semibold hover:bg-brand-hover disabled:opacity-40"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavingNote ? "Saving..." : "Save Note"}</span>
            </button>
          </div>

          {/* Order Activity Timeline */}
          <div className="bg-surface border border-line rounded-lg p-5 space-y-3 text-xs">
            <h3 className="font-heading font-bold text-sm text-ink flex items-center gap-2 border-b border-line pb-2.5">
              <Clock className="w-4 h-4 text-ink-muted" />
              <span>Activity History ({order.events.length})</span>
            </h3>

            <div className="space-y-3 divide-y divide-line">
              {order.events.map((event) => (
                <div key={event._id} className="pt-2 space-y-0.5">
                  <p className="font-medium text-ink leading-snug">{event.message}</p>
                  <p className="text-[10px] text-ink-muted font-mono">
                    {new Date(event.createdAt).toLocaleDateString("en-GH", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reject MoMo Reference Dialog */}
      <ConfirmDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        title="Flag / Reject MoMo Payment"
        description="State why this MoMo transaction could not be verified (e.g. invalid reference, incorrect amount, transfer not reflected). The customer order will remain in awaiting payment."
        confirmLabel="Reject Payment"
        variant="danger"
        isLoading={isRejecting}
        onConfirm={handleConfirmReject}
      />

      {/* Advance Status Confirmation Dialog */}
      <ConfirmDialog
        open={transitionDialogOpen}
        onOpenChange={setTransitionDialogOpen}
        title={`Advance Status to ${targetStatus?.replace(/_/g, " ")}`}
        description={
          targetStatus === "completed"
            ? "Marking this order completed will permanently deduct physical stock from inventory."
            : targetStatus === "cancelled"
              ? "Cancelling this order will release all reserved stock back into available inventory."
              : `Are you sure you want to transition this order to "${targetStatus}"?`
        }
        confirmLabel={`Confirm: ${targetStatus?.replace(/_/g, " ")}`}
        variant={targetStatus === "cancelled" ? "danger" : "default"}
        isLoading={isTransitioning}
        onConfirm={handleConfirmStatusChange}
      />
    </div>
  );
}
