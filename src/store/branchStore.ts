"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "../api";
import {
  generateCacheKey,
  getCachedData,
  setCachedData,
  getPendingRequest,
  setPendingRequest,
  CACHE_DURATION,
} from "../lib/utils/apiCache";
import { getLanguageFromCookie } from "../lib/utils/language";
import useAuthStore from "./authStore";

export interface Branch {
  id?: string | number;
  branch_id?: string | number;
  is_main?: boolean;
  [key: string]: unknown;
}

interface ActionResult {
  success: boolean;
  error?: string;
  message?: string;
  branches?: Branch[];
  branch?: Branch;
  data?: Branch;
}

interface BranchState {
  selectedBranch: Branch | null;
  branches: Branch[];
  branchDetails: Branch | null;
  isLoading: boolean;
  isLoadingDetails: boolean;

  fetchBranches: () => Promise<ActionResult>;
  setSelectedBranch: (branch: Branch | null) => void;
  getSelectedBranchId: () => string | number | null;
  fetchBranchDetails: (branchId: string | number) => Promise<ActionResult>;
  getBranchContactInfo: () => { address: string | null; email: string | null; phone: string | null } | null;
  getBranchWorkingHours: () => string | null;
  getBranchLocation: () => { latitude: number | null; longitude: number | null } | null;
  setBranchFromUserProfile: (branchId: string | number) => Promise<ActionResult>;
  syncWithUserProfile: () => Promise<ActionResult>;
  initialize: () => Promise<void>;
}

