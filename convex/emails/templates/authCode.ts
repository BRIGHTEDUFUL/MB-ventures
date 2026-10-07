/**
 * Authentication code email template.
 * Used for email verification and password reset.
 */

import {
  wrapInLayout,
  wrapInLayoutText,
  LayoutData,
  escapeHtml,
} from "./layout";

export interface AuthCodeData extends LayoutData {
  code: string;
  purpose: "verification" | "reset";
  expiryMinutes: number;
}

export function render(data: AuthCodeData): { subject: string; html: string; text: string } {
  const isVerification = data.purpose === "verification";
  
  const subject = isVerification 
    ? "Verify your email address"
    : "Reset your password";

  const title = isVerification
    ? "Verify your email"
    : "Reset your password";

  const message = isVerification
    ? "Thank you for signing up. Please use the code below to verify your email address and complete your registration."
    : "We received a request to reset your password. Use the code below to create a new password. If you did not request this, please ignore this email.";

  const content = `
    <h1 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 600; color: #14181F;">${title}</h1>
    
    <p style="margin: 20px 0;">${message}</p>

    <div style="margin: 30px 0; padding: 20px; background-color: #f9fafb; border: 2px solid #e5e7eb; border-radius: 6px; text-align: center;">
      <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #2563eb; font-family: monospace;">
        ${escapeHtml(data.code)}
      </div>
    </div>

    <p style="margin: 20px 0; font-size: 14px; color: #6b7280;">This code will expire in ${data.expiryMinutes} minutes.</p>

    <p style="margin: 30px 0 0 0; font-size: 13px; color: #6b7280;">For security, never share this code with anyone. Our team will never ask for it.</p>
  `;

  const html = wrapInLayout(content, data);

  const text = wrapInLayoutText(`
${title.toUpperCase()}

${message}

YOUR CODE: ${data.code}

This code will expire in ${data.expiryMinutes} minutes.

For security, never share this code with anyone.
  `.trim(), data);

  return { subject, html, text };
}
