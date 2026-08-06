/**
 * Authentication API — mocked for this portfolio build (see src/mocks/mockClient.ts).
 *
 * PRODUCTION: every function below would call `axiosInstance` against `/auth/*`
 * (registration, login, OTP verification, password reset, Google OAuth, …).
 * The commented line above each mock shows the exact real call it replaces —
 * the function signatures and response envelope are unchanged either way.
 */
import { mockResponse, mockError } from "../mocks/mockClient";
import { mockUser } from "../mocks/fixtures/users";
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

const MOCK_TOKEN = "mock-jwt-token-demo";
/** Any 4-digit code is accepted in this demo build. */
const isValidMockOtp = (code: string) => /^\d{4}$/.test(code);

export const register = async (userData: RegisterUserData): Promise<ApiResponse> => {
  // PRODUCTION: return axiosInstance.post<ApiResponse>("/auth/register", userData);
  return mockResponse({ user: { ...mockUser, name: userData.name, email: userData.email, phone: userData.phone }, token: MOCK_TOKEN });
};

export const login = async (email: string, _password: string): Promise<ApiResponse> => {
  // PRODUCTION: return axiosInstance.post<ApiResponse>("/auth/login", { email, password });
  return mockResponse({ user: { ...mockUser, email }, token: MOCK_TOKEN }, "Signed in (demo mode)");
};

export const logout = async (): Promise<ApiResponse> => {
  // PRODUCTION: return axiosInstance.post<ApiResponse>("/auth/logout");
  return mockResponse(null, "Signed out");
};

export const getProfile = async (): Promise<ApiResponse> => {
  // PRODUCTION: return axiosInstance.get<ApiResponse>("/auth/profile");
  return mockResponse({ user: mockUser });
};

export const updateProfile = async (updates: ProfileUpdates): Promise<ApiResponse> => {
  // PRODUCTION: return axiosInstance.put<ApiResponse>("/auth/profile", updates);
  return mockResponse({ user: { ...mockUser, ...updates } }, "Profile updated (demo mode)");
};

export const uploadProfileImage = async (_imageFile: File): Promise<ApiResponse> => {
  // PRODUCTION: return axiosInstance.post<ApiResponse>("/app/auth/profile/photo", formData);
  return mockResponse({ user: mockUser }, "Photo upload is disabled in this demo build");
};

export const changePassword = async (_passwordData: PasswordChangeData): Promise<ApiResponse> => {
  // PRODUCTION: return axiosInstance.post<ApiResponse>("/auth/change-password", passwordData);
  return mockResponse(null, "Password changed (demo mode)");
};

export const forgotPassword = async (_email: string): Promise<ApiResponse> => {
  // PRODUCTION: return axiosInstance.post<ApiResponse>("/auth/forgot-password", { email, app_type: "web" });
  return mockResponse(null, "Password reset link sent (demo mode — no email is actually sent)");
};

export const verifyResetToken = async (token: string): Promise<ApiResponse> => {
  // PRODUCTION: return axiosInstance.get<ApiResponse>("/auth/verify-reset-token", { params: { token } });
  return mockResponse({ token, email: mockUser.email, valid: true });
};

export const resetPassword = async (_resetData: ResetPasswordData): Promise<ApiResponse> => {
  // PRODUCTION: return axiosInstance.post<ApiResponse>("/auth/reset-password", resetData);
  return mockResponse(null, "Password reset successfully (demo mode)");
};

export const registerPhone = async (phoneData: PhoneRegistrationData): Promise<ApiResponse> => {
  // PRODUCTION: return axiosInstance.post<ApiResponse>("/auth/register-phone", phoneData);
  if (!phoneData.phone) return mockError("Phone number is required");
  return mockResponse(null, "OTP sent (demo mode — use any 4-digit code, e.g. 1234)");
};

export const verifyPhone = async (verifyData: VerifyPhoneData): Promise<ApiResponse> => {
  // PRODUCTION: return axiosInstance.post<ApiResponse>("/auth/verify-phone", verifyData);
  if (!isValidMockOtp(verifyData.code)) return mockError("Invalid OTP code");
  return mockResponse({ token: MOCK_TOKEN }, "Phone verified (demo mode)");
};

export const completeRegistration = async (userData: CompleteRegistrationData): Promise<ApiResponse> => {
  // PRODUCTION: return axiosInstance.post<ApiResponse>("/auth/complete-registration", userData);
  return mockResponse({ user: { ...mockUser, ...userData }, token: MOCK_TOKEN });
};

export const googleLogin = async (_idToken: string): Promise<ApiResponse> => {
  // PRODUCTION: return axiosInstance.post<ApiResponse>("/auth/google/login", { id_token: idToken });
  return mockResponse({ user: mockUser, token: MOCK_TOKEN }, "Signed in with Google (demo mode)");
};

export const googleWebLogin = async (_authorizationCode: string, _redirectUri: string): Promise<ApiResponse> => {
  // PRODUCTION: return axiosInstance.post<ApiResponse>("/auth/google/web-login", { authorization_code, redirect_uri });
  return mockResponse({ user: mockUser, token: MOCK_TOKEN }, "Signed in with Google (demo mode)");
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
