/**
 * Tests for Orders API
 */

import ordersAPI from '../orders';
import axiosInstance from '../config/axios';
import { mockOrder, mockOrderResponse } from '../../__tests__/utils/mockData';

jest.mock('../config/axios');

describe('Orders API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserOrders', () => {
    it('should get user orders successfully', async () => {
      const mockResponse = { success: true, data: { orders: [mockOrder] } };
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await ordersAPI.getUserOrders();

      expect(axiosInstance.get).toHaveBeenCalledWith('/orders', { params: {} });
      expect(result.data).toEqual(mockResponse);
    });

    it('should get user orders with filters', async () => {
      const params = {
        status: 'pending',
        from_date: '2024-01-01',
        to_date: '2024-01-31',
      };
      const mockResponse = { success: true, data: { orders: [mockOrder] } };
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: mockResponse });

      await ordersAPI.getUserOrders(params);

      expect(axiosInstance.get).toHaveBeenCalledWith('/orders', { params });
    });
  });

  describe('createOrder', () => {
    it('should create order successfully', async () => {
      const orderData = {
        branch_id: 1,
        order_type: 'delivery',
        subtotal: 25.99,
        total_amount: 30.99,
        items: [],
      };
      (axiosInstance.post as jest.Mock).mockResolvedValue({ data: mockOrderResponse });

      const result = await ordersAPI.createOrder(orderData);

      expect(axiosInstance.post).toHaveBeenCalledWith('/orders', orderData);
      expect(result.data).toEqual(mockOrderResponse);
    });
  });

  describe('getOrderById', () => {
    it('should get order by ID successfully', async () => {
      const orderId = 1;
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: mockOrderResponse });

      const result = await ordersAPI.getOrderById(orderId);

      expect(axiosInstance.get).toHaveBeenCalledWith(`/orders/${orderId}`);
      expect(result.data).toEqual(mockOrderResponse);
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order successfully', async () => {
      const orderId = 1;
      const cancelData = { reason: 'Changed mind' };
      const mockResponse = { success: true, message: 'Order cancelled' };
      (axiosInstance.put as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await ordersAPI.cancelOrder(orderId, cancelData);

      expect(axiosInstance.put).toHaveBeenCalledWith(`/orders/${orderId}/cancel`, cancelData);
      expect(result.data).toEqual(mockResponse);
    });
  });

  describe('previewPromoDiscount', () => {
    it('should request promo discount preview', async () => {
      const body = { order_type: 'pickup', subtotal: 50 };
      const mockResponse = {
        success: true,
        data: {
          has_promo_discount: true,
          promo_type: 'pickup',
          discount_percent: 10,
          discount_amount: 5,
          subtotal: 50,
          total_after_promo_discount: 45,
        },
      };
      (axiosInstance.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await ordersAPI.previewPromoDiscount(body);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/orders/promo-discount-preview',
        body
      );
      expect(result.data).toEqual(mockResponse);
    });
  });

  describe('getAvailableCoupons', () => {
    it('should get available coupons successfully', async () => {
      const orderData = {
        order_amount: 50,
        branch_id: 1,
        items: [],
      };
      const mockResponse = { success: true, data: { coupons: [] } };
      (axiosInstance.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await ordersAPI.getAvailableCoupons(orderData);

      expect(axiosInstance.post).toHaveBeenCalledWith('/orders/available-coupons', orderData);
      expect(result.data).toEqual(mockResponse);
    });
  });

});

