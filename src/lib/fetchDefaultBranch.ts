import { createServerAxios } from "../api/config/serverAxios";

export interface Branch {
  id?: string | number;
  branch_id?: string | number;
  [key: string]: unknown;
}

/**
 * Resolve default (or user-linked) branch for server components.
 */
export async function fetchDefaultBranch(lang: string, token: string | null): Promise<Branch | null> {
  try {
    const serverAxios = await createServerAxios({ language: lang, token });

    if (token) {
      try {
        const profileResponse = await serverAxios.get("/auth/profile");
        if (profileResponse?.data?.success && profileResponse.data.data?.user?.branch_id) {
          const userBranchId = profileResponse.data.data.user.branch_id;
          const branchResponse = await serverAxios.get(`/branches/${userBranchId}`);
          if (branchResponse?.data?.success && branchResponse.data.data?.branch) {
            return branchResponse.data.data.branch;
          }
        }
      } catch (profileError) {
        console.warn("Failed to fetch user profile, using default branch:", profileError);
      }
    }

    const response = await serverAxios.get("/branches/default");
    return response?.data?.success ? response.data.data?.branch : null;
  } catch (error) {
    console.error("Error fetching default branch:", error);
    return null;
  }
}
