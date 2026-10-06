/**
 * Order status state machine.
 *
 * Rules:
 * - pending_payment -> paid | cancelled
 * - paid -> processing | cancelled
 * - processing -> ready_for_pickup (pickup only) | out_for_delivery (delivery only) | cancelled
 * - ready_for_pickup -> completed | cancelled
 * - out_for_delivery -> completed | cancelled
 * - completed and cancelled are final (no transitions allowed)
 */

import type { FulfillmentType, OrderStatus } from "./constants";

/**
 * Returns whether a transition from one status to another is valid given the order's fulfillment type.
 */
export function canTransition(
  from: OrderStatus,
  to: OrderStatus,
  fulfillment: FulfillmentType
): boolean {
  if (from === to) {
    return false;
  }

  // Completed and cancelled are final terminal states
  if (from === "completed" || from === "cancelled") {
    return false;
  }

  switch (from) {
    case "pending_payment":
      return to === "paid" || to === "cancelled";

    case "paid":
      return to === "processing" || to === "cancelled";

    case "processing":
      if (to === "cancelled") return true;
      if (fulfillment === "pickup") {
        return to === "ready_for_pickup";
      }
      if (fulfillment === "delivery") {
        return to === "out_for_delivery";
      }
      return false;

    case "ready_for_pickup":
      // Only applicable for pickup orders
      return to === "completed" || to === "cancelled";

    case "out_for_delivery":
      // Only applicable for delivery orders
      return to === "completed" || to === "cancelled";

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
}): OrderStatus[] {
  const { status, fulfillment } = order;

  switch (status) {
    case "pending_payment":
      return ["paid", "cancelled"];

    case "paid":
      return ["processing", "cancelled"];

    case "processing":
      if (fulfillment === "pickup") {
        return ["ready_for_pickup", "cancelled"];
      }
      return ["out_for_delivery", "cancelled"];

    case "ready_for_pickup":
      return ["completed", "cancelled"];

    case "out_for_delivery":
      return ["completed", "cancelled"];

    case "completed":
    case "cancelled":
    default:
      return [];
  }
}

/**
 * Helper to determine if an order is in a terminal state
 */
export function isTerminalStatus(status: OrderStatus): boolean {
  return status === "completed" || status === "cancelled";
}
