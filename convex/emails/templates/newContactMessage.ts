/**
 * New contact message admin alert.
 * Sent when someone submits the contact form.
 */

import {
  wrapInLayout,
  wrapInLayoutText,
  LayoutData,
  buttonHtml,
  formatDateTime,
  escapeHtml,
  divider,
} from "./layout";

export interface NewContactMessageData extends LayoutData {
  name: string;
  email: string;
  phone?: string;
  message: string;
  adminMessagesUrl: string;
  createdAt: number;
}

export function render(data: NewContactMessageData): { subject: string; html: string; text: string } {
  const subject = `New contact message from ${data.name}`;

  const content = `
    <h1 style="margin: 0 0 10px 0; font-size: 20px; font-weight: 600; color: #14181F;">New contact message</h1>
    <p style="margin: 10px 0; color: #6b7280;">${formatDateTime(data.createdAt)}</p>
    
    ${divider()}

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0; font-size: 14px;">
      <tr>
        <td style="padding: 4px 0; color: #6b7280;">Name</td>
        <td style="padding: 4px 0; text-align: right; font-weight: 500;">${escapeHtml(data.name)}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0; color: #6b7280;">Email</td>
        <td style="padding: 4px 0; text-align: right;">${escapeHtml(data.email)}</td>
      </tr>
      ${data.phone ? `
      <tr>
        <td style="padding: 4px 0; color: #6b7280;">Phone</td>
        <td style="padding: 4px 0; text-align: right;">${escapeHtml(data.phone)}</td>
      </tr>
      ` : ""}
    </table>

    ${divider()}

    <p style="margin: 15px 0 10px 0; font-weight: 600; font-size: 14px;">Message</p>
    <div style="margin: 10px 0; padding: 15px; background-color: #f9fafb; border-left: 3px solid #2563eb; white-space: pre-wrap; font-size: 14px; line-height: 1.6;">
${escapeHtml(data.message)}
    </div>

    ${buttonHtml("View in admin", data.adminMessagesUrl)}

    <p style="margin: 20px 0 0 0; font-size: 13px; color: #6b7280;">Reply directly to this email to respond to the customer.</p>
  `;

  const html = wrapInLayout(content, data);

  const text = wrapInLayoutText(`
NEW CONTACT MESSAGE

${formatDateTime(data.createdAt)}

FROM
${data.name}
${data.email}
${data.phone || ""}

MESSAGE
${data.message}

View in admin: ${data.adminMessagesUrl}

Reply directly to respond to the customer.
  `.trim(), data);

  return { subject, html, text };
}
