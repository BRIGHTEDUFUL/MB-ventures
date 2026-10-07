/**
 * Order confirmation email template.
 * Sent immediately after order is placed.
 */

import {
  wrapInLayout,
  wrapInLayoutText,
  LayoutData,
  buttonHtml,
  formatMoney,
  formatDateTime,
  escapeHtml,
  divider,
} from "./layout";

export interface OrderConfirmationData extends LayoutData {
  orderNumber: string;
  customerName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
  paymentMethod: "momo" | "cash_on_delivery" | "pay_in_store";
  fulfillment: "delivery" | "pickup";
  deliveryAddress?: {
    recipientName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    region: string;
  };
  pickupLocation?: {
    name: string;
    address: string;
    phone: string;
    openingHours: string;
  };
  momoReference?: string;
  trackingUrl: string;
  createdAt: number;
}

export function render(data: OrderConfirmationData): { subject: string; html: string; text: string } {
  const subject = `Order ${data.orderNumber} confirmed`;

  const paymentMethodLabel = {
    momo: "Mobile money",
    cash_on_delivery: "Cash on delivery",
    pay_in_store: "Pay in store",
  }[data.paymentMethod];

  const itemsHtml = data.items.map((item) => `
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
        ${escapeHtml(item.name)} × ${item.quantity}
      </td>
      <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; text-align: right; white-space: nowrap;">
        ${formatMoney(item.price * item.quantity, data.currency)}
      </td>
    </tr>
  `).join("");

  const deliveryHtml = data.fulfillment === "delivery" && data.deliveryAddress ? `
    <p style="margin: 20px 0 5px 0; font-weight: 600;">Delivery address</p>
    <p style="margin: 5px 0; line-height: 1.5;">
      ${escapeHtml(data.deliveryAddress.recipientName)}<br>
      ${escapeHtml(data.deliveryAddress.phone)}<br>
      ${escapeHtml(data.deliveryAddress.line1)}<br>
      ${data.deliveryAddress.line2 ? `${escapeHtml(data.deliveryAddress.line2)}<br>` : ""}
      ${escapeHtml(data.deliveryAddress.city)}, ${escapeHtml(data.deliveryAddress.region)}
    </p>
  ` : "";

  const pickupHtml = data.fulfillment === "pickup" && data.pickupLocation ? `
    <p style="margin: 20px 0 5px 0; font-weight: 600;">Pickup location</p>
    <p style="margin: 5px 0; line-height: 1.5;">
      ${escapeHtml(data.pickupLocation.name)}<br>
      ${escapeHtml(data.pickupLocation.address)}<br>
      ${escapeHtml(data.pickupLocation.phone)}<br>
      <span style="color: #6b7280;">${escapeHtml(data.pickupLocation.openingHours)}</span>
    </p>
  ` : "";

  const momoHtml = data.momoReference ? `
    <p style="margin: 15px 0 5px 0; font-weight: 600;">Mobile money reference</p>
    <p style="margin: 5px 0; font-family: monospace; font-size: 14px;">${escapeHtml(data.momoReference)}</p>
  ` : "";

  const content = `
    <h1 style="margin: 0 0 10px 0; font-size: 22px; font-weight: 600; color: #14181F;">Order confirmed</h1>
    <p style="margin: 10px 0; color: #6b7280;">Order ${escapeHtml(data.orderNumber)} • ${formatDateTime(data.createdAt)}</p>
    
    <p style="margin: 20px 0;">Thank you for your order, ${escapeHtml(data.customerName)}. We have received your order and will process it shortly.</p>

    ${divider()}

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0;">
      ${itemsHtml}
      <tr>
        <td style="padding: 12px 0 4px 0; font-weight: 600;">Subtotal</td>
        <td style="padding: 12px 0 4px 0; text-align: right;">${formatMoney(data.subtotal, data.currency)}</td>
      </tr>
      ${data.deliveryFee > 0 ? `
      <tr>
        <td style="padding: 4px 0;">Delivery fee</td>
        <td style="padding: 4px 0; text-align: right;">${formatMoney(data.deliveryFee, data.currency)}</td>
      </tr>
      ` : ""}
      <tr>
        <td style="padding: 4px 0 12px 0; font-size: 17px; font-weight: 600;">Total</td>
        <td style="padding: 4px 0 12px 0; text-align: right; font-size: 17px; font-weight: 600;">${formatMoney(data.total, data.currency)}</td>
      </tr>
    </table>

    ${divider()}

    <p style="margin: 20px 0 5px 0; font-weight: 600;">Payment method</p>
    <p style="margin: 5px 0;">${paymentMethodLabel}</p>
    ${momoHtml}

    ${deliveryHtml}
    ${pickupHtml}

    ${buttonHtml("Track your order", data.trackingUrl)}

    <p style="margin: 20px 0 0 0; font-size: 13px; color: #6b7280;">Questions about your order? Reply to this email or contact us.</p>
  `;

  const html = wrapInLayout(content, data);

  // Plain text version
  const text = wrapInLayoutText(`
ORDER CONFIRMED

Order ${data.orderNumber}
${formatDateTime(data.createdAt)}

Thank you for your order, ${data.customerName}. We have received your order and will process it shortly.

ITEMS
${data.items.map((item) => `${item.name} × ${item.quantity} - ${formatMoney(item.price * item.quantity, data.currency)}`).join("\n")}

Subtotal: ${formatMoney(data.subtotal, data.currency)}
${data.deliveryFee > 0 ? `Delivery fee: ${formatMoney(data.deliveryFee, data.currency)}\n` : ""}Total: ${formatMoney(data.total, data.currency)}

PAYMENT METHOD
${paymentMethodLabel}
${data.momoReference ? `Reference: ${data.momoReference}\n` : ""}
${data.fulfillment === "delivery" && data.deliveryAddress ? `
DELIVERY ADDRESS
${data.deliveryAddress.recipientName}
${data.deliveryAddress.phone}
${data.deliveryAddress.line1}
${data.deliveryAddress.line2 || ""}
${data.deliveryAddress.city}, ${data.deliveryAddress.region}
` : ""}
${data.fulfillment === "pickup" && data.pickupLocation ? `
PICKUP LOCATION
${data.pickupLocation.name}
${data.pickupLocation.address}
${data.pickupLocation.phone}
${data.pickupLocation.openingHours}
` : ""}
Track your order: ${data.trackingUrl}

Questions? Reply to this email or contact us.
  `.trim(), data);

  return { subject, html, text };
}
