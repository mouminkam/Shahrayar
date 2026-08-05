import axiosInstance from "./config/axios";
import type { ApiResponse } from "./types";

// Payloads are consumed with direct property access across components;
// Record<string, unknown> keeps that ergonomic without modeling every field.
type BranchesApiResponse = ApiResponse<Record<string, unknown>>;

export const getAllBranches = async (params: Record<string, unknown> = {}): Promise<BranchesApiResponse> => {
  return axiosInstance.get<BranchesApiResponse, BranchesApiResponse>("/branches", { params });
};

export const getBranchById = async (branchId: string | number): Promise<BranchesApiResponse> => {
  return axiosInstance.get<BranchesApiResponse, BranchesApiResponse>(`/branches/${branchId}`);
};

export const getUpsellItems = async (
  branchId: string | number,
  params: Record<string, unknown> = {}
): Promise<BranchesApiResponse> => {
  return axiosInstance.get<BranchesApiResponse, BranchesApiResponse>(`/branches/${branchId}/upsell-items`, { params });
};

export const getChefs = async (branchId: string | number): Promise<BranchesApiResponse> => {
  return axiosInstance.get<BranchesApiResponse, BranchesApiResponse>("/chefs", {
    params: { branch_id: branchId },
  });
};

export const getDefaultBranch = async (): Promise<BranchesApiResponse> => {
  return axiosInstance.get<BranchesApiResponse, BranchesApiResponse>("/branches/default");
};

const branchesAPI = {
  getAllBranches,
  getBranchById,
  getUpsellItems,
  getChefs,
  getDefaultBranch,
};

export default branchesAPI;
