/**
 * Email module exports for Convex API.
 * Makes email functions accessible to clients and internal functions.
 */

export { send } from "./emails/send";
export { logEmail, updateEmailLog, suppressEmail } from "./emails/mutations";
export {
  isEmailSuppressed,
  checkDuplicate,
  getTodaysSentCount,
  checkLimitNotificationToday,
  getEmailLogByProviderId,
} from "./emails/queries";
export { getEmailStatus, getEmailLog, getSuppressedEmails } from "./emails/admin";
