import { normalizeIndianPhone, formatDisplayPhone } from '../src/utils/phoneHelper.js';

describe('Indian Phone Normalization & Validation Tests', () => {
  test('valid 10-digit mobile numbers pass correctly', () => {
    expect(normalizeIndianPhone('9876543210')).toBe('9876543210');
    expect(normalizeIndianPhone('8697449885')).toBe('8697449885');
    expect(normalizeIndianPhone('7003123456')).toBe('7003123456');
    expect(normalizeIndianPhone('6290123456')).toBe('6290123456');
  });

  test('valid numbers with +91 country code and formatting characters normalize correctly', () => {
    expect(normalizeIndianPhone('+919876543210')).toBe('9876543210');
    expect(normalizeIndianPhone('+91 86974 49885')).toBe('8697449885');
    expect(normalizeIndianPhone('91-98765-43210')).toBe('9876543210');
    expect(normalizeIndianPhone('(098) 7654-3210')).toBe('9876543210');
  });

  test('leading 0 trunk prefix strips safely', () => {
    expect(normalizeIndianPhone('09876543210')).toBe('9876543210');
  });

  test('invalid phone numbers return null', () => {
    expect(normalizeIndianPhone('1234567890')).toBeNull(); // Does not start with 6-9
    expect(normalizeIndianPhone('5555555555')).toBeNull();
    expect(normalizeIndianPhone('98765')).toBeNull(); // Too short
    expect(normalizeIndianPhone('98765432101234')).toBeNull(); // Too long
    expect(normalizeIndianPhone('')).toBeNull();
    expect(normalizeIndianPhone(null)).toBeNull();
  });

  test('formatDisplayPhone formats clean 10-digit phone for Indian users', () => {
    expect(formatDisplayPhone('9876543210')).toBe('+91 98765 43210');
    expect(formatDisplayPhone('8697449885')).toBe('+91 86974 49885');
  });
});
