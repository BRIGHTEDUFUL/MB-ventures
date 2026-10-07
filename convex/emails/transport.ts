/**
 * Email transport layer - handles actual sending via Resend API.
 * In dry-run mode, skips network calls entirely.
 */

import { getEmailConfig, getEmailAddress } from "./config";

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  tags?: Record<string, string>;
  idempotencyKey: string;
}

export interface SendEmailResult {
  ok: boolean;
  providerMessageId?: string;
  error?: string;
  skipped?: boolean;
}

const RESEND_API_URL = "https://api.resend.com/emails";
const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 2000;

/**
 * Send an email via Resend API or skip in dry-run mode.
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const config = getEmailConfig();

  // Dry-run mode: skip network call
  if (config.mode === "dry-run") {
    return { ok: true, skipped: true };
  }

  // Live mode: send via Resend
  if (!config.apiKey) {
    return { ok: false, error: "RESEND_API_KEY not configured" };
  }

  const payload = {
    from: config.from,
    to: [params.to],
    subject: params.subject,
    html: params.html,
    text: params.text,
    reply_to: params.replyTo || config.replyTo,
    tags: params.tags,
  };

  let lastError: string | undefined;

  // Try sending with one retry on retryable errors
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }

    try {
      const response = await fetch(RESEND_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": params.idempotencyKey,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      // Success
      if (response.ok) {
        return {
          ok: true,
          providerMessageId: responseData.id,
        };
      }

      // Check if error is retryable
      const isRetryable = response.status === 429 || response.status >= 500;
      const retryAfter = response.headers.get("Retry-After");

      lastError = responseData.message || `HTTP ${response.status}`;

      // Don't retry 4xx validation errors (except 429)
      if (!isRetryable || attempt === MAX_RETRIES) {
        return {
          ok: false,
          error: truncateError(lastError || "Request failed"),
        };
      }

      // Respect Retry-After header if present
      if (retryAfter) {
        const retryDelaySeconds = parseInt(retryAfter, 10);
        if (!isNaN(retryDelaySeconds)) {
          await new Promise((resolve) => 
            setTimeout(resolve, retryDelaySeconds * 1000)
          );
        }
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Network error";
      
      // Network errors are retryable
      if (attempt === MAX_RETRIES) {
        return {
          ok: false,
          error: truncateError(lastError),
        };
      }
    }
  }

  return {
    ok: false,
    error: truncateError(lastError || "Unknown error after retries"),
  };
}

/**
 * Truncate error messages to fit database constraints.
 */
function truncateError(error: string): string {
  const MAX_LENGTH = 300;
  if (error.length <= MAX_LENGTH) {
    return error;
  }
  return error.substring(0, MAX_LENGTH - 3) + "...";
}
