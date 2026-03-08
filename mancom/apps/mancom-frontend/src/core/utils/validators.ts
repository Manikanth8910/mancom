/**
 * Validation utilities
 */

/**
 * Validate Indian phone number (10 digits)
 */
export function isValidPhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return /^[6-9]\d{9}$/.test(cleaned);
}

/**
 * Validate OTP (6 digits)
 */
export function isValidOtp(otp: string): boolean {
  return /^\d{6}$/.test(otp);
}

/**
 * Format phone number for display
 */
export function formatPhoneForDisplay(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
}

/**
 * Mask phone number for privacy (show last 2 digits)
 */
export function maskPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 2)}XXX XXX${cleaned.slice(-2)}`;
  }
  return phone;
}
