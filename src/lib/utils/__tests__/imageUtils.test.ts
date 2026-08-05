/**
 * Tests for Image Utils
 */

import {
  generateSVGPlaceholder,
  generateBlurDataURL,
} from '../imageUtils';

// Mock btoa for Node.js environment
global.btoa = global.btoa || ((str) => Buffer.from(str, 'binary').toString('base64'));

describe('Image Utils', () => {
  describe('generateSVGPlaceholder', () => {
    it('should generate SVG placeholder with default values', () => {
      const result = generateSVGPlaceholder();
      expect(result).toContain('data:image/svg+xml');
      // Decode base64 to check content
      const decoded = atob(result.split(',')[1]);
      expect(decoded).toContain('width="10"');
      expect(decoded).toContain('height="10"');
    });

    it('should generate SVG placeholder with custom dimensions', () => {
      const result = generateSVGPlaceholder(100, 200);
      const decoded = atob(result.split(',')[1]);
      expect(decoded).toContain('width="100"');
      expect(decoded).toContain('height="200"');
    });

    it('should generate SVG placeholder with custom color', () => {
      const result = generateSVGPlaceholder(10, 10, '#ff0000');
      const decoded = atob(result.split(',')[1]);
      expect(decoded).toContain('fill="#ff0000"');
    });

    it('should return base64 encoded data URL', () => {
      const result = generateSVGPlaceholder();
      expect(result).toMatch(/^data:image\/svg\+xml;base64,/);
    });
  });

  describe('generateBlurDataURL', () => {
    it('should return SVG placeholder for data URL', async () => {
      const result = await generateBlurDataURL('data:image/png;base64,test');
      expect(result).toContain('data:image/svg+xml');
    });

    it('should return SVG placeholder for null/undefined URL', async () => {
      const result1 = await generateBlurDataURL(null);
      const result2 = await generateBlurDataURL(undefined);
      expect(result1).toContain('data:image/svg+xml');
      expect(result2).toContain('data:image/svg+xml');
    });

    it('should generate placeholder for valid image URL', async () => {
      const result = await generateBlurDataURL('https://example.com/image.jpg');
      expect(result).toContain('data:image/svg+xml');
    });

    it('should use custom dimensions', async () => {
      const result = await generateBlurDataURL('https://example.com/image.jpg', 20, 30);
      const decoded = atob(result.split(',')[1]);
      expect(decoded).toContain('width="20"');
      expect(decoded).toContain('height="30"');
    });

    it('should handle errors gracefully', async () => {
      // Mock console.warn to avoid noise in tests
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // This should not throw
      const result = await generateBlurDataURL('invalid-url');
      expect(result).toContain('data:image/svg+xml');
      
      consoleSpy.mockRestore();
    });
  });
});

