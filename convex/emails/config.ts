/**
 * Email configuration and mode detection.
 * Determines at runtime whether to send real emails (live mode)
 * or record them locally (dry-run mode).
 */

export type EmailMode = "live" | "dry-run";

export interface EmailConfig {
  mode: EmailMode;
  from: string;
  replyTo?: string;
  adminAlertEmail?: string;
  dailyLimit: number;
  apiKey?: string;
  webhookSecret?: string;
  dryRunLogCodes: boolean;
}

/**
 * Get email configuration from environment variables.
 * Mode is determined at runtime:
 * - "live": RESEND_API_KEY and EMAIL_FROM are both set
 * - "dry-run": either is missing (safe to run without credentials)
 */
export function getEmailConfig(): EmailConfig {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const emailFrom = process.env.EMAIL_FROM?.trim();
  const replyTo = process.env.EMAIL_REPLY_TO?.trim();
  const adminAlertEmail = process.env.ADMIN_ALERT_EMAIL?.trim();
  const dailyLimitStr = process.env.EMAIL_DAILY_LIMIT?.trim();
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET?.trim();
  const dryRunLogCodesStr = process.env.EMAIL_DRY_RUN_LOG_CODES?.trim();

  // Validate dry-run code logging is only enabled in development
  const siteUrl = process.env.SITE_URL || "";
  const isDevelopment = siteUrl.includes("localhost") || siteUrl.includes("127.0.0.1") || siteUrl.includes(".convex.site");
  
  if (dryRunLogCodesStr === "true" && !isDevelopment) {
    throw new Error(
      "EMAIL_DRY_RUN_LOG_CODES=true is only allowed for localhost or .convex.site URLs. " +
      "Never enable code logging in production."
    );
  }

  const mode: EmailMode = apiKey && emailFrom ? "live" : "dry-run";

  return {
    mode,
    from: emailFrom || "Shop <orders@example.com>",
    replyTo,
    adminAlertEmail,
    dailyLimit: dailyLimitStr ? parseInt(dailyLimitStr, 10) : 100,
    apiKey: mode === "live" ? apiKey : undefined,
    webhookSecret,
    dryRunLogCodes: dryRunLogCodesStr === "true",
  };
}

/**
 * Format email address for display.
 * Strips the name part if present.
 */
export function getEmailAddress(emailWithName: string): string {
  const match = emailWithName.match(/<(.+)>/);
  return match ? match[1] : emailWithName;
}

/**
 * Validate email address format.
 */
export function isValidEmail(email: string): boolean {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}
