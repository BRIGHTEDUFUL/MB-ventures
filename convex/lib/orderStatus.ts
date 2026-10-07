/**
 * Order status state machine for MB Ventures GH.
 *
 * Payment model summary:
 *   momo            → customer sends MoMo manually → submits reference → admin verifies
 *   cash_on_delivery → payment collected on delivery (no upfront payment)
 *   pay_in_store    → payment collected at pickup counter (no upfront payment)
 *
 * Valid status transitions:
 *
 *  [MoMo orders]
 *    pending → awaiting_momo → pending_verification → processing
 *
 *  [COD / pay-in-store orders]
 *    pending → processing
 *
 *  [All orders, once processing]
 *    processing → ready_for_pickup  (pickup fulfillment)
 *    processing → out_for_delivery  (delivery fulfillment)
 *    ready_for_pickup → completed
 *    out_for_delivery → completed
 *
 *  [Any non-terminal status]
 *    any → cancelled
 *
 *  [Terminal states — no further transitions]
 *    completed, cancelled
 */

import type { FulfillmentType, OrderStatus, PaymentMethod } from "./constants";

/**
 * Returns whether a transition from one status to another is valid
 * given the order's fulfillment type and payment method.
 */
export function canTransition(
  from: OrderStatus,
  to: OrderStatus,
  fulfillment: FulfillmentType,
  paymentMethod: PaymentMethod
): boolean {
  if (from === to) return false;

  // Terminal states — no further transitions allowed
  if (from === "completed" || from === "cancelled") return false;

  // Cancellation is always allowed from any non-terminal state
  if (to === "cancelled") return true;

  switch (from) {
    case "pending":
      if (paymentMethod === "momo") return to === "awaiting_momo";
      // COD and pay-in-store skip straight to processing
      return to === "processing";

    case "awaiting_momo":
      // Admin or customer submits reference → moves to verification queue
      return to === "pending_verification";

    case "pending_verification":
      // Admin confirms MoMo transfer received → order enters processing
      return to === "processing";

    case "processing":
      if (fulfillment === "pickup") return to === "ready_for_pickup";
      if (fulfillment === "delivery") return to === "out_for_delivery";
      return false;

    case "ready_for_pickup":
      return to === "completed";

    case "out_for_delivery":
      return to === "completed";

    default:
      return false;
  }
}

/**
 * Returns the list of valid next statuses for a given order.
 */
export function allowedNextStatuses(order: {
  status: OrderStatus;
  fulfillment: FulfillmentType;
  paymentMethod: PaymentMethod;
}): OrderStatus[] {
  const { status, fulfillment, paymentMethod } = order;

  if (status === "completed" || status === "cancelled") return [];

  // Build forward targets (excluding cancel — always appended below)
  let forward: OrderStatus[] = [];

  switch (status) {
    case "pending":
      forward = paymentMethod === "momo" ? ["awaiting_momo"] : ["processing"];
      break;
    case "awaiting_momo":
      forward = ["pending_verification"];
      break;
    case "pending_verification":
      forward = ["processing"];
      break;
    case "processing":
      forward = fulfillment === "pickup"
        ? ["ready_for_pickup"]
        : ["out_for_delivery"];
      break;
    case "ready_for_pickup":
    case "out_for_delivery":
      forward = ["completed"];
      break;
  }

  return [...forward, "cancelled"];
}

/**
 * Returns true if the status is terminal (no further transitions possible).
 */
export function isTerminalStatus(status: OrderStatus): boolean {
  return status === "completed" || status === "cancelled";
}

/**
 * Returns true if the order is waiting for the admin to act on a MoMo reference.
 */
export function needsMomoVerification(status: OrderStatus): boolean {
  return status === "pending_verification";
}

/**
 * Returns true if the order is in any unconfirmed payment state
 * (i.e. we should still hold reserved stock).
 */
export function isPaymentPending(
  status: OrderStatus,
  paymentMethod: PaymentMethod
): boolean {
  if (paymentMethod === "momo") {
    return (
      status === "pending" ||
      status === "awaiting_momo" ||
      status === "pending_verification"
    );
  }
  // COD and pay-in-store are treated as confirmed once placed
  return false;
}
