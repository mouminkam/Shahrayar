/**
 * Tests for Product Price calculations
 */

import { calculateProductPrice } from '../productPrice';
import { mockProduct } from '../../../__tests__/utils/mockData';

describe('Product Price', () => {
  describe('calculateProductPrice', () => {
    it('should return 0 if product is missing', () => {
      expect(calculateProductPrice(null)).toBe(0);
    });

    it('should return base price if no size or ingredients selected', () => {
      const product = { ...mockProduct, base_price: 10.99 };
      expect(calculateProductPrice(product)).toBe(10.99);
    });

    it('should use price if base_price is not available', () => {
      const product = { ...mockProduct, price: 10.99, base_price: undefined };
      expect(calculateProductPrice(product)).toBe(10.99);
    });

    it('should return 0 if no price available', () => {
      const product = { id: 1, name: 'Test' };
      expect(calculateProductPrice(product)).toBe(0);
    });

    it('should use size price when size is selected', () => {
      const product = {
        ...mockProduct,
        base_price: 10.99,
        sizes: [
          { id: 1, name: 'Small', price: 8.99 },
          { id: 2, name: 'Large', price: 12.99 },
        ],
      };
      expect(calculateProductPrice(product, 1)).toBe(8.99);
      expect(calculateProductPrice(product, 2)).toBe(12.99);
    });

    it('should add ingredient prices to base price', () => {
      const product = {
        ...mockProduct,
        base_price: 10.99,
        ingredients: [
          { id: 1, name: 'Ingredient 1', price: 1.50 },
          { id: 2, name: 'Ingredient 2', price: 2.00 },
        ],
      };
      expect(calculateProductPrice(product, null, [1, 2])).toBe(14.49);
    });

    it('should add ingredient prices to size price', () => {
      const product = {
        ...mockProduct,
        base_price: 10.99,
        sizes: [{ id: 1, name: 'Small', price: 8.99 }],
        ingredients: [
          { id: 1, name: 'Ingredient 1', price: 1.50 },
        ],
      };
      expect(calculateProductPrice(product, 1, [1])).toBe(10.49);
    });

    it('should ignore invalid ingredient IDs', () => {
      const product = {
        ...mockProduct,
        base_price: 10.99,
        ingredients: [
          { id: 1, name: 'Ingredient 1', price: 1.50 },
        ],
      };
      expect(calculateProductPrice(product, null, [999])).toBe(10.99);
    });

    it('should handle ingredients with no price', () => {
      const product = {
        ...mockProduct,
        base_price: 10.99,
        ingredients: [
          { id: 1, name: 'Ingredient 1', price: null },
        ],
      };
      expect(calculateProductPrice(product, null, [1])).toBe(10.99);
    });
  });
});

