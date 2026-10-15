/**
 * Normalizes an Indian mobile phone number into a clean 10-digit string.
 * Supports inputs like:
 * - "9876543210"
 * - "+919876543210"
 * - "+91 98765 43210"
 * - "09876543210"
 * Returns null if the number is not a valid 10-digit Indian mobile number (starts with 6-9).
 */
export const normalizeIndianPhone = (rawPhone) => {
  if (!rawPhone) return null;
  const digits = rawPhone.toString().replace(/\D/g, '');

  // 12 digits starting with country code 91
  if (digits.length === 12 && digits.startsWith('91')) {
    const local = digits.slice(2);
    return /^[6-9]\d{9}$/.test(local) ? local : null;
  }

  // 11 digits starting with trunk prefix 0
  if (digits.length === 11 && digits.startsWith('0')) {
    const local = digits.slice(1);
    return /^[6-9]\d{9}$/.test(local) ? local : null;
  }

  // Standard 10 digits
  if (digits.length === 10 && /^[6-9]\d{9}$/.test(digits)) {
    return digits;
  }

  return null;
};

/**
 * Formats a 10-digit phone number for display (e.g. "+91 98765 43210")
 */
export const formatDisplayPhone = (phone10Digits) => {
  if (!phone10Digits || phone10Digits.length !== 10) return phone10Digits;
  return `+91 ${phone10Digits.slice(0, 5)} ${phone10Digits.slice(5)}`;
};

