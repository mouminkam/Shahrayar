"use client";
import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, Package, LogOut, Edit, Camera, ChevronDown } from "lucide-react";
import OptimizedImage from "../../ui/OptimizedImage";
import dynamic from "next/dynamic";
import useAuthStore, { type AuthUser } from "../../../store/authStore";
import useBranchStore from "../../../store/branchStore";
import useToastStore from "../../../store/toastStore";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";
import { getFullImageUrl } from "../../../lib/utils/imageUtils";

// Lazy load ProfileEditModal
const ProfileEditModal = dynamic(
  () => import("./ProfileEditModal"),
  {
    ssr: false,
  }
);

interface Branch {
  id?: string | number;
  branch_id?: string | number;
  name?: string;
  title?: string;
  [key: string]: unknown;
}

interface ProfileSidebarProps {
  user: AuthUser;
  totalOrders?: number;
}

export default function ProfileSidebar({ user, totalOrders = 0 }: ProfileSidebarProps) {
  const { push } = useLocalizedRouter();
  const { logout, updateProfile, isLoading: isUpdatingProfile } = useAuthStore();
  const {
    selectedBranch,
    branches,
    isLoading: isLoadingBranches,
    fetchBranches,
    initialize
  } = useBranchStore();
  const { success: toastSuccess, error: toastError } = useToastStore();
  const { lang } = useLanguage();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);

  // Convert relative image path to full URL for Next.js Image component
  const userImageUrl = useMemo(() => {
    const imagePath = user?.image || user?.image_url || user?.avatar;
    return imagePath ? getFullImageUrl(imagePath as string) : null;
  }, [user?.image, user?.image_url, user?.avatar]);

  // Initialize branches on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Fetch branches if empty
  useEffect(() => {
    if (branches.length === 0 && !isLoadingBranches) {
      fetchBranches();
    }
  }, [branches.length, isLoadingBranches, fetchBranches]);

  const handleBranchChange = async (branchId: string | number) => {
    const branch = branches.find((b: Branch) => (b.id || b.branch_id) === branchId);
    if (!branch) return;

    const currentBranchId = user?.branch_id || selectedBranch?.id || selectedBranch?.branch_id;
    const newBranchId = branch.id || branch.branch_id;

    // If same branch, do nothing
    if (currentBranchId === newBranchId) {
      setIsBranchDropdownOpen(false);
      return;
    }

    setIsBranchDropdownOpen(false);

    try {
      // Update branch_id in user profile
      const result = await updateProfile({ branch_id: newBranchId });

      if (result.success) {
        // Show success notification
        const branchName = String(branch.name || branch.title || t(lang, "select_branch"));
        toastSuccess(t(lang, "branch_changed_cart_cleared")?.replace("{name}", branchName) || `Branch changed to ${branchName}`);
      } else {
        toastError(result.error || t(lang, "failed_to_update_branch") || "Failed to update branch");
      }
    } catch (error) {
      const err = error as { message?: string };
      console.error("Error updating branch:", error);
      toastError(err.message || t(lang, "failed_to_update_branch") || "Failed to update branch");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      push("/");
    } catch {
      // Logout will still clear local state even if API call fails
      push("/");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-linear-to-br from-bgimg/90 via-bgimg to-bgimg/95 backdrop-blur-sm rounded-3xl shadow-2xl shadow-theme3/10 border border-white/10 p-6 lg:p-8 sticky top-8"
    >
      {/* User Avatar & Name */}
      <div className="text-center mb-6">
        <div className="relative inline-block">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-24 h-24 rounded-full bg-theme3 flex items-center justify-center mx-auto mb-4 shadow-xl overflow-hidden relative"
          >
            {userImageUrl ? (
              <OptimizedImage
                src={userImageUrl}
                alt={user.name || "Profile"}
                width={96}
                height={96}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <User className="w-12 h-12 text-white" />
            )}
          </motion.div>
          <motion.button
            onClick={() => setIsEditModalOpen(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute bottom-0 right-0 w-8 h-8 cursor-pointer bg-theme3 rounded-full flex items-center justify-center shadow-lg hover:bg-theme3/90 transition-colors border-2 border-bgimg"
            aria-label={t(lang, "edit_profile")}
          >
            <Camera className="w-4 h-4 text-white" />
          </motion.button>
        </div>
        <div className="flex items-center justify-center gap-2">
          <h3 className="text-white text-2xl font-black uppercase">
            {user.name}
          </h3>
          <motion.button
            onClick={() => setIsEditModalOpen(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className=" w-8 h-8 bg-theme3 cursor-pointer rounded-full flex items-center justify-center shadow-lg hover:bg-theme3/90 transition-colors border-2 border-bgimg"
            aria-label={t(lang, "edit_profile")}
          >
            <Edit className="w-4 h-4 text-white " />
          </motion.button>
        </div>
        <p className="text-text text-sm mt-1">{user.email}</p>
      </div>

      {/* User Info */}
      <div className="space-y-4 mb-6 pt-6 border-t border-white/10">
        <div className="flex items-start gap-3">
          <Mail className="w-5 h-5 text-theme3 mt-0.5 shrink-0" />
          <div>
            <p className="text-text text-xs font-medium mb-1">{t(lang, "email_label").replace(":", "")}</p>
            <p className="text-white  text-sm">
              {user.email}
            </p>
          </div>
        </div>

        {user.phone && (
          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-theme3 mt-0.5 shrink-0" />
            <div>
              <p className="text-text text-xs font-medium mb-1">{t(lang, "phone_label").replace(":", "")}</p>
              <p className="text-white  text-sm">
                {user.phone}
              </p>
            </div>
          </div>
        )}

        {(user.address as { street?: string; city?: string; state?: string; zipCode?: string } | undefined)?.street && (
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-theme3 mt-0.5 shrink-0" />
            <div>
              <p className="text-text text-xs font-medium mb-1">{t(lang, "address")}</p>
              <p className="text-white  text-sm">
                {(user.address as { street?: string }).street}
                <br />
                {(user.address as { city?: string }).city}, {(user.address as { state?: string }).state} {(user.address as { zipCode?: string }).zipCode}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Branch Selector */}
      <div className="mb-6 pt-6 border-t border-white/10">
        <label className="block text-text text-xs font-medium mb-2">
          {t(lang, "branch") || "Branch"}
        </label>
        <div className="relative">
          <button
            onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
            disabled={isLoadingBranches || isUpdatingProfile || branches.length === 0}
            className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm font-medium transition-all duration-300 hover:bg-white/20 focus:outline-none focus:border-theme3 focus:ring-2 focus:ring-theme3/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <MapPin className="w-4 h-4 text-theme3 shrink-0" />
              <span className="truncate">
                {selectedBranch?.name || selectedBranch?.title || user?.branch_id
                  ? `${t(lang, "branch")} ${user?.branch_id || selectedBranch?.id || selectedBranch?.branch_id}`
                  : t(lang, "select_branch") || "Select Branch"}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-300 ${isBranchDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isBranchDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-[10000]"
                onClick={() => setIsBranchDropdownOpen(false)}
              />
              <div className="absolute top-full left-0 right-0 mt-2 bg-bgimg border border-white/20 rounded-xl shadow-2xl z-[10001] max-h-64 overflow-y-auto">
                {isLoadingBranches ? (
                  <div className="p-4 text-center text-text text-sm">{t(lang, "loading_branches") || "Loading branches..."}</div>
                ) : branches.length === 0 ? (
                  <div className="p-4 text-center text-text text-sm">{t(lang, "no_branches_available") || "No branches available"}</div>
                ) : (
                  <ul className="py-2">
                    {branches.map((branch: Branch) => {
                      const branchId = branch.id || branch.branch_id;
                      const currentBranchId = user?.branch_id || selectedBranch?.id || selectedBranch?.branch_id;
                      const isSelected = branchId === currentBranchId;
                      return (
                        <li key={branchId}>
                          <button
                            onClick={() => branchId !== undefined && handleBranchChange(branchId)}
                            disabled={isUpdatingProfile}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                              isSelected
                                ? 'bg-theme3/20 text-theme3 font-medium'
                                : 'text-text hover:bg-white/10'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {branch.name || branch.title || `Branch ${branchId}`}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 mb-6 pt-6 border-t border-white/10">
        <div className="text-center p-3 bg-white/5 rounded-xl">
          <Package className="w-6 h-6 text-theme3 mx-auto mb-2" />
          <p className="text-white  text-xl font-black">
            {totalOrders}
          </p>
          <p className="text-text text-xs">{t(lang, "orders")}</p>
        </div>
      </div>

      {/* Logout Button */}
      <motion.button
        onClick={handleLogout}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full border-2 border-red-500/50 text-red-400 py-3 px-6 hover:bg-red-500/20 transition-all duration-300 text-base  font-medium rounded-xl flex items-center justify-center gap-2"
      >
        <LogOut className="w-5 h-5" />
        {t(lang, "logout")}
      </motion.button>

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </motion.div>
  );
}
