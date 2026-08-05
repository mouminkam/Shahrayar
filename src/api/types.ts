/**
 * Shared response envelope for this backend. The axios response interceptor
 * (src/api/config/axios.ts) unwraps `AxiosResponse` and resolves directly with
 * this shape, so every api/*.ts function's return type is `Promise<ApiResponse<T>>`,
 * not `Promise<AxiosResponse<...>>`.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]> | string;
}
