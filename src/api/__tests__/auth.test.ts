/**
 * Tests for Auth API
 */

import authAPI from '../auth';
import axiosInstance from '../config/axios';
import { mockAuthResponse, mockUser, mockErrorResponse } from '../../__tests__/utils/mockData';

// Mock axios instance
jest.mock('../config/axios');

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '+1234567890',
        password: 'password123',
        password_confirmation: 'password123',
      };

      (axiosInstance.post as jest.Mock).mockResolvedValue({ data: mockAuthResponse });

      const result = await authAPI.register(userData);

      expect(axiosInstance.post).toHaveBeenCalledWith('/auth/register', userData);
      expect(result.data).toEqual(mockAuthResponse);
    });

    it('should handle registration errors', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      (axiosInstance.post as jest.Mock).mockRejectedValue({ response: { data: mockErrorResponse } });

      await expect(authAPI.register(userData)).rejects.toEqual({
        response: { data: mockErrorResponse },
      });
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      (axiosInstance.post as jest.Mock).mockResolvedValue({ data: mockAuthResponse });

      const result = await authAPI.login(email, password);

      expect(axiosInstance.post).toHaveBeenCalledWith('/auth/login', { email, password });
      expect(result.data).toEqual(mockAuthResponse);
    });

    it('should handle login errors', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';

      (axiosInstance.post as jest.Mock).mockRejectedValue({ response: { data: mockErrorResponse } });

      await expect(authAPI.login(email, password)).rejects.toEqual({
        response: { data: mockErrorResponse },
      });
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      const mockResponse = { success: true, message: 'Logged out successfully' };
      (axiosInstance.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await authAPI.logout();

      expect(axiosInstance.post).toHaveBeenCalledWith('/auth/logout');
      expect(result.data).toEqual(mockResponse);
    });
  });

  describe('getProfile', () => {
    it('should get user profile successfully', async () => {
      const mockResponse = { success: true, data: { user: mockUser } };
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await authAPI.getProfile();

      expect(axiosInstance.get).toHaveBeenCalledWith('/auth/profile');
      expect(result.data).toEqual(mockResponse);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      const updates = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };

      const mockResponse = { success: true, data: { user: { ...mockUser, ...updates } } };
      (axiosInstance.put as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await authAPI.updateProfile(updates);

      expect(axiosInstance.put).toHaveBeenCalledWith('/auth/profile', updates);
      expect(result.data).toEqual(mockResponse);
    });
  });

  describe('uploadProfileImage', () => {
    it('should upload profile image successfully', async () => {
      const imageFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('image', imageFile);

      const mockResponse = { success: true, data: { user: { ...mockUser, avatar: 'new-avatar.jpg' } } };
      (axiosInstance.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await authAPI.uploadProfileImage(imageFile);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/auth/profile/upload-image',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      expect(result.data).toEqual(mockResponse);
    });
  });

  describe('forgotPassword', () => {
    it('should send password reset OTP successfully', async () => {
      const email = 'test@example.com';
      const mockResponse = { success: true, message: 'OTP sent to email' };
      (axiosInstance.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await authAPI.forgotPassword(email);

      expect(axiosInstance.post).toHaveBeenCalledWith('/auth/forgot-password', { email });
      expect(result.data).toEqual(mockResponse);
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const resetData = {
        token: 'reset-token',
        email: 'test@example.com',
        password: 'newpassword',
        password_confirmation: 'newpassword',
      };

      const mockResponse = { success: true, message: 'Password reset successfully' };
      (axiosInstance.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await authAPI.resetPassword(resetData);

      expect(axiosInstance.post).toHaveBeenCalledWith('/auth/reset-password', resetData);
      expect(result.data).toEqual(mockResponse);
    });
  });

  describe('registerPhone', () => {
    it('should register with phone successfully', async () => {
      const phoneData = {
        phone: '+1234567890',
        password: 'password123',
        password_confirmation: 'password123',
      };

      const mockResponse = { success: true, message: 'OTP sent to phone' };
      (axiosInstance.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await authAPI.registerPhone(phoneData);

      expect(axiosInstance.post).toHaveBeenCalledWith('/auth/register-phone', phoneData);
      expect(result.data).toEqual(mockResponse);
    });
  });

  describe('verifyPhone', () => {
    it('should verify phone OTP successfully', async () => {
      const verifyData = {
        phone: '+1234567890',
        code: '123456',
      };

      const mockResponse = { success: true, data: { token: 'verification-token' } };
      (axiosInstance.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await authAPI.verifyPhone(verifyData);

      expect(axiosInstance.post).toHaveBeenCalledWith('/auth/verify-phone', verifyData);
      expect(result.data).toEqual(mockResponse);
    });
  });

  describe('completeRegistration', () => {
    it('should complete registration successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        branch_id: 1,
      };

      (axiosInstance.post as jest.Mock).mockResolvedValue({ data: mockAuthResponse });

      const result = await authAPI.completeRegistration(userData);

      expect(axiosInstance.post).toHaveBeenCalledWith('/auth/complete-registration', userData);
      expect(result.data).toEqual(mockAuthResponse);
    });
  });

  describe('getRegistrationBranches', () => {
    it('should get registration branches successfully', async () => {
      const lang = 'ar';
      const mockResponse = { success: true, data: { branches: [] } };
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await authAPI.getRegistrationBranches(lang);

      expect(axiosInstance.get).toHaveBeenCalledWith('/auth/rbranches', { params: { lang } });
      expect(result.data).toEqual(mockResponse);
    });

    it('should use default language if not provided', async () => {
      const mockResponse = { success: true, data: { branches: [] } };
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: mockResponse });

      await authAPI.getRegistrationBranches();

      expect(axiosInstance.get).toHaveBeenCalledWith('/auth/rbranches', { params: { lang: 'ar' } });
    });
  });

  describe('googleLogin', () => {
    it('should login with Google ID token successfully', async () => {
      const idToken = 'google-id-token';
      (axiosInstance.post as jest.Mock).mockResolvedValue({ data: mockAuthResponse });

      const result = await authAPI.googleLogin(idToken);

      expect(axiosInstance.post).toHaveBeenCalledWith('/auth/google/login', { id_token: idToken });
      expect(result.data).toEqual(mockAuthResponse);
    });
  });

  describe('googleWebLogin', () => {
    it('should login with Google authorization code successfully', async () => {
      const authorizationCode = 'auth-code';
      const redirectUri = 'https://example.com/callback';
      (axiosInstance.post as jest.Mock).mockResolvedValue({ data: mockAuthResponse });

      const result = await authAPI.googleWebLogin(authorizationCode, redirectUri);

      expect(axiosInstance.post).toHaveBeenCalledWith('/auth/google/web-login', {
        authorization_code: authorizationCode,
        redirect_uri: redirectUri,
      });
      expect(result.data).toEqual(mockAuthResponse);
    });

    it('should handle errors and re-throw them', async () => {
      const authorizationCode = 'invalid-code';
      const redirectUri = 'https://example.com/callback';
      const error = { response: { data: mockErrorResponse } };

      (axiosInstance.post as jest.Mock).mockRejectedValue(error);

      await expect(authAPI.googleWebLogin(authorizationCode, redirectUri)).rejects.toEqual(error);
    });
  });
});

