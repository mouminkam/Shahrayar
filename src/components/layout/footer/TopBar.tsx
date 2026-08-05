"use client";
import { useMemo, useEffect } from "react";
import { MapPin, Mail, Phone } from "lucide-react";
import { useInView } from "react-intersection-observer";
import useBranchStore from "../../../store/branchStore";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";

export default function TopBar() {
  const { selectedBranch, initialize, branchDetails, isLoadingDetails, getBranchContactInfo, fetchBranchDetails } = useBranchStore();
  const { lang } = useLanguage();

  // Intersection Observer - trigger fetch when footer is visible
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  // Initialize branch if not loaded
  useEffect(() => {
    if (!selectedBranch) {
      initialize();
    }
  }, [selectedBranch, initialize]);

  // Fetch branch details when footer becomes visible (only if not already loaded)
  useEffect(() => {
    if (!inView || !selectedBranch) {
        return;
      }

    const branchId = selectedBranch.id || selectedBranch.branch_id;
    const currentDetails = branchDetails;
    const currentBranchId = currentDetails?.id || currentDetails?.branch_id;

    // Only fetch if we don't have details for this branch
    if (branchId && currentBranchId !== branchId) {
      fetchBranchDetails(branchId);
    }
  }, [inView, selectedBranch, branchDetails, fetchBranchDetails]);

  // Get contact info from store with fallback defaults
  const contactInfo = useMemo(() => {
    const info = getBranchContactInfo();
          const defaultInfo = {
            address: "4648 Rocky Road Philadelphia",
            email: "info@exmple.com",
            phone: "+88 0123 654 99",
          };

    return {
      address: (info?.address as string) || defaultInfo.address,
      email: (info?.email as string) || defaultInfo.email,
      phone: (info?.phone as string) || defaultInfo.phone,
    };
  }, [getBranchContactInfo, branchDetails]);
  return (
    <div ref={ref} className="bg-theme3 rounded-2xl px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-10 md:py-12 mb-8 md:mb-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Address */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-theme3" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-gray-900 text-xs sm:text-sm font-medium mb-1 sm:mb-2 capitalize">
              {t(lang, "address")}
            </p>
            <p className="text-gray-900 text-base sm:text-lg md:text-xl font-medium break-words">
              {contactInfo.address}
            </p>
          </div>
        </div>

        {/* Send Email */}
        <div className="flex items-center gap-3 sm:gap-4 sm:justify-start lg:justify-end">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5 text-theme3" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-gray-900 text-xs sm:text-sm font-medium mb-1 sm:mb-2 capitalize">
              {t(lang, "send_email")}
            </p>
            <p className="text-gray-900 text-base sm:text-lg md:text-xl font-medium break-all">
              {contactInfo.email}
            </p>
          </div>
        </div>

        {/* Call */}
        <div className="flex items-center gap-3 sm:gap-4 sm:justify-start lg:justify-end sm:col-span-2 lg:col-span-1">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0">
            <Phone className="w-5 h-5 text-theme3" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-gray-900 text-xs sm:text-sm font-medium mb-1 sm:mb-2 capitalize">
              {t(lang, "call")}
            </p>
            <p className="text-gray-900 text-base sm:text-lg md:text-xl font-medium">
              {contactInfo.phone}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
