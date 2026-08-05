/**
 * Tests for Branches API
 */

import branchesAPI from '../branches';
import axiosInstance from '../config/axios';
import { mockBranch, mockBranchesResponse } from '../../__tests__/utils/mockData';

jest.mock('../config/axios');

describe('Branches API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllBranches', () => {
    it('should get all branches successfully', async () => {
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: mockBranchesResponse });

      const result = await branchesAPI.getAllBranches();

      expect(axiosInstance.get).toHaveBeenCalledWith('/branches', { params: {} });
      expect(result.data).toEqual(mockBranchesResponse);
    });

    it('should get all branches with params', async () => {
      const params = {
        latitude: 40.7128,
        longitude: -74.0060,
        radius: 10,
        city: 'New York',
      };
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: mockBranchesResponse });

      await branchesAPI.getAllBranches(params);

      expect(axiosInstance.get).toHaveBeenCalledWith('/branches', { params });
    });
  });

  describe('getBranchById', () => {
    it('should get branch by ID successfully', async () => {
      const branchId = 1;
      const mockResponse = { success: true, data: { branch: mockBranch } };
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await branchesAPI.getBranchById(branchId);

      expect(axiosInstance.get).toHaveBeenCalledWith(`/branches/${branchId}`);
      expect(result.data).toEqual(mockResponse);
    });
  });

  describe('getUpsellItems', () => {
    it('should get upsell items successfully', async () => {
      const branchId = 1;
      const mockResponse = { success: true, data: { items: [] } };
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await branchesAPI.getUpsellItems(branchId);

      expect(axiosInstance.get).toHaveBeenCalledWith(`/branches/${branchId}/upsell-items`, { params: {} });
      expect(result.data).toEqual(mockResponse);
    });

    it('should get upsell items with params', async () => {
      const branchId = 1;
      const params = { type: 'drink' };
      const mockResponse = { success: true, data: { items: [] } };
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: mockResponse });

      await branchesAPI.getUpsellItems(branchId, params);

      expect(axiosInstance.get).toHaveBeenCalledWith(`/branches/${branchId}/upsell-items`, { params });
    });
  });

  describe('getChefs', () => {
    it('should get chefs successfully', async () => {
      const branchId = 1;
      const mockResponse = {
        success: true,
        data: {
          branch_id: branchId,
          chefs: [],
        },
      };
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await branchesAPI.getChefs(branchId);

      expect(axiosInstance.get).toHaveBeenCalledWith('/chefs', {
        params: { branch_id: branchId },
      });
      expect(result.data).toEqual(mockResponse);
    });
  });
});

