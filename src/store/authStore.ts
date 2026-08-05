"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "../api";
import useCartStore from "./cartStore";
import useBranchStore from "./branchStore";

export interface AuthUser {
  id?: string | number;
  name?: string;
  email?: string;
  phone?: string;
  branch_id?: string | number;
  token?: string;
  [key: string]: unknown;
}

interface ActionResult {
  success: boolean;
  error?: string;
  errors?: unknown;
  message?: string;
  user?: AuthUser;
  token?: string;
  redirect?: string;
  url?: string;
  state?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<ActionResult>;
  register: (userData: Partial<AuthUser> & { password: string; password_confirmation?: string }) => Promise<ActionResult>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<AuthUser>) => Promise<ActionResult>;
  uploadProfileImage: (imageFile: File) => Promise<ActionResult>;
  fetchProfile: () => Promise<ActionResult>;
  resetPasswordRequest: (email: string) => Promise<ActionResult>;
  resetPassword: (resetData: { token: string; email: string; password: string; password_confirmation: string }) => Promise<ActionResult>;
  registerPhone: (phoneData: { phone: string; password: string | null; password_confirmation: string | null }) => Promise<ActionResult>;
  verifyPhoneOTP: (phone: string, code: string) => Promise<ActionResult>;
  completeRegistration: (userData: Record<string, unknown>) => Promise<ActionResult>;
  buildGoogleOAuthUrl: () => ActionResult;
  handleGoogleOAuthCallback: (callbackData: { user: AuthUser; token: string }) => Promise<ActionResult>;
  loginWithGoogle: (idToken: string) => Promise<ActionResult>;
}

function extractErrorMessage(error: unknown, fallback: string): string {
  return (error as { message?: string })?.message || fallback;
}

function extractApiErrors(error: unknown): unknown {
  return (error as { data?: { errors?: unknown } })?.data?.errors || null;
}

