/**
 * Base email layout with consistent styling.
 * Table-based for email client compatibility.
 */

export interface LayoutData {
  shopName: string;
  shopAddress?: string;
  contactEmail?: string;
  contactPhone?: string;
  logoUrl?: string;
}

/**
 * Wrap content in the base email layout.
 */
export function wrapInLayout(content: string, data: LayoutData): string {
  const logoHtml = data.logoUrl
    ? `<img src="${escapeHtml(data.logoUrl)}" alt="${escapeHtml(data.shopName)}" style="max-height: 40px; margin-bottom: 20px;" />`
    : `<div style="font-size: 24px; font-weight: bold; color: #14181F; margin-bottom: 20px;">${escapeHtml(data.shopName)}</div>`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>${escapeHtml(data.shopName)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, Helvetica, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 20px 10px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 30px 30px 20px 30px; text-align: center; border-bottom: 1px solid #e5e7eb;">
              ${logoHtml}
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 30px; color: #14181F; font-size: 15px; line-height: 1.6;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center; font-size: 13px; color: #6b7280; line-height: 1.5;">
              ${escapeHtml(data.shopName)}<br>
              ${data.shopAddress ? `${escapeHtml(data.shopAddress)}<br>` : ""}
              ${data.contactEmail ? `<a href="mailto:${escapeHtml(data.contactEmail)}" style="color: #2563eb; text-decoration: none;">${escapeHtml(data.contactEmail)}</a><br>` : ""}
              ${data.contactPhone ? `${escapeHtml(data.contactPhone)}<br>` : ""}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text version from shop data.
 */
export function wrapInLayoutText(content: string, data: LayoutData): string {
  const header = `${data.shopName}\n${"=".repeat(data.shopName.length)}\n\n`;
  
  const footer = [
    "",
    "---",
    data.shopName,
    data.shopAddress,
    data.contactEmail,
    data.contactPhone,
  ].filter(Boolean).join("\n");

  return `${header}${content}\n${footer}`;
}

/**
 * Common button style for CTAs.
 */
export function buttonHtml(text: string, url: string): string {
  return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 20px 0;">
  <tr>
    <td style="border-radius: 4px; background-color: #2563eb;">
      <a href="${escapeHtml(url)}" style="display: inline-block; padding: 12px 24px; font-size: 15px; color: #ffffff; text-decoration: none; font-weight: 500;">${escapeHtml(text)}</a>
    </td>
  </tr>
</table>
  `.trim();
}

/**
 * Format money amount.
 */
export function formatMoney(amount: number, currency: string): string {
  const symbol = currency === "GHS" ? "GHS " : currency;
  const value = (amount / 100).toFixed(2);
  return `${symbol}${value}`;
}

/**
 * Format date and time.
 */
export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/**
 * Format date only.
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-GB", { dateStyle: "medium" });
}

/**
 * Escape HTML to prevent XSS.
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char] || char);
}

/**
 * Divider line.
 */
export function divider(): string {
  return '<div style="border-top: 1px solid #e5e7eb; margin: 20px 0;"></div>';
}
