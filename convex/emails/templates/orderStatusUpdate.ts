/**
 * Order status update email template.
 * Generic template for status changes (processing, ready for pickup, etc.)
 */

import {
  wrapInLayout,
  wrapInLayoutText,
  LayoutData,
  buttonHtml,
  formatDateTime,
  escapeHtml,
} from "./layout";

export interface OrderStatusUpdateData extends LayoutData {
  orderNumber: string;
  customerName: string;
  status: string;
  statusLabel: string;
  message: string;
  trackingUrl: string;
  updatedAt: number;
}

export function render(data: OrderStatusUpdateData): { subject: string; html: string; text: string } {
  const subject = `Order ${data.orderNumber} ${data.statusLabel.toLowerCase()}`;

  const content = `
    <h1 style="margin: 0 0 10px 0; font-size: 22px; font-weight: 600; color: #14181F;">${escapeHtml(data.statusLabel)}</h1>
    <p style="margin: 10px 0; color: #6b7280;">Order ${escapeHtml(data.orderNumber)} • ${formatDateTime(data.updatedAt)}</p>
    
    <p style="margin: 20px 0;">${escapeHtml(data.message)}</p>

    ${buttonHtml("Track your order", data.trackingUrl)}

    <p style="margin: 20px 0 0 0; font-size: 13px; color: #6b7280;">Questions? Reply to this email or contact us.</p>
  `;

  const html = wrapInLayout(content, data);

  const text = wrapInLayoutText(`
${data.statusLabel.toUpperCase()}

Order ${data.orderNumber}
${formatDateTime(data.updatedAt)}

${data.message}

Track your order: ${data.trackingUrl}
  `.trim(), data);

  return { subject, html, text };
}
