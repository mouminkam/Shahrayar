import axios, { type AxiosInstance } from "axios";
import { getLanguage } from "../../lib/getLanguage";
import { getAuthToken } from "../../lib/getAuthToken";

export interface ServerAxiosOptions {
  language?: string;
  token?: string | null;
}

/**
 * Create axios instance for Server Components.
 * By default reads Accept-Language and Authorization from cookies/headers.
 * Pass { language, token } to avoid dynamic data reads (e.g. inside unstable_cache).
 */
export async function createServerAxios(options?: ServerAxiosOptions): Promise<AxiosInstance> {
  const language =
    options != null && "language" in options ? options.language : await getLanguage();
  const token =
    options != null && "token" in options ? options.token : await getAuthToken();
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "https://shahrayar.peaklink.pro/api/v1";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Accept-Language": language ?? "bg",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers,
  });
}
