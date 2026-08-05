/**
 * Tests for Menu API
 */

import menuAPI from '../menu';
import axiosInstance from '../config/axios';
import { mockProduct, mockMenuResponse } from '../../__tests__/utils/mockData';

jest.mock('../config/axios');

describe('Menu API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMenuCategories', () => {
    it('should get menu categories successfully', async () => {
      const mockResponse = { success: true, data: { categories: [] } };
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await menuAPI.getMenuCategories();

      expect(axiosInstance.get).toHaveBeenCalledWith('/menu-categories', { params: {} });
      expect(result.data).toEqual(mockResponse);
    });

    it('should get menu categories with params', async () => {
      const params = { branch_id: 1 };
      const mockResponse = { success: true, data: { categories: [] } };
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: mockResponse });

      await menuAPI.getMenuCategories(params);

      expect(axiosInstance.get).toHaveBeenCalledWith('/menu-categories', { params });
    });
  });

  describe('getMenuItems', () => {
    it('should get menu items successfully', async () => {
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: mockMenuResponse });

      const result = await menuAPI.getMenuItems({ branch_id: 1 });

      expect(axiosInstance.get).toHaveBeenCalledWith('/menu-items', { params: { branch_id: 1 } });
      expect(result.data).toEqual(mockMenuResponse);
    });

    it('should get menu items with all params', async () => {
      const params = {
        branch_id: 1,
        category_id: 2,
        search: 'pizza',
        featured: true,
        page: 1,
        limit: 10,
      };
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: mockMenuResponse });

      await menuAPI.getMenuItems(params);

      expect(axiosInstance.get).toHaveBeenCalledWith('/menu-items', { params });
    });
  });

  describe('getMenuItemById', () => {
    it('should get menu item by ID successfully', async () => {
      const itemId = 1;
      const mockResponse = { success: true, data: { menu_item: mockProduct } };
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await menuAPI.getMenuItemById(itemId);

      expect(axiosInstance.get).toHaveBeenCalledWith(`/menu-items/${itemId}`);
      expect(result.data).toEqual(mockResponse);
    });
  });

  describe('getHighlights', () => {
    it('should get highlights successfully', async () => {
      const params = { branch_id: 1 };
      const mockResponse = {
        success: true,
        data: {
          popular: [mockProduct],
          latest: [mockProduct],
          chef_special: [mockProduct],
        },
      };
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await menuAPI.getHighlights(params);

      expect(axiosInstance.get).toHaveBeenCalledWith('/menu-items/highlights', { params });
      expect(result.data).toEqual(mockResponse);
    });
  });
});

