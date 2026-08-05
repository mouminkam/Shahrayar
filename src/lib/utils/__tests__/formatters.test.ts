/**
 * Tests for formatter utility functions
 * هذه أول test بسيط - سنختبر formatCurrency function
 */

import { formatPrice, formatCurrency } from '../formatters';

describe('Formatters', () => {
  // Test formatPrice function
  describe('formatPrice', () => {
    it('should format price to 2 decimal places', () => {
      expect(formatPrice(10)).toBe('10.00');
      expect(formatPrice(10.5)).toBe('10.50');
      expect(formatPrice(10.555)).toBe('10.55'); // toFixed doesn't always round up
      expect(formatPrice(10.556)).toBe('10.56'); // this one rounds up
    });

    it('should handle zero', () => {
      expect(formatPrice(0)).toBe('0.00');
    });

    it('should handle negative numbers', () => {
      expect(formatPrice(-10)).toBe('-10.00');
    });
  });

  // Test formatCurrency function
  describe('formatCurrency', () => {
    it('should format currency with default symbol (BGN)', () => {
      expect(formatCurrency(10)).toBe('BGN 10.00');
      expect(formatCurrency(10.5)).toBe('BGN 10.50');
    });

    it('should format currency with custom symbol', () => {
      expect(formatCurrency(10, '$')).toBe('$ 10.00');
      expect(formatCurrency(10, '€')).toBe('€ 10.00');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('BGN 0.00');
    });

    it('should handle large numbers', () => {
      expect(formatCurrency(1000)).toBe('BGN 1000.00');
      expect(formatCurrency(9999.99)).toBe('BGN 9999.99');
    });
  });
});