const useBranchStore = create<BranchState>()(
  persist(
    (set, get) => ({
      selectedBranch: null,
      branches: [],
      branchDetails: null,
      isLoading: false,
      isLoadingDetails: false,

      fetchBranches: async () => {
        const language = getLanguageFromCookie();
        const cacheKey = generateCacheKey("/branches", {}, null, language);
        const ttl = CACHE_DURATION.BRANCHES || 10 * 60 * 1000;

        const cached = getCachedData(cacheKey) as { data?: Branch[] | { branches?: Branch[] } } | null;
        if (cached !== null) {
          const branches: Branch[] = Array.isArray(cached?.data)
            ? cached.data
            : (cached?.data as { branches?: Branch[] })?.branches || [];
          set({ branches, isLoading: false });
          return { success: true, branches };
        }

        const pending = getPendingRequest(cacheKey);
        if (pending) {
          try {
            const response = (await pending) as { success?: boolean; data?: Branch[] | { branches?: Branch[] } };
            if (response.success && response.data) {
              const branches: Branch[] = Array.isArray(response.data)
                ? response.data
                : (response.data as { branches?: Branch[] })?.branches || [];
              set({ branches, isLoading: false });
              return { success: true, branches };
            }
          } catch {
            // fall through to fresh fetch
          }
        }

        set({ isLoading: true });
        try {
          const fetchPromise = api.branches.getAllBranches().then((response) => {
            setCachedData(cacheKey, response, ttl);
            return response;
          });

          setPendingRequest(cacheKey, fetchPromise);

          const response = await fetchPromise;

          if (response.success && response.data) {
            const branches: Branch[] = Array.isArray(response.data)
              ? (response.data as Branch[])
              : (response.data as { branches?: Branch[] }).branches || [];

            set({ branches, isLoading: false });
            return { success: true, branches };
          }
          set({ isLoading: false });
          return { success: false, error: response.message || "Failed to fetch branches" };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: (error as Error).message || "An error occurred while fetching branches" };
        }
      },

      setSelectedBranch: (branch) => {
        if (!branch) return;
        set({ selectedBranch: branch });
        const branchId = branch.id || branch.branch_id;
        if (branchId) {
          get().fetchBranchDetails(branchId);
        }
      },

      getSelectedBranchId: () => {
        const selectedBranch = get().selectedBranch;
        return selectedBranch?.id || selectedBranch?.branch_id || null;
      },

      fetchBranchDetails: async (branchId) => {
        const currentDetails = get().branchDetails;
        const currentBranchId = currentDetails?.id || currentDetails?.branch_id;

        if (currentBranchId === branchId && currentDetails) {
          return { success: true, data: currentDetails };
        }

        const language = getLanguageFromCookie();
        const cacheKey = generateCacheKey(`/branches/${branchId}`, {}, branchId, language);
        const ttl = CACHE_DURATION.BRANCHES || 10 * 60 * 1000;

        const cached = getCachedData(cacheKey) as { data?: { branch?: Branch } | Branch } | null;
        if (cached !== null) {
          const details = (cached?.data as { branch?: Branch })?.branch || (cached?.data as Branch);
          set({ branchDetails: details, isLoadingDetails: false });
          return { success: true, data: details };
        }

        const pending = getPendingRequest(cacheKey);
        if (pending) {
          try {
            const response = (await pending) as { success?: boolean; data?: { branch?: Branch } | Branch };
            if (response?.success && response.data) {
              const details = (response.data as { branch?: Branch }).branch || (response.data as Branch);
              set({ branchDetails: details, isLoadingDetails: false });
              return { success: true, data: details };
            }
          } catch {
            // fall through to fresh fetch
          }
        }

        set({ isLoadingDetails: true });
        try {
          const fetchPromise = api.branches.getBranchById(branchId).then((response) => {
            setCachedData(cacheKey, response, ttl);
            return response;
          });

          setPendingRequest(cacheKey, fetchPromise);

          const response = await fetchPromise;

          if (response?.success && response.data) {
            const details = (response.data as { branch?: Branch }).branch || (response.data as Branch);
            set({ branchDetails: details, isLoadingDetails: false });
            return { success: true, data: details };
          }
          set({ isLoadingDetails: false });
          return { success: false, error: "Failed to fetch branch details" };
        } catch (error) {
          set({ isLoadingDetails: false });
          return {
            success: false,
            error: (error as Error).message || "An error occurred while fetching branch details",
          };
        }
      },

      getBranchContactInfo: () => {
        const details = get().branchDetails;
        if (!details) return null;

        return {
          address: (details.address || details.location || null) as string | null,
          email: (details.email || details.contact_email || null) as string | null,
          phone: (details.phone || details.contact_phone || details.telephone || null) as string | null,
        };
      },

      getBranchWorkingHours: () => {
        const details = get().branchDetails;
        if (!details) return null;
        return (details.working_hours || details.opening_hours || details.hours || null) as string | null;
      },

      getBranchLocation: () => {
        const details = get().branchDetails;
        if (!details) return null;

        return {
          latitude: (details.latitude || details.lat || null) as number | null,
          longitude: (details.longitude || details.lng || details.lon || null) as number | null,
        };
      },

      setBranchFromUserProfile: async (branchId) => {
        if (!branchId) return { success: false, error: "Branch ID is required" };

        try {
          const branches = get().branches;
          const existingBranch = branches.find((b) => b.id === branchId || b.branch_id === branchId);

          if (existingBranch) {
            set({ selectedBranch: existingBranch });
            await get().fetchBranchDetails(branchId);
            return { success: true, branch: existingBranch };
          }
          const response = await get().fetchBranchDetails(branchId);
          if (response.success && response.data) {
            const branch = response.data;
            set({ selectedBranch: branch });
            return { success: true, branch };
          }
          return { success: false, error: "Failed to fetch branch details" };
        } catch (error) {
          return {
            success: false,
            error: (error as Error).message || "An error occurred while setting branch from user profile",
          };
        }
      },

      syncWithUserProfile: async () => {
        const authStore = useAuthStore.getState();

        if (!authStore.isAuthenticated || !authStore.user) {
          return { success: false, error: "User is not authenticated" };
        }

        const userBranchId = authStore.user.branch_id;
        if (!userBranchId) {
          return { success: false, error: "User does not have a branch_id" };
        }

        const currentBranchId = get().getSelectedBranchId();
        if (currentBranchId === userBranchId) {
          return { success: true, message: "Branch already matches user profile" };
        }

        return await get().setBranchFromUserProfile(userBranchId);
      },

      initialize: async () => {
        const { branches, selectedBranch } = get();

        if (selectedBranch) {
          const branchId = selectedBranch.id || selectedBranch.branch_id;
          const currentDetails = get().branchDetails;
          const currentBranchId = currentDetails?.id || currentDetails?.branch_id;

          if (branchId && currentBranchId !== branchId) {
            get().fetchBranchDetails(branchId);
          }
          return;
        }

        if (branches.length === 0) {
          await get().fetchBranches();
        }

        const authStore = useAuthStore.getState();

        if (authStore.isAuthenticated && authStore.user?.branch_id) {
          const userBranchId = authStore.user.branch_id;
          await get().setBranchFromUserProfile(userBranchId);
        } else {
          try {
            const response = await api.branches.getDefaultBranch();
            if (response.success && (response.data as { branch?: Branch })?.branch) {
              const defaultBranch = (response.data as { branch: Branch }).branch;
              set({ selectedBranch: defaultBranch });
              const branchId = defaultBranch.id || defaultBranch.branch_id;
              if (branchId) {
                await get().fetchBranchDetails(branchId);
              }
            } else {
              const branches = get().branches;
              if (branches.length > 0) {
                const mainBranch = branches.find((b) => b.is_main === true) || branches[0];
                set({ selectedBranch: mainBranch });
                const branchId = mainBranch.id || mainBranch.branch_id;
                if (branchId) {
                  await get().fetchBranchDetails(branchId);
                }
              }
            }
          } catch (error) {
            console.warn("Failed to fetch default branch, using fallback:", error);
            const branches = get().branches;
            if (branches.length > 0) {
              const mainBranch = branches.find((b) => b.is_main === true) || branches[0];
              set({ selectedBranch: mainBranch });
              const branchId = mainBranch.id || mainBranch.branch_id;
              if (branchId) {
                await get().fetchBranchDetails(branchId);
              }
            }
          }
        }
      },
    }),
    {
      name: "branch-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedBranch: state.selectedBranch,
        branches: state.branches,
      }),
      version: 1,
      migrate: (persistedState) => {
        return persistedState || { selectedBranch: null, branches: [] };
      },
    }
  )
);

export default useBranchStore;
