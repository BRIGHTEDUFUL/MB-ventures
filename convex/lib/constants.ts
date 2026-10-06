/**
 * Shared domain constants for MB Ventures GH
 * Importable across backend (Convex) and frontend (Next.js)
 */

export const ORDER_STATUSES = [
  "pending_payment",
  "paid",
  "processing",
  "ready_for_pickup",
  "out_for_delivery",
  "completed",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = [
  "unpaid",
  "paid",
  "failed",
  "refund_pending",
  "refunded",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const FULFILLMENT_TYPES = ["delivery", "pickup"] as const;
export type FulfillmentType = (typeof FULFILLMENT_TYPES)[number];

export const USER_ROLES = ["customer", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const STOCK_ADJUSTMENT_REASONS = [
  "sale",
  "reservation_release",
  "manual",
  "restock",
  "cancel_restock",
  "import",
  "correction",
] as const;
export type StockAdjustmentReason = (typeof STOCK_ADJUSTMENT_REASONS)[number];

export const ORDER_EVENT_TYPES = [
  "status",
  "payment",
  "note",
  "email",
  "system",
] as const;
export type OrderEventType = (typeof ORDER_EVENT_TYPES)[number];

/**
 * Human-readable labels for order statuses
 */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Pending Payment",
  paid: "Paid",
  processing: "Processing",
  ready_for_pickup: "Ready for Pickup",
  out_for_delivery: "Out for Delivery",
  completed: "Completed",
  cancelled: "Cancelled",
};

/**
 * Badge styling / variants for order statuses
 */
export const ORDER_STATUS_BADGES: Record<
  OrderStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className: string }
> = {
  pending_payment: {
    label: "Pending Payment",
    variant: "secondary",
    className: "bg-amber-100 text-amber-800 border-amber-300",
  },
  paid: {
    label: "Paid",
    variant: "default",
    className: "bg-blue-100 text-blue-800 border-blue-300",
  },
  processing: {
    label: "Processing",
    variant: "secondary",
    className: "bg-indigo-100 text-indigo-800 border-indigo-300",
  },
  ready_for_pickup: {
    label: "Ready for Pickup",
    variant: "default",
    className: "bg-purple-100 text-purple-800 border-purple-300",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    variant: "default",
    className: "bg-cyan-100 text-cyan-800 border-cyan-300",
  },
  completed: {
    label: "Completed",
    variant: "default",
    className: "bg-emerald-100 text-emerald-800 border-emerald-300",
  },
  cancelled: {
    label: "Cancelled",
    variant: "destructive",
    className: "bg-rose-100 text-rose-800 border-rose-300",
  },
};

/**
 * Human-readable labels for payment statuses
 */
export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  paid: "Paid",
  failed: "Failed",
  refund_pending: "Refund Pending",
  refunded: "Refunded",
};

/**
 * Badge styling / variants for payment statuses
 */
export const PAYMENT_STATUS_BADGES: Record<
  PaymentStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className: string }
> = {
  unpaid: {
    label: "Unpaid",
    variant: "secondary",
    className: "bg-amber-100 text-amber-800 border-amber-300",
  },
  paid: {
    label: "Paid",
    variant: "default",
    className: "bg-emerald-100 text-emerald-800 border-emerald-300",
  },
  failed: {
    label: "Failed",
    variant: "destructive",
    className: "bg-rose-100 text-rose-800 border-rose-300",
  },
  refund_pending: {
    label: "Refund Pending",
    variant: "secondary",
    className: "bg-purple-100 text-purple-800 border-purple-300",
  },
  refunded: {
    label: "Refunded",
    variant: "outline",
    className: "bg-slate-100 text-slate-700 border-slate-300",
  },
};

/**
 * Human-readable labels for fulfillment types
 */
export const FULFILLMENT_LABELS: Record<FulfillmentType, string> = {
  delivery: "Standard Delivery",
  pickup: "In-Store Pickup",
};
