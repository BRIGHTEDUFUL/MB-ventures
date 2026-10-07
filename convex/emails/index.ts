/**
 * Email system exports.
 * Central module for all email functionality.
 */

export { getEmailConfig } from "./config";
export type { EmailConfig, EmailMode } from "./config";

export { send } from "./send";
export { logEmail, updateEmailLog, suppressEmail } from "./mutations";
export {
  isEmailSuppressed,
  checkDuplicate,
  getTodaysSentCount,
  getEmailLogByProviderId,
} from "./queries";

export {
  triggerOrderConfirmation,
  triggerNewOrderAdmin,
  triggerOrderStatusUpdate,
  triggerNewContactMessage,
} from "./triggers";
