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
 * A small artificial delay is added so loading states, skeletons, and Suspense
 * boundaries behave the way they would against a real network — this is a demo of
 * the actual UX, not a stripped-down one.
 */

import type { ApiResponse } from "../api/types";

const SIMULATED_LATENCY_MS = 350;

/** Resolves after a short, jittered delay to emulate real network latency. */
function delay(ms: number = SIMULATED_LATENCY_MS): Promise<void> {
  const jitter = Math.random() * 150;
  return new Promise((resolve) => setTimeout(resolve, ms + jitter));
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
