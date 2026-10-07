/**
 * Email sending pipeline.
 * Handles rate limiting, deduplication, template rendering, and dispatch.
 */

import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { internal } from "../_generated/api";
import { getEmailConfig, isValidEmail } from "./config";
import { sendEmail } from "./transport";

// Template imports
import * as orderConfirmation from "./templates/orderConfirmation";
import * as newOrderAdmin from "./templates/newOrderAdmin";
import * as orderStatusUpdate from "./templates/orderStatusUpdate";
import * as authCode from "./templates/authCode";
import * as newContactMessage from "./templates/newContactMessage";

type TemplateData =
  | { template: "orderConfirmation"; data: orderConfirmation.OrderConfirmationData }
  | { template: "newOrderAdmin"; data: newOrderAdmin.NewOrderAdminData }
  | { template: "orderStatusUpdate"; data: orderStatusUpdate.OrderStatusUpdateData }
  | { template: "authCode"; data: authCode.AuthCodeData }
  | { template: "newContactMessage"; data: newContactMessage.NewContactMessageData };

/**
 * Main email sending action.
 * Called via ctx.scheduler to ensure email failures never break business logic.
 */
export const send = internalAction({
  args: {
    template: v.string(),
    to: v.string(),
    orderId: v.optional(v.id("orders")),
    data: v.any(),
  },
  handler: async (ctx, args): Promise<void> => {
    const config = getEmailConfig();
    const now = Date.now();

    try {
      // Validate recipient email
      if (!isValidEmail(args.to)) {
        await ctx.runMutation(internal.emails.mutations.logEmail, {
          to: args.to,
          subject: "Invalid email",
          template: args.template,
          status: "failed",
          provider: "none",
          error: "Invalid email address format",
          orderId: args.orderId,
          attempts: 0,
          createdAt: now,
          updatedAt: now,
        });
        return;
      }

      // Check if email is suppressed
      const suppressed = await ctx.runQuery(internal.emails.queries.isEmailSuppressed, {
        email: args.to,
      });

      if (suppressed) {
        await ctx.runMutation(internal.emails.mutations.logEmail, {
          to: args.to,
          subject: "Suppressed",
          template: args.template,
          status: "failed",
          provider: "none",
          error: "Email address is suppressed (bounced or complained)",
          orderId: args.orderId,
          attempts: 0,
          createdAt: now,
          updatedAt: now,
        });
        return;
      }

      // Check for duplicate (same template + orderId within 60 seconds)
      if (args.orderId) {
        const duplicate = await ctx.runQuery(internal.emails.queries.checkDuplicate, {
          template: args.template,
          orderId: args.orderId,
          withinSeconds: 60,
        });

        if (duplicate) {
          // Silent skip - already sent
          return;
        }
      }

      // Check daily limit
      const todayCount = await ctx.runQuery(internal.emails.queries.getTodaysSentCount);
      
      if (todayCount >= config.dailyLimit) {
        // Notify admin once per day about limit
        const alreadyNotified = await ctx.runQuery(internal.emails.queries.checkLimitNotificationToday);
        
        if (!alreadyNotified && config.adminAlertEmail) {
          // Send one notification about hitting the limit
          console.warn(`Daily email limit reached: ${todayCount}/${config.dailyLimit}`);
        }

        await ctx.runMutation(internal.emails.mutations.logEmail, {
          to: args.to,
          subject: "Daily limit reached",
          template: args.template,
          status: "failed",
          provider: "none",
          error: `Daily limit of ${config.dailyLimit} emails reached`,
          orderId: args.orderId,
          attempts: 0,
          createdAt: now,
          updatedAt: now,
        });
        return;
      }

      // Render template
      const { subject, html, text } = renderTemplate({
        template: args.template,
        data: args.data,
      } as TemplateData);

      // Create log entry with queued status
      const logId = await ctx.runMutation(internal.emails.mutations.logEmail, {
        to: args.to,
        subject,
        template: args.template,
        status: "queued",
        provider: config.mode === "live" ? "resend" : "none",
        orderId: args.orderId,
        html: config.mode === "dry-run" ? html : undefined,
        text: config.mode === "dry-run" ? text : undefined,
        attempts: 0,
        createdAt: now,
        updatedAt: now,
      });

      // Send via transport
      const result = await sendEmail({
        to: args.to,
        subject,
        html,
        text,
        replyTo: config.replyTo,
        idempotencyKey: logId,
      });

      // Update log with result
      if (result.ok) {
        const status = result.skipped ? "skipped_dry_run" : "sent";
        await ctx.runMutation(internal.emails.mutations.updateEmailLog, {
          logId,
          status,
          providerMessageId: result.providerMessageId,
          attempts: 1,
          updatedAt: now,
        });

        // Log code for auth emails in dry-run dev mode
        if (config.dryRunLogCodes && config.mode === "dry-run" && args.template === "authCode") {
          const codeData = args.data as authCode.AuthCodeData;
          console.log(`[DRY-RUN AUTH CODE] to: ${args.to}, code: ${codeData.code}`);
        }
      } else {
        await ctx.runMutation(internal.emails.mutations.updateEmailLog, {
          logId,
          status: "failed",
          error: result.error,
          attempts: 1,
          updatedAt: now,
        });
      }
    } catch (error) {
      console.error("Email send error:", error);
      // Log failure but don't throw - email failures should never break business logic
    }
  },
});

/**
 * Render email template with provided data.
 */
function renderTemplate(params: TemplateData): { subject: string; html: string; text: string } {
  switch (params.template) {
    case "orderConfirmation":
      return orderConfirmation.render(params.data);
    case "newOrderAdmin":
      return newOrderAdmin.render(params.data);
    case "orderStatusUpdate":
      return orderStatusUpdate.render(params.data);
    case "authCode":
      return authCode.render(params.data);
    case "newContactMessage":
      return newContactMessage.render(params.data);
    default:
      throw new Error(`Unknown template: ${(params as any).template}`);
  }
}
