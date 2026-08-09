/**
 * Mock data client — the single seam between this portfolio build and a real backend.
 *
 * WHY THIS EXISTS
 * This project is deployed here as a **frontend showcase**: there is no live API behind
 * it, so every function in `src/api/*` resolves against the realistic fixtures in
 * `src/mocks/fixtures/` instead of a network call. The response envelope
 * (`{ success, data, message }`) is identical to the shape a real backend already
 * returns (see `src/api/types.ts`), so swapping a mock for the real thing is a
 * one-line change per endpoint — replace the `mockResponse(...)` call with the
 * commented-out `axiosInstance` call directly above it. Nothing above the API layer
 * (hooks, components, stores) needs to change.
 *
 * No artificial delay is added: this build prioritizes feeling fast and
 * responsive (a portfolio demo, not a network simulator). Loading states and
 * skeletons still exist in the UI and still work correctly — they simply
 * resolve almost immediately, since there's no real round-trip to wait on.
 */

import type { ApiResponse } from "../api/types";

/** Resolves on the next microtask — keeps call sites async-safe without adding latency. */
function delay(): Promise<void> {
  return Promise.resolve();
}

/** Wraps a value in the standard `{ success, data }` envelope after a simulated round-trip. */
export async function mockResponse<T>(data: T, message?: string): Promise<ApiResponse<T>> {
  await delay();
  return { success: true, data, message };
}

/** Simulates a failed request (e.g. validation error, 404). */
export async function mockError<T = never>(message: string): Promise<ApiResponse<T>> {
  await delay();
  return { success: false, message, errors: message };
}
