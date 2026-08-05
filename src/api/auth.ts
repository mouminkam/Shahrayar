/**
 * Authentication API endpoints
 * Handles user registration, login, logout, profile management, and password reset
 */

import axiosInstance from "./config/axios";
import type { ApiResponse } from "./types";

export interface RegisterUserData {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  branch_id?: number;
  [key: string]: unknown;
}

export interface ProfileUpdates {
  name?: string;
  email?: string;
  phone?: string;
  [key: string]: unknown;
}

export interface PasswordChangeData {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface ResetPasswordData {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface PhoneRegistrationData {
  phone: string;
  // Nullable for the Google OAuth flow, where the phone-registration step
  // has no password (the account is authenticated via Google instead).
  password: string | null;
  password_confirmation: string | null;
}

export interface VerifyPhoneData {
  phone: string;
  code: string;
}

export interface CompleteRegistrationData {
  name: string;
  email: string;
  branch_id: number;
  [key: string]: unknown;
}

export const register = async (userData: RegisterUserData): Promise<ApiResponse> => {
  return axiosInstance.post<ApiResponse, ApiResponse>("/auth/register", userData);
};

export const login = async (email: string, password: string): Promise<ApiResponse> => {
  return axiosInstance.post<ApiResponse, ApiResponse>("/auth/login", { email, password });
};

export const logout = async (): Promise<ApiResponse> => {
  return axiosInstance.post<ApiResponse, ApiResponse>("/auth/logout");
};

export const getProfile = async (): Promise<ApiResponse> => {
  return axiosInstance.get<ApiResponse, ApiResponse>("/auth/profile");
};

export const updateProfile = async (updates: ProfileUpdates): Promise<ApiResponse> => {
  return axiosInstance.put<ApiResponse, ApiResponse>("/auth/profile", updates);
};

export const uploadProfileImage = async (imageFile: File): Promise<ApiResponse> => {
  const formData = new FormData();
  formData.append("photo", imageFile);
  return axiosInstance.post<ApiResponse, ApiResponse>("/app/auth/profile/photo", formData);
};

export const changePassword = async (passwordData: PasswordChangeData): Promise<ApiResponse> => {
  return axiosInstance.post<ApiResponse, ApiResponse>("/auth/change-password", passwordData);
};

export const forgotPassword = async (email: string): Promise<ApiResponse> => {
  return axiosInstance.post<ApiResponse, ApiResponse>("/auth/forgot-password", {
    email,
    app_type: "web",
  });
};

export const verifyResetToken = async (token: string): Promise<ApiResponse> => {
  return axiosInstance.get<ApiResponse, ApiResponse>("/auth/verify-reset-token", {
    params: { token },
  });
};

export const resetPassword = async (resetData: ResetPasswordData): Promise<ApiResponse> => {
  return axiosInstance.post<ApiResponse, ApiResponse>("/auth/reset-password", resetData);
};

export const registerPhone = async (phoneData: PhoneRegistrationData): Promise<ApiResponse> => {
  return axiosInstance.post<ApiResponse, ApiResponse>("/auth/register-phone", phoneData);
};

export const verifyPhone = async (verifyData: VerifyPhoneData): Promise<ApiResponse> => {
  return axiosInstance.post<ApiResponse, ApiResponse>("/auth/verify-phone", verifyData);
};

export const completeRegistration = async (userData: CompleteRegistrationData): Promise<ApiResponse> => {
  return axiosInstance.post<ApiResponse, ApiResponse>("/auth/complete-registration", userData);
};

export const googleLogin = async (idToken: string): Promise<ApiResponse> => {
  return axiosInstance.post<ApiResponse, ApiResponse>("/auth/google/login", { id_token: idToken });
};

export const googleWebLogin = async (
  authorizationCode: string,
  redirectUri: string
): Promise<ApiResponse> => {
  try {
    return await axiosInstance.post<ApiResponse, ApiResponse>("/auth/google/web-login", {
      authorization_code: authorizationCode,
      redirect_uri: redirectUri,
    });
  } catch (error) {
    throw error;
  }
};

const authAPI = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  uploadProfileImage,
  changePassword,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  registerPhone,
  verifyPhone,
  completeRegistration,
  googleLogin,
  googleWebLogin,
};

export default authAPI;
