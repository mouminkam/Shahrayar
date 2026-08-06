import type { ApiResponse } from "./types";
import { mockResponse } from "../mocks/mockClient";
import { mockBranches, getMockDefaultBranch } from "../mocks/fixtures/branches";
import { mockChefs } from "../mocks/fixtures/chefs";

type BranchesApiResponse = ApiResponse<Record<string, unknown>>;

export const getAllBranches = async (_params: Record<string, unknown> = {}): Promise<BranchesApiResponse> => {
  // PRODUCTION: return axiosInstance.get<BranchesApiResponse>("/branches", { params });
  return mockResponse({ branches: mockBranches });
};

export const getBranchById = async (branchId: string | number): Promise<BranchesApiResponse> => {
  // PRODUCTION: return axiosInstance.get<BranchesApiResponse>(`/branches/${branchId}`);
  const branch = mockBranches.find((b) => String(b.id) === String(branchId));
  return mockResponse({ branch: branch ?? getMockDefaultBranch() });
};

export const getUpsellItems = async (
  _branchId: string | number,
  _params: Record<string, unknown> = {}
): Promise<BranchesApiResponse> => {
  // PRODUCTION: return axiosInstance.get<BranchesApiResponse>(`/branches/${branchId}/upsell-items`, { params });
  const { mockMenuItems } = await import("../mocks/fixtures/menuItems");
  return mockResponse({ items: mockMenuItems.filter((i) => i.category_id === 4).slice(0, 3) });
};

export const getChefs = async (_branchId: string | number): Promise<BranchesApiResponse> => {
  // PRODUCTION: return axiosInstance.get<BranchesApiResponse>("/chefs", { params: { branch_id: branchId } });
  return mockResponse({ chefs: mockChefs });
};

export const getDefaultBranch = async (): Promise<BranchesApiResponse> => {
  // PRODUCTION: return axiosInstance.get<BranchesApiResponse>("/branches/default");
  return mockResponse({ branch: getMockDefaultBranch() });
};

const branchesAPI = {
  getAllBranches,
  getBranchById,
  getUpsellItems,
  getChefs,
  getDefaultBranch,
};

export default branchesAPI;
