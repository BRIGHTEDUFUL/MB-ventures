"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Container } from "@/components/shared/Container";
import { Price } from "@/components/shared/Price";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  CheckCircle2,
  Clock,
  Truck,
  Store,
  CreditCard,
  Copy,
  Check,
  MessageSquare,
  ArrowRight,
  AlertCircle,
  PackageCheck,
} from "lucide-react";

type MomoNetwork = "MTN" | "Telecel" | "AirtelTigo";

export default function OrderStatusPage() {
  const params = useParams();
  const orderNumber = String(params.orderNumber);

  const order = useQuery(api.orders.getByOrderNumber, { orderNumber });
  const submitReference = useMutation(api.orders.submitMomoReference);

  const [copied, setCopied] = useState(false);
  const [network, setNetwork] = useState<MomoNetwork>("MTN");
  const [senderPhone, setSenderPhone] = useState("");
  const [reference, setReference] = useState("");
  const [isSubmittingRef, setIsSubmittingRef] = useState(false);

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    toast.success("Order number copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReferenceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim()) {
      toast.error("Please enter the MoMo transaction reference or ID.");
      return;
    }
    if (!senderPhone.trim()) {
      toast.error("Please enter the sender phone number.");
      return;
    }

    setIsSubmittingRef(true);
    try {
      await submitReference({
        orderNumber,
        momoNetwork: network,
        momoPhone: senderPhone.trim(),
        momoReference: reference.trim(),
      });
      toast.success("Payment reference submitted! Admin will verify shortly.");
      setReference("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to submit reference.";
      toast.error(message);
    } finally {
      setIsSubmittingRef(false);
    }
  };

  if (order === undefined) {
    return (
      <div className="py-16 bg-canvas min-h-[calc(100dvh-180px)]">
        <Container>
          <div className="max-w-md mx-auto bg-surface border border-line rounded-lg p-8 text-center animate-pulse">
            <div className="w-12 h-12 rounded-full bg-canvas-strong mx-auto mb-4" />
            <div className="h-5 bg-canvas-strong rounded w-3/4 mx-auto mb-2" />
            <div className="h-4 bg-canvas-strong rounded w-1/2 mx-auto" />
          </div>
        </Container>
      </div>
    );
  }

  if (order === null) {
    return (
      <div className="py-16 bg-canvas min-h-[calc(100dvh-180px)]">
        <Container>
          <div className="max-w-md mx-auto bg-surface border border-line rounded-lg p-8 text-center">
            <AlertCircle className="w-12 h-12 text-warning mx-auto mb-3" />
            <h1 className="font-heading font-bold text-xl text-ink mb-2">Order Not Found</h1>
            <p className="text-sm text-ink-muted mb-6">
              We could not find an order matching reference &ldquo;{orderNumber}&rdquo;. Please
              verify your order number or contact customer support.
            </p>
            <Link
              href="/catalog"
              className="inline-flex min-h-11 items-center justify-center px-5 py-2.5 rounded-md font-semibold text-sm bg-brand text-white hover:bg-brand-hover transition-colors"
            >
              Back to Catalog
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  // Determine status badge config
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "awaiting_momo":
        return {
          label: "Awaiting MoMo Payment",
          variant: "warning" as const,
          desc: "Please complete the manual MoMo transfer to shop account.",
        };
      case "pending_verification":
        return {
          label: "Payment Verification in Progress",
          variant: "secondary" as const,
          desc: "MoMo reference received. Admin is verifying transfer.",
        };
      case "processing":
        return {
          label: "Processing Order",
          variant: "outline" as const,
          desc: "Order is being packed and prepared for fulfillment.",
        };
      case "ready_for_pickup":
        return {
          label: "Ready for Pickup",
          variant: "success" as const,
          desc: "Your order is ready for collection at our store.",
        };
      case "out_for_delivery":
        return {
          label: "Out for Delivery",
          variant: "outline" as const,
          desc: "Your package is with the dispatch rider in transit.",
        };
      case "completed":
        return {
          label: "Order Completed",
          variant: "success" as const,
          desc: "Order has been delivered/collected and closed.",
        };
      case "cancelled":
        return {
          label: "Cancelled",
          variant: "destructive" as const,
          desc: "This order was cancelled.",
        };
      default:
        return {
          label: status,
          variant: "outline" as const,
          desc: "Order is in progress.",
        };
    }
  };

  const statusInfo = getStatusBadge(order.status);
  const isMomoPending =
    order.paymentMethod === "momo" &&
    (order.status === "awaiting_momo" || order.status === "pending_verification");

  const whatsappMessage = encodeURIComponent(
    `Hello MB Ventures, I am inquiring about my Order ${order.orderNumber}. (Total: GHS ${(order.total / 100).toFixed(2)})`
  );

  return (
    <div className="py-6 sm:py-10 bg-canvas min-h-screen">
      <Container>
        {/* Top Success Banner */}
        <div className="bg-surface border border-line rounded-lg p-6 sm:p-8 mb-8 text-center max-w-3xl mx-auto">
          <div className="w-14 h-14 rounded-full bg-success/15 border border-success/30 flex items-center justify-center text-success mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 stroke-[2]" />
          </div>

          <span className="text-xs font-mono uppercase tracking-widest text-ink-muted block mb-1">
            Thank You For Your Order
          </span>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-ink tracking-tight mb-3">
            Order Confirmed
          </h1>

          <div className="inline-flex items-center gap-2 bg-canvas border border-line px-3.5 py-1.5 rounded-md text-sm font-mono font-semibold text-ink mb-4">
            <span>{order.orderNumber}</span>
            <button
              type="button"
              onClick={handleCopyOrderNumber}
              className="text-ink-muted hover:text-ink w-11 h-11 -m-1.5 flex items-center justify-center rounded transition-colors"
              aria-label="Copy order number"
            >
              {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
            <Badge variant={statusInfo.variant} className="text-xs px-3 py-1 font-semibold">
              {statusInfo.label}
            </Badge>
          </div>
          <p className="text-xs text-ink-muted max-w-md mx-auto">{statusInfo.desc}</p>
        </div>

        {/* Main Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto items-start">
          {/* Left Column: Payment Action / Fulfillment Details (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* MoMo Payment & Reference Submission Box */}
            {isMomoPending && (
              <div className="bg-surface border-2 border-warning/50 rounded-lg p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-warning shrink-0" />
                  <h2 className="font-heading font-bold text-base text-ink">
                    Mobile Money Payment Instructions
                  </h2>
                </div>

                <div className="text-xs text-ink space-y-2">
                  <p>
                    Please transfer the exact amount of{" "}
                    <strong className="text-sm font-mono font-bold text-ink">
                      GHS {(order.total / 100).toFixed(2)}
                    </strong>{" "}
                    to one of our official shop MoMo numbers:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono">
                    {order.shopMomoAccounts && order.shopMomoAccounts.length > 0 ? (
                      order.shopMomoAccounts.map((acc, i) => (
                        <div key={i} className="p-2.5 bg-canvas border border-line rounded">
                          <span className="font-bold text-ink block">{acc.network} MoMo</span>
                          <span className="text-sm font-bold text-ink block">{acc.number}</span>
                          <span className="text-[11px] text-ink-muted block">{acc.name}</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-2.5 bg-canvas border border-line rounded col-span-2">
                        <span className="font-bold text-ink block">MTN Mobile Money</span>
                        <span className="text-sm font-bold text-ink block">024 123 4567</span>
                        <span className="text-[11px] text-ink-muted block">MB VENTURES GH</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Reference Form */}
                <form
                  onSubmit={handleReferenceSubmit}
                  className="pt-3 border-t border-line space-y-3"
                >
                  <p className="text-xs font-semibold text-ink">
                    {order.momoReference
                      ? `Submitted Reference: ${order.momoReference} (Update if needed)`
                      : "Submit Your MoMo Transaction ID / Reference:"}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-ink-muted mb-1">
                        Network
                      </label>
                      <select
                        value={network}
                        onChange={(e) => setNetwork(e.target.value as MomoNetwork)}
                        className="w-full h-11 px-2.5 rounded border border-line-strong bg-surface text-xs text-ink"
                      >
                        <option value="MTN">MTN MoMo</option>
                        <option value="Telecel">Telecel Cash</option>
                        <option value="AirtelTigo">AirtelTigo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-ink-muted mb-1">
                        Your MoMo Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                        placeholder="024xxxxxxx"
                        className="w-full h-11 px-3 rounded border border-line-strong bg-surface text-xs text-ink font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-ink-muted mb-1">
                      Transaction Reference / ID
                    </label>
                    <input
                      type="text"
                      required
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="e.g. 1928374652"
                      className="w-full h-11 px-3 rounded border border-line-strong bg-surface text-xs text-ink font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingRef}
                    className="w-full h-11 rounded-md font-semibold text-xs bg-brand text-white hover:bg-brand-hover transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmittingRef ? "Submitting..." : "Submit MoMo Reference"}
                  </button>
                </form>
              </div>
            )}

            {/* Fulfillment & Delivery Info Card */}
            <div className="bg-surface border border-line rounded-lg p-5 sm:p-6 space-y-4">
              <h2 className="font-heading font-bold text-base text-ink flex items-center gap-2">
                {order.fulfillment === "delivery" ? (
                  <Truck className="w-5 h-5 text-ink-muted" />
                ) : (
                  <Store className="w-5 h-5 text-ink-muted" />
                )}
                <span>
                  {order.fulfillment === "delivery"
                    ? "Delivery Details"
                    : "In-Store Pickup Details"}
                </span>
              </h2>

              <div className="text-xs text-ink space-y-2 divide-y divide-line">
                <div className="pb-2 space-y-1">
                  <p className="font-semibold text-ink">{order.customer.name}</p>
                  <p className="text-ink-muted font-mono">{order.customer.phone}</p>
                  <p className="text-ink-muted">{order.customer.email}</p>
                </div>

                {order.fulfillment === "delivery" && order.deliveryAddress ? (
                  <div className="pt-2 space-y-1">
                    <p className="font-medium text-ink">Address:</p>
                    <p className="text-ink-muted">{order.deliveryAddress.line1}</p>
                    <p className="text-ink-muted">
                      {order.deliveryAddress.city}, {order.deliveryAddress.region}
                    </p>
                    {order.deliveryZoneName && (
                      <p className="text-ink-muted font-mono pt-1">
                        Zone: {order.deliveryZoneName}
                      </p>
                    )}
                    {order.deliveryAddress.notes && (
                      <p className="text-ink-subtle italic pt-1">
                        Notes: &ldquo;{order.deliveryAddress.notes}&rdquo;
                      </p>
                    )}
                  </div>
                ) : order.pickupSnapshot ? (
                  <div className="pt-2 space-y-1">
                    <p className="font-medium text-ink">{order.pickupSnapshot.name}</p>
                    <p className="text-ink-muted">{order.pickupSnapshot.address}</p>
                    <p className="text-ink-muted font-mono">
                      Hours: {order.pickupSnapshot.openingHours}
                    </p>
                  </div>
                ) : null}

                <div className="pt-2 flex justify-between items-center text-xs">
                  <span className="text-ink-muted">Payment Method</span>
                  <span className="font-medium text-ink uppercase">
                    {order.paymentMethod.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Timeline / Events */}
            {order.events && order.events.length > 0 && (
              <div className="bg-surface border border-line rounded-lg p-5 sm:p-6 space-y-3">
                <h3 className="font-heading font-semibold text-sm text-ink flex items-center gap-2">
                  <Clock className="w-4 h-4 text-ink-muted" />
                  <span>Order Activity Timeline</span>
                </h3>

                <div className="space-y-3 text-xs divide-y divide-line pt-1">
                  {order.events.map((event) => (
                    <div key={event._id} className="pt-2.5 flex items-start gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-ink mt-1.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-ink">{event.message}</p>
                        <p className="text-[11px] text-ink-muted font-mono mt-0.5">
                          {new Date(event.createdAt).toLocaleDateString("en-GH", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Order Items Summary & WhatsApp CTA (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-surface border border-line rounded-lg p-5 sm:p-6 space-y-4">
              <h2 className="font-heading font-bold text-base text-ink border-b border-line pb-3">
                Purchased Items ({order.items.length})
              </h2>

              <div className="divide-y divide-line space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="pt-2 flex items-center gap-3">
                    <div className="relative w-12 h-12 bg-canvas border border-line rounded overflow-hidden shrink-0 flex items-center justify-center p-1">
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
                        <PackageCheck className="w-5 h-5 text-ink-muted" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-ink truncate leading-tight">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-ink-muted font-mono mt-0.5">
                        Qty: {item.quantity} × <Price amount={item.unitPrice} />
                      </p>
                    </div>

                    <div className="text-right">
                      <Price
                        amount={item.unitPrice * item.quantity}
                        className="font-semibold text-xs text-ink"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 pt-3 border-t border-line text-xs">
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
                  <span className="font-heading font-bold text-base">Total</span>
                  <Price amount={order.total} className="font-heading font-bold text-xl text-ink" />
                </div>
              </div>
            </div>

            {/* Quick Actions / WhatsApp */}
            <div className="bg-surface border border-line rounded-lg p-4 space-y-2.5">
              <a
                href={`https://wa.me/${order.shopContact.whatsapp.replace(/[^0-9]/g, "")}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-11 px-4 rounded-md font-semibold text-xs bg-success text-surface hover:bg-success/90 transition-colors flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat on WhatsApp regarding this Order</span>
              </a>

              <Link
                href="/catalog"
                className="w-full h-11 rounded-md font-medium text-xs border border-line hover:border-line-strong hover:bg-canvas text-ink transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Continue Shopping</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
