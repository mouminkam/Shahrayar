"use client";
import { useMemo, useEffect, type ReactNode } from "react";
import { Mail, Phone, Clock, type LucideIcon } from "lucide-react";
import { useInView } from "react-intersection-observer";
import useBranchStore from "../../../store/branchStore";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";

// Helper function to format working hours from object to string
const formatWorkingHours = (hours: unknown): string | null => {
  if (!hours) return null;

  // If it's already a string, return it
  if (typeof hours === "string") return hours;

  // If it's an object with days, format it
  if (typeof hours === "object") {
    const hoursObj = hours as Record<string, string>;
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const formattedDays = days
      .filter((day) => hoursObj[day])
      .map((day) => {
        const dayName = day.charAt(0).toUpperCase() + day.slice(1);
        const hoursStr = hoursObj[day];
        return `${dayName}: ${hoursStr}`;
      });

    return formattedDays.length > 0 ? formattedDays.join(" | ") : null;
  }

  return null;
};

interface ContactItem {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
}

export default function ContactInfo() {
  const { selectedBranch, initialize, branchDetails, getBranchWorkingHours, fetchBranchDetails } = useBranchStore();
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

  // Get contact info from branchDetails with fallback defaults
  const contactInfo = useMemo(() => {
    const defaultInfo = {
      address: "4517 Washington Ave. Manchester, Kentucky 39495",
      email: "info@example.com",
      phone: "+208-666-01112",
      workingHours: {
        weekdays: "8am – 4pm",
        saturday: "8am – 12am",
      },
    };

    if (!branchDetails) {
      return defaultInfo;
    }

    const rawWorkingHours = getBranchWorkingHours();
    const formattedWorkingHours = formatWorkingHours(rawWorkingHours);

    // Parse working hours to extract weekdays and saturday if formatted
    let weekdaysHours = defaultInfo.workingHours.weekdays;
    let saturdayHours = defaultInfo.workingHours.saturday;

    if (formattedWorkingHours) {
      // Try to extract Monday-Friday and Saturday from formatted string
      const mondayFridayMatch = formattedWorkingHours.match(/Monday.*?Friday[:\s]+([^|]+)/i);
      const saturdayMatch = formattedWorkingHours.match(/Saturday[:\s]+([^|]+)/i);

      if (mondayFridayMatch) {
        weekdaysHours = mondayFridayMatch[1].trim();
      }
      if (saturdayMatch) {
        saturdayHours = saturdayMatch[1].trim();
      }
    }

    return {
      address: (branchDetails.address as string) || defaultInfo.address,
      email: (branchDetails.email as string) || defaultInfo.email,
      phone: (branchDetails.phone as string) || defaultInfo.phone,
      workingHours: {
        weekdays: weekdaysHours,
        saturday: saturdayHours,
      },
    };
  }, [branchDetails, getBranchWorkingHours]);

  const contactItems: ContactItem[] = [
    {
      icon: Mail,
      label: t(lang, "email_us"),
      value: contactInfo.email,
    },
    {
      icon: Phone,
      label: t(lang, "phone"),
      value: contactInfo.phone,
    },
    {
      icon: Clock,
      label: t(lang, "opening_hour"),
      value: (
        <>
          <span className="block">{t(lang, "monday_friday")} <span className="text-theme3 font-semibold">{contactInfo.workingHours.weekdays}</span></span>
          <span className="block">{t(lang, "saturday")} <span className="text-theme3 font-semibold">{contactInfo.workingHours.saturday}</span></span>
        </>
      ),
    },
  ];

  return (
    <div ref={ref} className="mt-6 sm:mt-8 md:mt-0 lg:pl-6 xl:pl-12 sm:col-span-2 lg:col-span-1">
      <div className="mb-6 sm:mb-8">
        <h3 className="text-white text-xl sm:text-2xl font-bold inline-block relative pb-4 sm:pb-5">
          {t(lang, "contact_us")}
          {/* Orange Line */}
          <span className="absolute bottom-0 left-0 w-6 h-0.5 bg-theme3"></span>
          {/* White Line */}
          <span className="absolute bottom-0 left-10 w-12 sm:w-14 h-0.5 bg-white"></span>
        </h3>
      </div>

      {/* Contact Information List */}
      <ul className="space-y-4 sm:space-y-5">
        {contactItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <li key={index} className="flex items-start gap-3 sm:gap-4">
              <div className="mt-1 shrink-0">
                <div className="p-2 rounded-lg bg-theme3/20 border border-theme3/30">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-theme3" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-theme3 text-xs sm:text-sm font-semibold mb-1 uppercase tracking-wide">
                  {item.label}
                </div>
                <div className="text-white text-sm sm:text-base leading-relaxed break-words">
                  {item.value}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
