/**
 * Shared domain constants for MB Ventures GH
 * Importable across backend (Convex) and frontend (Next.js)
 *
 * Payment model: no payment gateway.
 *   - momo: customer manually sends Mobile Money, submits a reference number,
 *           admin verifies against the shop MoMo account and marks as paid.
 *   - cash_on_delivery: payment collected by rider on arrival.
 *   - pay_in_store: payment collected at the counter on pickup.
 */

// ---------------------------------------------------------------------------
// Order statuses
// ---------------------------------------------------------------------------

export const ORDER_STATUSES = [
  "pending",              // Order placed; waiting for next action
  "awaiting_momo",        // (MoMo only) Waiting for customer to submit transfer reference
  "pending_verification", // (MoMo only) Reference submitted; admin must verify
  "processing",           // Confirmed/accepted; being picked & packed
  "ready_for_pickup",     // Packed and waiting at pickup counter
  "out_for_delivery",     // Handed to rider for delivery
  "completed",            // Order fulfilled; goods received / picked up
  "cancelled",            // Cancelled (terminal)
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

// ---------------------------------------------------------------------------
// Payment methods
// ---------------------------------------------------------------------------

export const PAYMENT_METHODS = [
  "momo",             // Mobile Money — manual verification by admin
  "cash_on_delivery", // Pay cash when goods are delivered
  "pay_in_store",     // Pay at the store counter during pickup
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

// ---------------------------------------------------------------------------
// MoMo networks available in Ghana
// ---------------------------------------------------------------------------

export const MOMO_NETWORKS = [
  "MTN",
  "Telecel",   // formerly Vodafone Cash
  "AirtelTigo",
] as const;

export type MomoNetwork = (typeof MOMO_NETWORKS)[number];

// ---------------------------------------------------------------------------
// Payment statuses
// ---------------------------------------------------------------------------

export const PAYMENT_STATUSES = [
  "unpaid",               // Not yet paid (initial)
  "pending_verification", // MoMo reference submitted; awaiting admin confirmation
  "paid",                 // Confirmed paid (MoMo verified, or COD/in-store collected)
  "refunded",             // Refund issued
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

// ---------------------------------------------------------------------------
// Fulfillment types
// ---------------------------------------------------------------------------

export const FULFILLMENT_TYPES = ["delivery", "pickup"] as const;
export type FulfillmentType = (typeof FULFILLMENT_TYPES)[number];

// ---------------------------------------------------------------------------
// Other domain enums
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Human-readable labels
// ---------------------------------------------------------------------------

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  awaiting_momo: "Awaiting MoMo Transfer",
  pending_verification: "Verifying Payment",
  processing: "Processing",
  ready_for_pickup: "Ready for Pickup",
  out_for_delivery: "Out for Delivery",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  momo: "Mobile Money (MoMo)",
  cash_on_delivery: "Cash on Delivery",
  pay_in_store: "Pay In Store",
};

export const MOMO_NETWORK_LABELS: Record<MomoNetwork, string> = {
  MTN: "MTN MoMo",
  Telecel: "Telecel Cash",
  AirtelTigo: "AirtelTigo Money",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  pending_verification: "Awaiting Verification",
  paid: "Paid",
  refunded: "Refunded",
};

export const FULFILLMENT_LABELS: Record<FulfillmentType, string> = {
  delivery: "Home Delivery",
  pickup: "In-Store Pickup",
};

// ---------------------------------------------------------------------------
// Badge styling helpers (token-aligned, no arbitrary colors)
// ---------------------------------------------------------------------------

export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export const ORDER_STATUS_BADGES: Record<
  OrderStatus,
  { label: string; variant: BadgeVariant; className: string }
> = {
  pending: {
    label: "Pending",
    variant: "secondary",
    className: "bg-canvas text-ink-muted border-line",
  },
  awaiting_momo: {
    label: "Awaiting MoMo",
    variant: "secondary",
    className: "bg-warning-soft text-warning border-warning/30",
  },
  pending_verification: {
    label: "Verifying Payment",
    variant: "secondary",
    className: "bg-warning-soft text-warning border-warning/30",
  },
  processing: {
    label: "Processing",
    variant: "default",
    className: "bg-canvas-strong text-ink border-line-strong",
  },
  ready_for_pickup: {
    label: "Ready for Pickup",
    variant: "default",
    className: "bg-success-soft text-success border-success/30",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    variant: "default",
    className: "bg-success-soft text-success border-success/30",
  },
  completed: {
    label: "Completed",
    variant: "default",
    className: "bg-success-soft text-success border-success/30",
  },
  cancelled: {
    label: "Cancelled",
    variant: "destructive",
    className: "bg-danger-soft text-danger border-danger/30",
  },
};

export const PAYMENT_STATUS_BADGES: Record<
  PaymentStatus,
  { label: string; variant: BadgeVariant; className: string }
> = {
  unpaid: {
    label: "Unpaid",
    variant: "secondary",
    className: "bg-warning-soft text-warning border-warning/30",
  },
  pending_verification: {
    label: "Awaiting Verification",
    variant: "secondary",
    className: "bg-warning-soft text-warning border-warning/30",
  },
  paid: {
    label: "Paid",
    variant: "default",
    className: "bg-success-soft text-success border-success/30",
  },
  refunded: {
    label: "Refunded",
    variant: "outline",
    className: "bg-canvas text-ink-muted border-line",
  },
};
