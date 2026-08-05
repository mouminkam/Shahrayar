/**
 * Tests for Payments API
 */

import paymentsAPI from '../payments';
import axiosInstance from '../config/axios';

jest.mock('../config/axios');

describe('Payments API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStripeConfig', () => {
    it('should get Stripe config successfully', async () => {
      const mockResponse = { success: true, data: { publishable_key: 'pk_test' } };
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await paymentsAPI.getStripeConfig();

      expect(axiosInstance.get).toHaveBeenCalledWith('/payments/stripe/config');
      expect(result.data).toEqual(mockResponse);
    });
  });

  describe('createStripePaymentIntentWeb', () => {
    it('should create Stripe payment intent web successfully', async () => {
      const orderId = 1;
      const mockResponse = { success: true, data: { client_secret: 'secret', publishable_key: 'pk_test' } };
      (axiosInstance.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await paymentsAPI.createStripePaymentIntentWeb(orderId);

      expect(axiosInstance.post).toHaveBeenCalledWith('/payments/stripe/web/create-intent', {
        order_id: orderId,
      });
      expect(result.data).toEqual(mockResponse);
    });
  });

  describe('confirmStripePaymentWeb', () => {
    it('should confirm Stripe payment web successfully', async () => {
      const paymentIntentId = 'pi_123';
      const orderId = 1;
      const mockResponse = { success: true, data: { order: {} } };
      (axiosInstance.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await paymentsAPI.confirmStripePaymentWeb(paymentIntentId, orderId);

      expect(axiosInstance.post).toHaveBeenCalledWith('/payments/stripe/web/confirm', {
        payment_intent_id: paymentIntentId,
        order_id: orderId,
      });
      expect(result.data).toEqual(mockResponse);
    });

    it('should confirm Stripe payment web with quoteId', async () => {
      const paymentIntentId = 'pi_123';
      const orderId = 1;
      const quoteId = 'quote_123';
      const mockResponse = { success: true, data: { order: {} } };
      (axiosInstance.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      await paymentsAPI.confirmStripePaymentWeb(paymentIntentId, orderId, quoteId);

      expect(axiosInstance.post).toHaveBeenCalledWith('/payments/stripe/web/confirm', {
        payment_intent_id: paymentIntentId,
        order_id: orderId,
        quote_id: quoteId,
      });
    });
  });

});

