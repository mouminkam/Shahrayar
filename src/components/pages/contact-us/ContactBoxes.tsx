"use client";
import { useMemo, useState, useEffect, type ReactNode } from "react";
import { MapPin, Mail, Phone, Clock, type LucideIcon } from "lucide-react";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";
import type { Branch } from "../../../lib/fetchDefaultBranch";
import type { Locale } from "../../../locales/i18n/config";

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

interface ContactBoxesProps {
  branchDetails?: Branch | null;
  lang?: Locale | null;
}

interface ContactBox {
  icon: LucideIcon;
  title: string;
  description: ReactNode;
}

export default function ContactBoxes({ branchDetails = null, lang: serverLang = null }: ContactBoxesProps) {
  const { lang: clientLang } = useLanguage();
  // Use server lang for SSR to match server render, then use client lang after hydration
  const [lang, setLang] = useState<Locale | string>(serverLang || clientLang || "bg");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated after first render
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // After hydration, always use client language when it changes
    if (isHydrated && clientLang) {
      setLang(clientLang);
    }
  }, [clientLang, isHydrated]);

  // Get contact info from branchDetails with fallback defaults
  const contactInfo = useMemo(() => {
    const defaultInfo = {
      address: "4517 Washington Ave. Manchester, Kentucky 39495",
      email: "info@example.com",
      phone: "+208-666-01112",
      workingHours: t(lang, "default_opening_hours"),
    };

    if (!branchDetails) {
      return defaultInfo;
    }

    const rawWorkingHours = branchDetails.working_hours || branchDetails.workingHours;
    const formattedWorkingHours = formatWorkingHours(rawWorkingHours) || defaultInfo.workingHours;

    return {
      address: (branchDetails.address as string) || defaultInfo.address,
      email: (branchDetails.email as string) || defaultInfo.email,
      phone: (branchDetails.phone as string) || defaultInfo.phone,
      workingHours: formattedWorkingHours,
    };
  }, [branchDetails, lang]);

  const contactBoxes: ContactBox[] = [
    {
      icon: MapPin,
      title: t(lang, "our_address"),
      description: contactInfo.address,
    },
    {
      icon: Mail,
      title: t(lang, "email_us"),
      description: (
        <>
          <h3 className="text-sm sm:text-base md:text-lg lg:text-xl break-all">{contactInfo.email}</h3>
        </>
      ),
    },
    {
      icon: Phone,
      title: t(lang, "phone"),
      description: (
        <>
          <h3 className="text-sm sm:text-base md:text-lg lg:text-xl break-all">{contactInfo.phone}</h3>
        </>
      ),
    },
    {
      icon: Clock,
      title: t(lang, "opening_hour"),
      description: contactInfo.workingHours || t(lang, "default_opening_hours"),
    },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {contactBoxes.map((box, index) => (
            <div
              key={index}
              className="group relative bg-linear-to-br from-white via-white to-white/95 backdrop-blur-sm rounded-2xl p-6 sm:p-8 lg:p-10 text-center h-full transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:shadow-theme3/20 border-2 border-theme3/20 hover:border-theme3 overflow-hidden"
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-linear-to-br from-theme3/5 via-transparent to-theme/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

              {/* Content wrapper */}
              <div className="relative z-10 flex flex-col items-center h-full">
                {/* Icon container */}
                <div className="mb-6 sm:mb-8">
                  <div className="inline-flex items-center justify-center p-4 sm:p-5 lg:p-6 rounded-2xl border-2 border-theme3/30 bg-linear-to-br from-theme3/10 via-theme/10 to-theme3/5 group-hover:border-theme3 group-hover:bg-linear-to-br group-hover:from-theme3/20 group-hover:via-theme/20 group-hover:to-theme3/10 transition-all duration-500 shadow-lg group-hover:shadow-xl group-hover:shadow-theme3/30">
                    <box.icon className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-theme3 group-hover:scale-110 transition-transform duration-500" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-title  text-lg sm:text-xl lg:text-2xl font-black mb-3 sm:mb-1 capitalize group-hover:text-theme3 transition-colors duration-300 line-clamp-2 min-h-12 flex items-center justify-center">
                  {box.title}
                </h3>

                {/* Description */}
                <div className="flex-1 flex items-center justify-center min-h-16">
                  <div className="text-text  text-sm sm:text-base leading-relaxed break-words overflow-wrap-anywhere hyphens-auto line-clamp-4 group-hover:text-text/90 transition-colors duration-300 px-1">
                    {box.description}
                  </div>
                </div>
              </div>

              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-linear-to-br from-theme3/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-linear-to-tr from-theme/10 to-transparent rounded-tr-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
