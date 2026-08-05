/**
 * Tests for Cart Store (Zustand)
 */

import { renderHook, act } from '@testing-library/react';
import useCartStore, { getCartItemKey } from '../cartStore';

describe('Cart Store', () => {
  beforeEach(() => {
    // Reset store before each test
    act(() => {
      useCartStore.getState().clearCart();
    });
  });

  describe('getCartItemKey', () => {
    it('should generate unique key for item', () => {
      const item = {
        id: 1,
        size_id: 2,
        ingredients: [1, 2],
        selected_options: null,
      };
      const key = getCartItemKey(item);
      expect(key).toBe('1-2-1,2-no-options');
    });

    it('should generate same key for same item configuration', () => {
      const item1 = { id: 1, size_id: 2, ingredients: [1, 2] };
      const item2 = { id: 1, size_id: 2, ingredients: [1, 2] };
      expect(getCartItemKey(item1)).toBe(getCartItemKey(item2));
    });

    it('should generate different keys for different configurations', () => {
      const item1 = { id: 1, size_id: 2, ingredients: [1] };
      const item2 = { id: 1, size_id: 2, ingredients: [2] };
      expect(getCartItemKey(item1)).not.toBe(getCartItemKey(item2));
    });
  });

  describe('addToCart', () => {
    it('should add item to cart', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart({
          id: 1,
          name: 'Test Product',
          price: 10,
          image: 'test.jpg',
        });
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].id).toBe(1);
      expect(result.current.items[0].quantity).toBe(1);
    });

    it('should increase quantity if same item is added again', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart({
          id: 1,
          name: 'Test Product',
          price: 10,
        });
        result.current.addToCart({
          id: 1,
          name: 'Test Product',
          price: 10,
        });
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(2);
    });

    it('should add as separate item if configuration is different', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart({
          id: 1,
          name: 'Test Product',
          price: 10,
          size_id: 1,
        });
        result.current.addToCart({
          id: 1,
          name: 'Test Product',
          price: 10,
          size_id: 2, // Different size
        });
      });

      expect(result.current.items).toHaveLength(2);
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart({
          id: 1,
          name: 'Test Product',
          price: 10,
        });
      });

      expect(result.current.items).toHaveLength(1);

      act(() => {
        const itemKey = getCartItemKey(result.current.items[0]);
        result.current.removeFromCart(itemKey);
      });

      expect(result.current.items).toHaveLength(0);
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart({ id: 1, name: 'Product 1', price: 10 });
        result.current.addToCart({ id: 2, name: 'Product 2', price: 20 });
      });

      expect(result.current.items).toHaveLength(2);

      act(() => {
        result.current.clearCart();
      });

      expect(result.current.items).toHaveLength(0);
    });
  });

  describe('increaseQty and decreaseQty', () => {
    it('should increase item quantity', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart({
          id: 1,
          name: 'Test Product',
          price: 10,
        });
      });

      expect(result.current.items[0].quantity).toBe(1);

      act(() => {
        const itemKey = getCartItemKey(result.current.items[0]);
        result.current.increaseQty(itemKey);
      });

      expect(result.current.items[0].quantity).toBe(2);
    });

    it('should decrease item quantity and remove if reaches 0', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart({
          id: 1,
          name: 'Test Product',
          price: 10,
        });
      });

      act(() => {
        const itemKey = getCartItemKey(result.current.items[0]);
        result.current.decreaseQty(itemKey);
      });

      expect(result.current.items).toHaveLength(0);
    });
  });

  describe('getSubtotal', () => {
    it('should calculate subtotal correctly', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart({ id: 1, name: 'Product 1', price: 10 });
        result.current.addToCart({ id: 2, name: 'Product 2', price: 20 });
      });

      const subtotal = result.current.getSubtotal();
      expect(subtotal).toBe(30);
    });

    it('should calculate subtotal with quantities', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart({ id: 1, name: 'Product 1', price: 10 });
        result.current.addToCart({ id: 1, name: 'Product 1', price: 10 }); // quantity = 2
      });

      const subtotal = result.current.getSubtotal();
      expect(subtotal).toBe(20);
    });
  });

  describe('getItemCount', () => {
    it('should return total item count', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart({ id: 1, name: 'Product 1', price: 10 });
        result.current.addToCart({ id: 1, name: 'Product 1', price: 10 }); // quantity = 2
        result.current.addToCart({ id: 2, name: 'Product 2', price: 20 }); // quantity = 1
      });

      const count = result.current.getItemCount();
      expect(count).toBe(3); // 2 + 1
    });
  });

  describe('applyCoupon and removeCoupon', () => {
    it('should apply coupon', () => {
      const { result } = renderHook(() => useCartStore());
      const coupon = { code: 'TEST10', type: 'percentage', value: 10 };

      act(() => {
        result.current.applyCoupon(coupon);
      });

      expect(result.current.coupon).toEqual(coupon);
    });

    it('should remove coupon', () => {
      const { result } = renderHook(() => useCartStore());
      const coupon = { code: 'TEST10', type: 'percentage', value: 10 };

      act(() => {
        result.current.applyCoupon(coupon);
        result.current.removeCoupon();
      });

      expect(result.current.coupon).toBeNull();
    });
  });

  describe('setDeliveryCharge', () => {
    it('should set delivery charge', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.setDeliveryCharge(5.0);
      });

      expect(result.current.deliveryCharge).toBe(5.0);
    });

    it('should set delivery charge to 0 if null/undefined', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.setDeliveryCharge(null);
      });

      expect(result.current.deliveryCharge).toBe(0);
    });
  });

  describe('setOrderType', () => {
    it('should set order type to pickup', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.setDeliveryCharge(5.0);
        result.current.setOrderType('pickup');
      });

      expect(result.current.orderType).toBe('pickup');
      expect(result.current.deliveryCharge).toBe(0);
      expect(result.current.quoteId).toBeNull();
    });

    it('should set order type to delivery', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.setOrderType('delivery');
      });

      expect(result.current.orderType).toBe('delivery');
      expect(result.current.deliveryCharge).toBe(0);
      expect(result.current.quoteId).toBeNull();
    });
  });

  describe('setQuoteId', () => {
    it('should set quote ID', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.setQuoteId('quote-123');
      });

      expect(result.current.quoteId).toBe('quote-123');
    });

    it('should set quote ID to null if null/undefined', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.setQuoteId('quote-123');
        result.current.setQuoteId(null);
      });

      expect(result.current.quoteId).toBeNull();
    });
  });

  describe('getDiscount', () => {
    it('should return 0 if no coupon', () => {
      const { result } = renderHook(() => useCartStore());
      expect(result.current.getDiscount()).toBe(0);
    });

    it('should calculate percentage discount', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart({ id: 1, name: 'Product 1', price: 100 });
        result.current.applyCoupon({ type: 'percentage', value: 10 });
      });

      const discount = result.current.getDiscount();
      expect(discount).toBe(10); // 10% of 100
    });

    it('should calculate fixed amount discount', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart({ id: 1, name: 'Product 1', price: 100 });
        result.current.applyCoupon({ type: 'fixed_amount', value: 15 });
      });

      const discount = result.current.getDiscount();
      expect(discount).toBe(15);
    });

    it('should not exceed subtotal for fixed amount', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart({ id: 1, name: 'Product 1', price: 10 });
        result.current.applyCoupon({ type: 'fixed_amount', value: 50 }); // More than subtotal
      });

      const discount = result.current.getDiscount();
      expect(discount).toBe(10); // Should not exceed subtotal
    });
  });

  describe('getTotal', () => {
    it('should calculate total with items, delivery, and discount', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart({ id: 1, name: 'Product 1', price: 100 });
        result.current.setDeliveryCharge(5.0);
        result.current.applyCoupon({ type: 'fixed_amount', value: 10 });
      });

      const total = result.current.getTotal();
      // Subtotal: 100, Discount: 10, Delivery: 5, Tax: (100-10) * 0.1 = 9
      // Total: 100 - 10 + 5 + 9 = 104
      expect(total).toBeGreaterThan(0);
    });

    it('should return 0 for empty cart', () => {
      const { result } = renderHook(() => useCartStore());
      expect(result.current.getTotal()).toBe(0);
    });
  });

  describe('clearCart', () => {
    it('should clear coupon and delivery charge', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart({ id: 1, name: 'Product 1', price: 10 });
        result.current.applyCoupon({ code: 'TEST' });
        result.current.setDeliveryCharge(5.0);
        result.current.clearCart();
      });

      expect(result.current.items).toHaveLength(0);
      expect(result.current.coupon).toBeNull();
      expect(result.current.deliveryCharge).toBe(0);
    });
  });
});

