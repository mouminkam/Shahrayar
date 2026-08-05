import { headers } from "next/headers";

/**
 * Server-side function to get authentication token from Authorization header
 * Reads Bearer token from request headers
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    const headersList = await headers();
    const authHeader = headersList.get("authorization");

    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7); // Remove 'Bearer ' prefix
    }

    return null;
  } catch (error) {
    console.error("Error reading Authorization header:", error);
    return null;
  }
}
