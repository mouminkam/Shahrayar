/**
 * Axios instance configuration with interceptors
 * Handles authentication, error handling, and request/response transformation
 */

import axios, { type InternalAxiosRequestConfig } from "axios";
import { getLanguageFromCookie } from "../../lib/utils/language";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://shahrayar.peaklink.pro/api/v1";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000,
});

/**
 * Get authentication token from localStorage or sessionStorage.
 * Token is stored in Zustand persist storage under 'auth-storage',
 * or in sessionStorage as 'registrationToken' for multi-step registration.
 */
const getToken = (): string | null => {
  if (typeof window === "undefined") return null;

  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      const token = parsed.state?.user?.token || parsed.state?.token || null;
      if (token) {
        return token;
      }
    }

    const registrationToken = sessionStorage.getItem("registrationToken");
    if (registrationToken) {
      return registrationToken;
    }
  } catch (error) {
    console.error("Error reading token from storage:", error);
  }

  return null;
};

/** Get selected branch ID from localStorage (Zustand persist storage under 'branch-storage'). */
const getBranchId = (): string | number | null => {
  if (typeof window === "undefined") return null;

  try {
    const branchStorage = localStorage.getItem("branch-storage");
    if (branchStorage) {
      const parsed = JSON.parse(branchStorage);
      const selectedBranch = parsed.state?.selectedBranch;
      return selectedBranch?.id || selectedBranch?.branch_id || null;
    }
  } catch (error) {
    console.error("Error reading branch from storage:", error);
  }

  return null;
};

const getLanguage = getLanguageFromCookie;

/**
 * URLs that should exclude branch_id: /branches, Google web login, customer/*,
 * notifications/*, and the public Stripe config endpoint.
 */
const shouldExcludeBranchId = (url?: string | null): boolean => {
  if (!url) return true;

  const urlPath = url.split("?")[0].replace(/^https?:\/\/[^/]+/, "");

  if (
    urlPath === "/branches" ||
    urlPath === "/v1/branches" ||
    urlPath === "/branches/default" ||
    urlPath === "/v1/branches/default"
  ) {
    return true;
  }

  const excludePatterns = [
    "/auth/google/web-login",
    "/customer/",
    "/notifications/",
    "/payments/stripe/config",
  ];

  return excludePatterns.some((pattern) => urlPath.includes(pattern));
};

/**
 * Request Interceptor
 * Adds Bearer token, branch_id, and Accept-Language header to all requests if available
 */
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (config.url?.includes("complete-registration")) {
      console.warn("No token found for complete-registration request");
    }

    const language = getLanguage();
    config.headers["Accept-Language"] = language;

    // Remove Content-Type header for FormData to let axios set it automatically with boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    const branchId = getBranchId();
    const fullUrl =
      config.baseURL && config.url
        ? `${config.baseURL}${config.url.startsWith("/") ? "" : "/"}${config.url}`
        : config.url;

    if (branchId && !shouldExcludeBranchId(fullUrl)) {
      const method = config.method?.toLowerCase();

      if (method === "get" || method === "delete") {
        config.params = config.params || {};
        if (!config.params.branch_id) {
          config.params.branch_id = branchId;
        }
      } else if (method === "post" || method === "put" || method === "patch") {
        if (config.data instanceof FormData) {
          if (!config.data.has("branch_id")) {
            config.data.append("branch_id", String(branchId));
          }
        } else if (config.data && typeof config.data === "object") {
          if (!config.data.branch_id) {
            config.data = { ...config.data, branch_id: branchId };
          }
        } else if (config.data && typeof config.data === "string") {
          try {
            const parsed = JSON.parse(config.data);
            if (!parsed.branch_id) {
              parsed.branch_id = branchId;
              config.data = JSON.stringify(parsed);
            }
          } catch {
            config.data = JSON.stringify({ branch_id: branchId });
          }
        } else {
          config.data = { branch_id: branchId };
        }
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor
 * Unwraps `{ success, data, message }` API envelopes and normalizes errors.
 */
axiosInstance.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === "object" && "success" in response.data) {
      return response.data;
    }
    return response.data;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        const isAuthRequest =
          error.config?.url?.includes("/auth/login") ||
          error.config?.url?.includes("/auth/register") ||
          error.config?.url?.includes("/auth/google");

        if (!isAuthRequest && typeof window !== "undefined") {
          localStorage.removeItem("auth-storage");
          window.location.href = "/login";
        }

        return Promise.reject({
          message: "Unauthorized - Please login again",
          status: 401,
          data,
        });
      }

      if (status === 403) {
        return Promise.reject({
          message: data?.error || data?.message || "Access forbidden",
          status: 403,
          data,
        });
      }

      if (status === 404) {
        return Promise.reject({
          message: data?.error || data?.message || "Resource not found",
          status: 404,
          data,
        });
      }

      if (status === 400) {
        let errorMessage = "Bad Request";
        if (data?.errors?.error) {
          errorMessage = data.errors.error;
        } else if (data?.error) {
          errorMessage = data.error;
        } else if (data?.message) {
          errorMessage = data.message;
        } else if (data?.errors) {
          const errorValues = Object.values(data.errors).flat();
          if (errorValues.length > 0) {
            errorMessage = errorValues.join(", ");
          }
        }

        return Promise.reject({
          message: errorMessage,
          status: 400,
          data,
          response: error.response,
        });
      }

      if (status === 422) {
        const errorMessage = data?.errors
          ? Object.values(data.errors).flat().join(", ")
          : data?.error || data?.message || "Validation failed";

        return Promise.reject({
          message: errorMessage,
          status: 422,
          data,
        });
      }

      if (status >= 500) {
        return Promise.reject({
          message: data?.error || data?.message || "Server error. Please try again later.",
          status,
          data,
        });
      }

      const errorMessage = data?.error || data?.message || data?.errors?.error || `API Error: ${error.message}`;
      return Promise.reject({
        message: errorMessage,
        status,
        data,
        response: error.response,
      });
    }

    if (error.request) {
      return Promise.reject({
        message: "Network error. Please check your connection.",
        status: null,
        data: null,
      });
    }

    return Promise.reject({
      message: error.message || "An unexpected error occurred",
      status: null,
      data: null,
    });
  }
);

export default axiosInstance;