function writeAuthCookie(token: string) {
  if (typeof document !== "undefined") {
    document.cookie = `auth-token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  }
}

function clearAuthCookie() {
  if (typeof document !== "undefined") {
    document.cookie = "auth-token=; path=/; max-age=0; SameSite=Lax";
  }
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.auth.login(email, password);

          if (response.success && response.data) {
            const { user, token } = response.data as { user: AuthUser; token: string };
            const userDataWithToken: AuthUser = { ...user, token };

            set({ user: userDataWithToken, isAuthenticated: true, isLoading: false });
            writeAuthCookie(token);

            if (userDataWithToken.branch_id) {
              try {
                await useBranchStore.getState().setBranchFromUserProfile(userDataWithToken.branch_id);
              } catch (branchError) {
                console.warn("Failed to update branch from user profile after login:", branchError);
              }
            }

            return { success: true, user: userDataWithToken };
          }
          set({ isLoading: false });
          return { success: false, error: response.message || "Login failed" };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            error: extractErrorMessage(error, "An error occurred during login"),
            errors: extractApiErrors(error),
          };
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          const registerData = {
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            password: userData.password,
            password_confirmation: userData.password_confirmation || userData.password,
            branch_id: userData.branch_id || 1,
          };

          const response = await api.auth.register(registerData as never);

          if (response.success && response.data) {
            const { user, token } = response.data as { user: AuthUser; token: string };
            const userDataWithToken: AuthUser = { ...user, token };

            set({ user: userDataWithToken, isAuthenticated: true, isLoading: false });
            writeAuthCookie(token);

            if (userDataWithToken.branch_id) {
              try {
                await useBranchStore.getState().setBranchFromUserProfile(userDataWithToken.branch_id);
              } catch (branchError) {
                console.warn("Failed to update branch from user profile after registration:", branchError);
              }
            }

            return { success: true, user: userDataWithToken };
          }
          set({ isLoading: false });
          return { success: false, error: response.message || "Registration failed" };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            error: extractErrorMessage(error, "An error occurred during registration"),
            errors: extractApiErrors(error),
          };
        }
      },

      logout: async () => {
        try {
          if (get().isAuthenticated) {
            await api.auth.logout();
          }
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          set({ user: null, isAuthenticated: false });
          clearAuthCookie();

          try {
            useCartStore.getState().clearCart();
          } catch (error) {
            console.warn("Failed to clear cart:", error);
          }

          if (typeof window !== "undefined") {
            const rememberedEmail = localStorage.getItem("rememberedEmail");

            localStorage.removeItem("auth-storage");
            localStorage.removeItem("cart-storage");
            localStorage.removeItem("branch-storage");

            const keysToKeep = ["rememberedEmail"];
            Object.keys(localStorage).forEach((key) => {
              if (!keysToKeep.includes(key)) {
                localStorage.removeItem(key);
              }
            });

            if (rememberedEmail) {
              localStorage.setItem("rememberedEmail", rememberedEmail);
            }

            sessionStorage.clear();

            if ("caches" in window) {
              try {
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
              } catch (cacheError) {
                console.warn("Failed to clear cache:", cacheError);
              }
            }

            if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
              try {
                navigator.serviceWorker.controller.postMessage({ type: "CLEAR_CACHE" });
              } catch (swError) {
                console.warn("Failed to clear service worker cache:", swError);
              }
            }

            try {
              document.cookie.split(";").forEach((cookie) => {
                const eqPos = cookie.indexOf("=");
                const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
                if (name) {
                  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
                  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
                  if (window.location.hostname.startsWith("www.")) {
                    const domainWithoutWww = window.location.hostname.replace(/^www\./, "");
                    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${domainWithoutWww}`;
                  } else {
                    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
                  }
                }
              });
            } catch (cookieError) {
              console.warn("Failed to clear cookies:", cookieError);
            }
          }
        }
      },

      updateProfile: async (updates) => {
        set({ isLoading: true });
        try {
          const response = await api.auth.updateProfile(updates);

          if (response.success && response.data) {
            const currentUser = get().user;
            const responseData = response.data as { user?: AuthUser };
            const updatedUser: AuthUser = { ...currentUser, ...responseData.user };

            set({ user: updatedUser, isLoading: false });

            if (updates.branch_id !== undefined) {
              const currentBranchId = currentUser?.branch_id;
              const newBranchId = updatedUser?.branch_id;

              if (currentBranchId !== newBranchId) {
                try {
                  useCartStore.getState().clearCart();
                  await useBranchStore.getState().setBranchFromUserProfile(newBranchId as string | number);
                } catch (branchError) {
                  console.warn("Failed to update branch store after profile update:", branchError);
                }
              }
            }

            return { success: true, user: updatedUser };
          }
          set({ isLoading: false });
          return { success: false, error: response.message || "Failed to update profile" };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: extractErrorMessage(error, "An error occurred while updating profile") };
        }
      },

      uploadProfileImage: async (imageFile) => {
        set({ isLoading: true });
        try {
          const response = await api.auth.uploadProfileImage(imageFile);

          if (response.success && response.data) {
            const currentUser = get().user;
            const responseData = response.data as { user?: AuthUser } & AuthUser;
            const responseUser: AuthUser = responseData.user || responseData;

            const hasImage =
              responseUser?.image || responseUser?.image_url || responseUser?.avatar || responseUser?.photo;

            const updatedUser: AuthUser = { ...currentUser, ...responseUser };

            set({ user: updatedUser, isLoading: false });

            if (!hasImage) {
              try {
                const freshProfile = await get().fetchProfile();
                if (freshProfile?.user) {
                  set({ user: freshProfile.user });
                  return { success: true, user: freshProfile.user };
                }
              } catch (fetchError) {
                console.warn("Failed to fetch fresh profile after image upload:", fetchError);
              }
            }

            return { success: true, user: updatedUser };
          }
          set({ isLoading: false });
          return { success: false, error: response.message || "Failed to upload image" };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: extractErrorMessage(error, "An error occurred while uploading image") };
        }
      },

      fetchProfile: async () => {
        set({ isLoading: true });
        try {
          const response = await api.auth.getProfile();

          if (response.success && response.data) {
            const currentUser = get().user;
            const responseData = response.data as { user?: AuthUser };
            const updatedUser: AuthUser = { ...currentUser, ...responseData.user };

            set({ user: updatedUser, isAuthenticated: true, isLoading: false });

            if (updatedUser.branch_id) {
              try {
                await useBranchStore.getState().setBranchFromUserProfile(updatedUser.branch_id);
              } catch (branchError) {
                console.warn("Failed to update branch from user profile:", branchError);
              }
            }

            return { success: true, user: updatedUser };
          }
          set({ isLoading: false });
          return { success: false, error: response.message || "Failed to fetch profile" };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: extractErrorMessage(error, "An error occurred while fetching profile") };
        }
      },

      resetPasswordRequest: async (email) => {
        set({ isLoading: true });
        try {
          const response = await api.auth.forgotPassword(email);
          set({ isLoading: false });

          if (response.success) {
            return { success: true, message: response.message || "Password reset link has been sent to your email" };
          }
          return { success: false, error: response.message || "Failed to send reset link" };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: extractErrorMessage(error, "An error occurred") };
        }
      },

      resetPassword: async (resetData) => {
        set({ isLoading: true });
        try {
          const response = await api.auth.resetPassword(resetData);
          set({ isLoading: false });

          if (response.success) {
            return { success: true, message: response.message || "Password reset successfully" };
          }
          return { success: false, error: response.message || "Failed to reset password" };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            error: extractErrorMessage(error, "An error occurred while resetting password"),
            errors: extractApiErrors(error),
          };
        }
      },

      registerPhone: async (phoneData) => {
        set({ isLoading: true });
        try {
          const response = await api.auth.registerPhone(phoneData);
          set({ isLoading: false });

          if (response.success) {
            return { success: true, message: response.message || "OTP sent to your phone" };
          }
          return { success: false, error: response.message || "Failed to send OTP" };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            error: extractErrorMessage(error, "An error occurred"),
            errors: extractApiErrors(error),
          };
        }
      },

      verifyPhoneOTP: async (phone, code) => {
        set({ isLoading: true });
        try {
          const response = await api.auth.verifyPhone({ phone, code });
          set({ isLoading: false });

          if (response.success && response.data) {
            const { token } = response.data as { token: string };

            if (typeof window !== "undefined") {
              sessionStorage.setItem("registrationToken", token);
              sessionStorage.setItem("registrationPhone", phone);
            }

            return { success: true, token, message: response.message || "Phone verified successfully" };
          }
          return { success: false, error: response.message || "Invalid OTP code" };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            error: extractErrorMessage(error, "An error occurred while verifying OTP"),
            errors: extractApiErrors(error),
          };
        }
      },

      completeRegistration: async (userData) => {
        set({ isLoading: true });
        try {
          const response = await api.auth.completeRegistration(userData as never);
          set({ isLoading: false });

          if (response.success && response.data) {
            const { user, token } = response.data as { user: AuthUser; token: string };
            const userDataWithToken: AuthUser = { ...user, token };

            set({ user: userDataWithToken, isAuthenticated: true, isLoading: false });
            writeAuthCookie(token);

            if (userDataWithToken.branch_id) {
              try {
                await useBranchStore.getState().setBranchFromUserProfile(userDataWithToken.branch_id);
              } catch (branchError) {
                console.warn("Failed to update branch from user profile after completing registration:", branchError);
              }
            }

            if (typeof window !== "undefined") {
              sessionStorage.removeItem("registrationToken");
              sessionStorage.removeItem("registrationPhone");
              sessionStorage.removeItem("registrationPassword");
            }

            return { success: true, user: userDataWithToken };
          }
          return { success: false, error: response.message || "Failed to complete registration" };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            error: extractErrorMessage(error, "An error occurred while completing registration"),
            errors: extractApiErrors(error),
          };
        }
      },

      buildGoogleOAuthUrl: () => {
        if (typeof window === "undefined") {
          return { success: false, error: "Window is not available" };
        }

        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;

        if (!clientId || !redirectUri) {
          return {
            success: false,
            error: "Google OAuth configuration is missing. Please check environment variables.",
          };
        }

        const state = crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

        sessionStorage.setItem("googleOAuthState", state);
        sessionStorage.setItem("googleOAuthRedirectUri", redirectUri);

        const params = new URLSearchParams({
          client_id: clientId,
          redirect_uri: redirectUri,
          response_type: "code",
          scope: "openid email profile",
          access_type: "offline",
          prompt: "consent",
          state,
        });

        return {
          success: true,
          url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
          state,
        };
      },

      handleGoogleOAuthCallback: async (callbackData) => {
        set({ isLoading: true });
        try {
          const { user, token } = callbackData;

          if (!user || !token) {
            set({ isLoading: false });
            return { success: false, error: "Invalid callback data" };
          }

          if (typeof window !== "undefined") {
            sessionStorage.setItem("googleUser", JSON.stringify(user));
            sessionStorage.setItem("googleToken", token);
            sessionStorage.setItem("googleFlow", "true");
          }

          if (!user.phone) {
            set({ isLoading: false });
            return { success: true, redirect: "/add-phone" };
          }

          try {
            const otpResult = await api.auth.registerPhone({
              phone: user.phone,
              password: null as unknown as string,
              password_confirmation: null as unknown as string,
            });

            if (otpResult.success) {
              if (typeof window !== "undefined") {
                sessionStorage.setItem("registrationPhone", user.phone);
              }

              set({ isLoading: false });
              return { success: true, redirect: "/enter-otp" };
            }
            set({ isLoading: false });
            return { success: false, error: otpResult.message || "Failed to send OTP" };
          } catch (otpError) {
            console.error("Error sending OTP:", otpError);
            set({ isLoading: false });
            return { success: false, error: extractErrorMessage(otpError, "Failed to send OTP") };
          }
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: extractErrorMessage(error, "An error occurred during Google authentication") };
        }
      },

      loginWithGoogle: async (idToken) => {
        set({ isLoading: true });
        try {
          const response = await api.auth.googleLogin(idToken);
          set({ isLoading: false });

          if (response.success && response.data) {
            const { user, token } = response.data as { user: AuthUser; token: string };
            const userData: AuthUser = { ...user, token };

            set({ user: userData, isAuthenticated: true, isLoading: false });
            writeAuthCookie(token);

            if (userData.branch_id) {
              try {
                await useBranchStore.getState().setBranchFromUserProfile(userData.branch_id);
              } catch (branchError) {
                console.warn("Failed to update branch from user profile after Google login:", branchError);
              }
            }

            return { success: true, user: userData };
          }
          return { success: false, error: response.message || "Google login failed" };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            error: extractErrorMessage(error, "An error occurred during Google login"),
            errors: extractApiErrors(error),
          };
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      migrate: (persistedState) => {
        return persistedState || { user: null, isAuthenticated: false, isLoading: false };
      },
    }
  )
);

export default useAuthStore;
