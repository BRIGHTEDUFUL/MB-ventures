/**
 * New order admin alert email.
 * Sent to admin when customer places an order.
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

export interface NewOrderAdminData extends LayoutData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  currency: string;
  paymentMethod: "momo" | "cash_on_delivery" | "pay_in_store";
  fulfillment: "delivery" | "pickup";
  momoReference?: string;
  adminOrderUrl: string;
  createdAt: number;
}

export function render(data: NewOrderAdminData): { subject: string; html: string; text: string } {
  const subject = `New order ${data.orderNumber} - ${formatMoney(data.total, data.currency)}`;

  const paymentMethodLabel = {
    momo: "Mobile money",
    cash_on_delivery: "Cash on delivery",
    pay_in_store: "Pay in store",
  }[data.paymentMethod];

  const fulfillmentLabel = data.fulfillment === "delivery" ? "Delivery" : "Pickup";

  const itemsHtml = data.items.map((item) => `
    <tr>
      <td style="padding: 6px 0; border-bottom: 1px solid #f3f4f6;">
        ${escapeHtml(item.name)} × ${item.quantity}
      </td>
      <td style="padding: 6px 0; border-bottom: 1px solid #f3f4f6; text-align: right;">
        ${formatMoney(item.price * item.quantity, data.currency)}
      </td>
    </tr>
  `).join("");

  const content = `
    <h1 style="margin: 0 0 10px 0; font-size: 20px; font-weight: 600; color: #14181F;">New order received</h1>
    <p style="margin: 10px 0; color: #6b7280;">Order ${escapeHtml(data.orderNumber)} • ${formatDateTime(data.createdAt)}</p>
    
    ${divider()}

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0; font-size: 14px;">
      <tr>
        <td style="padding: 4px 0; color: #6b7280;">Customer</td>
        <td style="padding: 4px 0; text-align: right; font-weight: 500;">${escapeHtml(data.customerName)}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0; color: #6b7280;">Email</td>
        <td style="padding: 4px 0; text-align: right;">${escapeHtml(data.customerEmail)}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0; color: #6b7280;">Phone</td>
        <td style="padding: 4px 0; text-align: right;">${escapeHtml(data.customerPhone)}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0; color: #6b7280;">Payment</td>
        <td style="padding: 4px 0; text-align: right;">${paymentMethodLabel}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0; color: #6b7280;">Fulfillment</td>
        <td style="padding: 4px 0; text-align: right;">${fulfillmentLabel}</td>
      </tr>
      ${data.momoReference ? `
      <tr>
        <td style="padding: 4px 0; color: #6b7280;">MoMo ref</td>
        <td style="padding: 4px 0; text-align: right; font-family: monospace; font-size: 13px;">${escapeHtml(data.momoReference)}</td>
      </tr>
      ` : ""}
    </table>

    ${divider()}

    <p style="margin: 15px 0 10px 0; font-weight: 600; font-size: 14px;">Order items</p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 10px 0; font-size: 14px;">
      ${itemsHtml}
      <tr>
        <td style="padding: 12px 0 0 0; font-size: 16px; font-weight: 600;">Total</td>
        <td style="padding: 12px 0 0 0; text-align: right; font-size: 16px; font-weight: 600;">${formatMoney(data.total, data.currency)}</td>
      </tr>
    </table>

    ${buttonHtml("View order in admin", data.adminOrderUrl)}

    <p style="margin: 20px 0 0 0; font-size: 13px; color: #6b7280;">This is an automated notification. Respond promptly to process the order.</p>
  `;

  const html = wrapInLayout(content, data);

  const text = wrapInLayoutText(`
NEW ORDER RECEIVED

Order ${data.orderNumber}
${formatDateTime(data.createdAt)}

CUSTOMER
${data.customerName}
${data.customerEmail}
${data.customerPhone}

Payment: ${paymentMethodLabel}
Fulfillment: ${fulfillmentLabel}
${data.momoReference ? `MoMo reference: ${data.momoReference}\n` : ""}
ORDER ITEMS
${data.items.map((item) => `${item.name} × ${item.quantity} - ${formatMoney(item.price * item.quantity, data.currency)}`).join("\n")}

Total: ${formatMoney(data.total, data.currency)}

View order: ${data.adminOrderUrl}
  `.trim(), data);

  return { subject, html, text };
}
