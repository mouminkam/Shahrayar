/**
 * Tests for Cart Helpers
 */

import {
  validateProductForCart,
  buildProductCartItem,
  getCustomizationText,
} from '../cartHelpers';
import { mockProduct, mockProductWithOptions } from '../../../__tests__/utils/mockData';

describe('Cart Helpers', () => {
  describe('validateProductForCart', () => {
    it('should return error if product is missing', () => {
      const result = validateProductForCart(null);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Product is required');
    });

    it('should return error if customization isValid is false', () => {
      const result = validateProductForCart(mockProduct, { isValid: false });
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please select required options');
    });

    it('should return error if size is required but not selected', () => {
      const product = { ...mockProduct, has_sizes: true, has_option_groups: false };
      const result = validateProductForCart(product, {});
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please select a size');
    });

    it('should pass validation if size is selected', () => {
      const product = { ...mockProduct, has_sizes: true, has_option_groups: false };
      const result = validateProductForCart(product, { sizeId: 1 });
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should return error if required option group has insufficient selections', () => {
      const result = validateProductForCart(mockProductWithOptions, {
        selectedOptions: {},
      });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Please select at least');
    });

    it('should pass validation if required option group has sufficient selections', () => {
      const result = validateProductForCart(mockProductWithOptions, {
        selectedOptions: {
          1: [1], // Selected option 1 from group 1
        },
      });
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should pass validation for product without sizes or option groups', () => {
      const product = { ...mockProduct, has_sizes: false, has_option_groups: false };
      const result = validateProductForCart(product, {});
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });
  });

  describe('buildProductCartItem', () => {
    it('should return null if product is missing', () => {
      const result = buildProductCartItem(null);
      expect(result).toBeNull();
    });

    it('should build cart item with basic product data', () => {
      const result = buildProductCartItem(mockProduct);
      expect(result.id).toBe(mockProduct.id);
      expect(result.name).toBe(mockProduct.title);
      expect(result.price).toBe(mockProduct.price);
      expect(result.quantity).toBeUndefined(); // quantity is not set in buildProductCartItem
    });

    it('should build cart item with size information', () => {
      const customization = { sizeId: 1 };
      const result = buildProductCartItem(mockProduct, customization);
      expect(result.size_id).toBe(1);
      expect(result.size_name).toBe('Small');
    });

    it('should build cart item with ingredients', () => {
      const customization = { ingredientIds: [1, 2] };
      const result = buildProductCartItem(mockProduct, customization);
      expect(result.ingredients).toEqual([1, 2]);
      expect(result.ingredients_data).toHaveLength(2);
    });

    it('should build cart item with selected options', () => {
      const customization = {
        selectedOptions: {
          1: [1, 2],
        },
      };
      const result = buildProductCartItem(mockProductWithOptions, customization);
      expect(result.selected_options).toEqual(customization.selectedOptions);
    });

    it('should use finalPrice from customization', () => {
      const customization = { finalPrice: 15.99 };
      const result = buildProductCartItem(mockProduct, customization);
      expect(result.price).toBe(15.99);
      expect(result.final_price).toBe(15.99);
    });
  });

  describe('getCustomizationText', () => {
    it('should return empty string if no customization', () => {
      const t = (lang, key) => key;
      const result = getCustomizationText(null, [], t, 'en');
      expect(result).toBe('');
    });

    it('should return text with size only', () => {
      const t = (lang, key) => key;
      const size = { name: 'Large' };
      const result = getCustomizationText(size, [], t, 'en');
      expect(result).toBe(' (Large)');
    });

    it('should return text with ingredients only', () => {
      const t = (lang, key) => key;
      const ingredients = [{ id: 1 }, { id: 2 }];
      const result = getCustomizationText(null, ingredients, t, 'en');
      expect(result).toContain('add_ons');
    });

    it('should return text with both size and ingredients', () => {
      const t = (lang, key) => key;
      const size = { name: 'Large' };
      const ingredients = [{ id: 1 }];
      const result = getCustomizationText(size, ingredients, t, 'en');
      expect(result).toContain('Large');
      expect(result).toContain('add_ons');
    });
  });
});

