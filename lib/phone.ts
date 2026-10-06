/**
 * Phone number normalization for Ghana (+233) and international E.164 formats.
 */

/**
 * Normalizes user-entered phone numbers into standard E.164 format (+[country_code][number]).
 * Returns null if the phone number is invalid.
 *
 * Examples:
 * - "024 123 4567" with "+233" -> "+233241234567"
 * - "0501234567" -> "+233501234567"
 * - "+233 24 123 4567" -> "+233241234567"
 * - "233241234567" -> "+233241234567"
 * - "+1 (555) 123-4567" -> "+15551234567"
 */
export function normalizePhone(
  input: string,
  defaultCountryCode: string = "+233"
): string | null {
  if (!input || typeof input !== "string") {
    return null;
  }

  // Strip all whitespace, hyphens, parentheses, dots
  let cleaned = input.trim().replace(/[\s\-().]/g, "");

  if (!cleaned) {
    return null;
  }

  // Clean country code to have '+' prefix
  const formattedDefaultCode = defaultCountryCode.startsWith("+")
    ? defaultCountryCode
    : `+${defaultCountryCode}`;

  const defaultDigits = formattedDefaultCode.replace("+", "");

  // If input starts with "+", check if remainder is all digits and 7-15 length (E.164 max)
  if (cleaned.startsWith("+")) {
    const digitsOnly = cleaned.slice(1);
    if (/^\d{7,15}$/.test(digitsOnly)) {
      return cleaned;
    }
    return null;
  }

  // If input starts with 00 (international call prefix), replace with +
  if (cleaned.startsWith("00")) {
    const digitsOnly = cleaned.slice(2);
    if (/^\d{7,15}$/.test(digitsOnly)) {
      return `+${digitsOnly}`;
    }
    return null;
  }

  // If input starts with the default country code digits (e.g. 233...) without '+'
  if (cleaned.startsWith(defaultDigits) && cleaned.length >= defaultDigits.length + 7) {
    if (/^\d{7,15}$/.test(cleaned)) {
      return `+${cleaned}`;
    }
    return null;
  }

  // If input starts with local '0' (e.g. 024xxxxxxx in Ghana - typically 10 digits total)
  if (cleaned.startsWith("0")) {
    const localDigits = cleaned.slice(1);
    // Standard Ghana local number is 9 digits after the leading 0 (total 10)
    if (/^\d{8,14}$/.test(localDigits)) {
      return `${formattedDefaultCode}${localDigits}`;
    }
    return null;
  }

  // If input is purely 9 digits without leading 0 for Ghana (e.g. 241234567)
  if (/^\d{9}$/.test(cleaned) && defaultDigits === "233") {
    return `${formattedDefaultCode}${cleaned}`;
  }

  return null;
}
