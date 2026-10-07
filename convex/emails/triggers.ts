/**
 * Email trigger helpers.
 * Called from business logic mutations to schedule emails.
 */

import type { MutationCtx } from "../_generated/server";
import type { Id, Doc } from "../_generated/dataModel";
import { internal } from "../_generated/api";
import { getEmailConfig } from "./config";

/**
 * Schedule order confirmation email to customer.
 */
export async function triggerOrderConfirmation(
  ctx: MutationCtx,
  params: {
    order: Doc<"orders">;
    siteUrl: string;
    shopName: string;
    shopAddress?: string;
    contactEmail?: string;
    contactPhone?: string;
  }
) {
  const config = getEmailConfig();
  const order = params.order;

  // Build tracking URL
  const trackingUrl = order.userId
    ? `${params.siteUrl}/account/orders/${order.orderNumber}`
    : `${params.siteUrl}/order/${order.orderNumber}?token=${order.guestToken || ""}`;

  // Build delivery address if applicable
  const deliveryAddress = order.deliveryAddress
    ? {
        recipientName: order.customer.name, // Use customer name as recipient
        phone: order.customer.phone,
        line1: order.deliveryAddress.line1,
        line2: order.deliveryAddress.line2,
        city: order.deliveryAddress.city,
        region: order.deliveryAddress.region,
      }
    : undefined;

  // Build pickup location if applicable
  const pickupLocation = order.pickupSnapshot
    ? {
        name: order.pickupSnapshot.name,
        address: order.pickupSnapshot.address,
        phone: order.customer.phone, // Use customer phone
        openingHours: order.pickupSnapshot.openingHours,
      }
    : undefined;

  await ctx.scheduler.runAfter(0, internal.emails.send.send, {
    template: "orderConfirmation",
    to: order.customer.email,
    orderId: order._id,
    data: {
      shopName: params.shopName,
      shopAddress: params.shopAddress,
      contactEmail: params.contactEmail,
      contactPhone: params.contactPhone,
      orderNumber: order.orderNumber,
      customerName: order.customer.name,
      items: order.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.unitPrice,
      })),
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      total: order.total,
      currency: order.currency,
      paymentMethod: order.paymentMethod,
      fulfillment: order.fulfillment,
      deliveryAddress,
      pickupLocation,
      momoReference: order.momoReference,
      trackingUrl,
      createdAt: order.createdAt,
    },
  });
}

/**
 * Schedule new order admin alert.
 */
export async function triggerNewOrderAdmin(
  ctx: MutationCtx,
  params: {
    order: Doc<"orders">;
    siteUrl: string;
    shopName: string;
    shopAddress?: string;
    contactEmail?: string;
    contactPhone?: string;
  }
) {
  const config = getEmailConfig();
  
  if (!config.adminAlertEmail) {
    // No admin email configured, skip
    return;
  }

  const order = params.order;
  const adminOrderUrl = `${params.siteUrl}/admin/orders/${order._id}`;

  await ctx.scheduler.runAfter(0, internal.emails.send.send, {
    template: "newOrderAdmin",
    to: config.adminAlertEmail,
    orderId: order._id,
    data: {
      shopName: params.shopName,
      shopAddress: params.shopAddress,
      contactEmail: params.contactEmail,
      contactPhone: params.contactPhone,
      orderNumber: order.orderNumber,
      customerName: order.customer.name,
      customerEmail: order.customer.email,
      customerPhone: order.customer.phone,
      items: order.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.unitPrice,
      })),
      total: order.total,
      currency: order.currency,
      paymentMethod: order.paymentMethod,
      fulfillment: order.fulfillment,
      momoReference: order.momoReference,
      adminOrderUrl,
      createdAt: order.createdAt,
    },
  });
}

/**
 * Schedule order status update email.
 */
export async function triggerOrderStatusUpdate(
  ctx: MutationCtx,
  params: {
    order: Doc<"orders">;
    statusLabel: string;
    message: string;
    siteUrl: string;
    shopName: string;
    shopAddress?: string;
    contactEmail?: string;
    contactPhone?: string;
  }
) {
  const order = params.order;

  const trackingUrl = order.userId
    ? `${params.siteUrl}/account/orders/${order.orderNumber}`
    : `${params.siteUrl}/order/${order.orderNumber}?token=${order.guestToken || ""}`;

  await ctx.scheduler.runAfter(0, internal.emails.send.send, {
    template: "orderStatusUpdate",
    to: order.customer.email,
    orderId: order._id,
    data: {
      shopName: params.shopName,
      shopAddress: params.shopAddress,
      contactEmail: params.contactEmail,
      contactPhone: params.contactPhone,
      orderNumber: order.orderNumber,
      customerName: order.customer.name,
      status: order.status,
      statusLabel: params.statusLabel,
      message: params.message,
      trackingUrl,
      updatedAt: Date.now(),
    },
  });
}

/**
 * Schedule contact message admin alert.
 */
export async function triggerNewContactMessage(
  ctx: { scheduler: any },
  params: {
    name: string;
    email: string;
    phone?: string;
    message: string;
    siteUrl: string;
    shopName: string;
    shopAddress?: string;
    contactEmail?: string;
    contactPhone?: string;
  }
) {
  const config = getEmailConfig();
  
  if (!config.adminAlertEmail) {
    return;
  }

  const adminMessagesUrl = `${params.siteUrl}/admin/messages`;

  await ctx.scheduler.runAfter(0, internal.emails.send.send, {
    template: "newContactMessage",
    to: config.adminAlertEmail,
    data: {
      shopName: params.shopName,
      shopAddress: params.shopAddress,
      contactEmail: params.contactEmail,
      contactPhone: params.contactPhone,
      name: params.name,
      email: params.email,
      phone: params.phone,
      message: params.message,
      adminMessagesUrl,
      createdAt: Date.now(),
    },
  });
}
