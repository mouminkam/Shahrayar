"use client";
import { useEffect, useMemo, type Dispatch, type SetStateAction } from "react";
import Image from "next/image";
import LocalizedLink from "../../ui/LocalizedLink";
import { X, MapPin, Mail, Clock, Phone, ShoppingCart, Languages } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BranchSelector from "./BranchSelector";
import LanguageSwitcher from "../LanguageSwitcher";
import useBranchStore from "../../../store/branchStore";
import { usePrefetchRoute } from "../../../hooks/usePrefetchRoute";
import { useLocalizedRouter } from "../../../hooks/useLocalizedRouter";
import { NAV_LINKS } from "../../../data/constants";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";
import { transformMenuItemsToProducts } from "../../../lib/utils/productTransform";
import { popularItems, latestItems } from "@/content/menu";
import OptimizedImage from "../../ui/OptimizedImage";

interface NavLink {
  href: string;
  label: string;
  [key: string]: unknown;
}

interface GalleryDish {
  id?: string | number;
  image?: string | null;
  title?: string;
  [key: string]: unknown;
}

interface WorkingHourEntry {
  day?: string;
  open?: string;
  close?: string;
  [key: string]: unknown;
}

// Helper function to format working hours from array to string
const formatWorkingHours = (hours: unknown): string | null => {
  if (!hours || !Array.isArray(hours) || hours.length === 0) {
    return null;
  }

  // If it's an array of objects with day, open, close
  if (hours.length > 0 && typeof hours[0] === 'object') {
    const formattedDays = (hours as WorkingHourEntry[])
      .map(item => {
        const dayName = item.day ? item.day.charAt(0).toUpperCase() + item.day.slice(1) : '';
        const timeRange = item.open && item.close ? `${item.open} - ${item.close}` : '';
        return dayName && timeRange ? `${dayName}: ${timeRange}` : null;
      })
      .filter(Boolean);

    return formattedDays.length > 0 ? formattedDays.join(' | ') : null;
  }

  return null;
};

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const { push } = useLocalizedRouter();
  const {
    selectedBranch,
    initialize,
    branchDetails,
    getBranchContactInfo,
    getBranchWorkingHours,
    fetchBranchDetails
  } = useBranchStore();
  const { prefetchRoute } = usePrefetchRoute();
  const { lang } = useLanguage();

  // Gallery content is static and localized by the transform below. Switching
  // language navigates to a different locale route, which re-renders this with
  // the new lang — so there's nothing to fetch and nothing to cache.
  // First 3 from popular, next 3 from latest.
  const galleryImages: GalleryDish[] = useMemo(() => {
    const popularImages = transformMenuItemsToProducts(popularItems, lang).slice(0, 3);
    const otherImages = transformMenuItemsToProducts(latestItems, lang).slice(0, 3);
    return [...popularImages, ...otherImages] as unknown as GalleryDish[];
  }, [lang]);

  // Initialize branch if not loaded
  useEffect(() => {
    if (!selectedBranch) {
      initialize();
    }
  }, [selectedBranch, initialize]);

  // Fetch branch details when sidebar is opened (only if not already loaded)
  useEffect(() => {
    if (!isOpen || !selectedBranch) {
        return;
      }

    const branchId = selectedBranch.id || selectedBranch.branch_id;
    const currentDetails = branchDetails;
    const currentBranchId = currentDetails?.id || currentDetails?.branch_id;

    // Only fetch if we don't have details for this branch
    if (branchId && currentBranchId !== branchId) {
      fetchBranchDetails(branchId);
    }
  }, [isOpen, selectedBranch, branchDetails, fetchBranchDetails]);

  // Get contact info from store with fallback defaults
  const contactInfo = useMemo(() => {
          const defaultInfo = {
            address: "Main Street, Melbourne, Australia",
            email: "info@fresheat.com",
            phone: "+11002345909",
            workingHours: "Mon-Friday, 09am - 05pm",
          };

    const contact = getBranchContactInfo();
    const rawWorkingHours = getBranchWorkingHours();
          const formattedWorkingHours = formatWorkingHours(rawWorkingHours) || defaultInfo.workingHours;

    return {
      address: contact?.address || defaultInfo.address,
      email: contact?.email || defaultInfo.email,
      phone: contact?.phone || defaultInfo.phone,
            workingHours: formattedWorkingHours,
    };
  }, [getBranchContactInfo, getBranchWorkingHours, branchDetails]);

  // Map NAV_LINKS to translated labels
  const translatedNavLinks = useMemo(() => {
    return (NAV_LINKS as NavLink[]).map(link => {
      let translatedLabel = link.label;
      if (link.href === '/') {
        translatedLabel = t(lang, "home");
      } else if (link.href === '/shop') {
        translatedLabel = t(lang, "shop");
      } else if (link.href === '/contact-us') {
        translatedLabel = t(lang, "contact_us");
      } else if (link.href === '/about-us') {
        translatedLabel = t(lang, "about_us");
      }
      return { ...link, label: translatedLabel };
    });
  }, [lang]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-9998"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed right-0 top-0 h-screen w-full max-w-md bg-bgimg z-9999 shadow-2xl overflow-y-auto sidebar-hide-scrollbar"
            onWheel={(e) => {
              // Prevent scroll propagation to the site
              e.stopPropagation();
            }}
            onTouchMove={(e) => {
              // Prevent touch scroll propagation to the site
              e.stopPropagation();
            }}
          >
            <div className="offcanvas__info min-h-full">
              <div className="offcanvas__wrapper min-h-full">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ staggerChildren: 0.1, delayChildren: 0.1 }}
                  className="offcanvas__content p-6"
                >
                  {/* Top Section - Logo and Close Button */}
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
                    className="offcanvas__top mb-5 flex mx-2 justify-between items-center"
                  >
                    <div className="offcanvas__logo">
                      <LocalizedLink href="/" onClick={() => setIsOpen(false)}>
                        <Image
                          src="/img/logo/mainlogo.png"
                          alt="logo"
                          width={150}
                          height={60}
                          className="w-auto h-25 object-contain"
                          quality={90}
                          priority
                          loading="eager"
                          sizes="150px"
                        />
                      </LocalizedLink>
                    </div>
                    <div className="offcanvas__close ">
                      <motion.button
                        onClick={() => setIsOpen(false)}
                        className="w-10 h-10 bg-theme3 text-white rounded-full flex items-center justify-center hover:bg-theme cursor-pointer"
                        aria-label="Close sidebar"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <X className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </motion.div>

                  {/* Branch Selector & Language Switcher - Always Visible */}
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
                    className="mb-6 p-4 bg-white/5 backdrop-blur-sm rounded-xl"
                  >
                    {/* Branch Selector */}
                    <div className="mb-4">
                      <h4 className="text-white text-base font-semibold mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-theme3" />
                        {t(lang, "select_branch")}
                      </h4>
                      <div className="relative">
                        <BranchSelector isMobile={true} />
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-white/10 my-4"></div>

                    {/* Language Switcher */}
                    <div>
                      <h4 className="text-white text-base font-semibold mb-3 flex items-center gap-2">
                        <Languages className="w-4 h-4 text-theme3" />
                        {t(lang, "select_language")}
                      </h4>
                      <div className="relative">
                        <LanguageSwitcher isMobile={true} />
                      </div>
                    </div>
                  </motion.div>

                  {/* Description Text - Only visible on large screens */}
                  <motion.p
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
                    className="text text-white  text-base font-normal leading-relaxed mb-6 hidden lg:block"
                  >
                    {t(lang, "sidebar_description")}
                  </motion.p>

                  {/* Gallery Area - Only visible on XL screens */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
                    className="offcanvas-gallery-area hidden xl:block mb-6"
                  >
                    {galleryImages.length > 0 ? (
                      <>
                    <div className="offcanvas-gallery-items grid grid-cols-3 gap-2 mb-2">
                          {galleryImages.slice(0, 3).map((dish, index) => (
                        <LocalizedLink
                              key={`gallery-${index}`}
                              href={dish?.id ? `/shop/${dish.id}` : "#"}
                              onMouseEnter={() => dish?.id && prefetchRoute(`/shop/${dish.id}`)}
                              onClick={() => setIsOpen(false)}
                          className="offcanvas-image block overflow-hidden rounded-lg group"
                        >
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.3 }}
                            className="w-[120px] h-[120px]"
                          >
                                <OptimizedImage
                                  src={dish?.image || "/img/header/01.jpg"}
                                  alt={dish?.title || `gallery-img-${index + 1}`}
                              width={120}
                              height={120}
                              className="w-full h-full object-cover"
                              quality={80}
                              loading="lazy"
                              sizes="120px"
                            />
                          </motion.div>
                        </LocalizedLink>
                      ))}
                    </div>
                    <div className="offcanvas-gallery-items grid grid-cols-3 gap-2">
                          {galleryImages.slice(3, 6).map((dish, index) => (
                        <LocalizedLink
                              key={`gallery-${index + 3}`}
                              href={dish?.id ? `/shop/${dish.id}` : "#"}
                              onMouseEnter={() => dish?.id && prefetchRoute(`/shop/${dish.id}`)}
                              onClick={() => setIsOpen(false)}
                          className="offcanvas-image block overflow-hidden rounded-lg group"
                        >
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.3 }}
                            className="w-[120px] h-[120px]"
                          >
                                <OptimizedImage
                                  src={dish?.image || "/img/header/04.jpg"}
                                  alt={dish?.title || `gallery-img-${index + 4}`}
                              width={120}
                              height={120}
                              className="w-full h-full object-cover"
                                  quality={80}
                                  loading="lazy"
                                  sizes="120px"
                            />
                          </motion.div>
                        </LocalizedLink>
                      ))}
                    </div>
                      </>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {[...Array(6)].map((_, index) => (
                          <div
                            key={index}
                            className="w-[120px] h-[120px] bg-white/10 rounded-lg flex items-center justify-center"
                          >
                            <span className="text-white/50 text-xs">No image</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>

                  {/* Mobile Menu - Navigation for small devices */}
                  <div className="mobile-menu fix mb-6 lg:hidden">
                    <nav>
                      <ul className="flex flex-col  gap-5 py-4 ">
                        {translatedNavLinks.map((item, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + index * 0.05, duration: 0.4, ease: "easeOut" }}
                          >
                            <LocalizedLink
                              href={item.href}
                              onMouseEnter={() => prefetchRoute(item.href)}
                              onClick={() => {
                                setIsOpen(false);
                                push(item.href, { scroll: true });
                              }}
                              className="block text-white  text-lg font-normal hover:text-theme3 transition-colors duration-300 py-2"
                            >
                              {item.label}
                            </LocalizedLink>
                          </motion.li>
                        ))}
                      </ul>
                    </nav>
                  </div>

                  {/* Contact Info Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.4, ease: "easeOut" }}
                    className="offcanvas__contact"
                  >
                    <h4 className="text-white  text-2xl font-bold mb-6">
                      {t(lang, "contact_info")}
                    </h4>
                    <ul className="space-y-4 mb-12">
                      {/* Location */}
                      <motion.li
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7, duration: 0.4, ease: "easeOut" }}
                        className="flex items-center gap-4"
                      >
                        <div className="offcanvas__contact-icon shrink-0">
                          <MapPin className="w-5 h-5 text-theme3" />
                        </div>
                        <div className="offcanvas__contact-text">
                          <a
                            href="#"
                            target="_blank"
                            className="text-text  text-base font-normal hover:text-theme3 transition-colors duration-300"
                          >
                            {contactInfo.address}
                          </a>
                        </div>
                      </motion.li>

                      {/* Email */}
                      <motion.li
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.75, duration: 0.4, ease: "easeOut" }}
                        className="flex items-center gap-4"
                      >
                        <div className="offcanvas__contact-icon shrink-0">
                          <Mail className="w-5 h-5 text-theme3" />
                        </div>
                        <div className="offcanvas__contact-text">
                          <a
                            href={`mailto:${contactInfo.email}`}
                            className="text-text  text-base font-normal hover:text-theme3 transition-colors duration-300"
                          >
                            {contactInfo.email}
                          </a>
                        </div>
                      </motion.li>

                      {/* Hours */}
                      <motion.li
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8, duration: 0.4, ease: "easeOut" }}
                        className="flex items-center gap-4"
                      >
                        <div className="offcanvas__contact-icon shrink-0">
                          <Clock className="w-5 h-5 text-theme3" />
                        </div>
                        <div className="offcanvas__contact-text">
                          <a
                            href="#"
                            target="_blank"
                            className="text-text  text-base font-normal hover:text-theme3 transition-colors duration-300"
                          >
                            {contactInfo.workingHours}
                          </a>
                        </div>
                      </motion.li>

                      {/* Phone */}
                      <motion.li
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.85, duration: 0.4, ease: "easeOut" }}
                        className="flex items-center gap-4"
                      >
                        <div className="offcanvas__contact-icon shrink-0">
                          <Phone className="w-5 h-5 text-theme3" />
                        </div>
                        <div className="offcanvas__contact-text">
                          <a
                            href={`tel:${contactInfo.phone}`}
                            className="text-text  text-base font-normal hover:text-theme3 transition-colors duration-300"
                          >
                            {contactInfo.phone}
                          </a>
                        </div>
                      </motion.li>
                    </ul>

                    {/* ORDER NOW Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9, duration: 0.4, ease: "easeOut" }}
                      className="header-button"
                    >
                      <LocalizedLink
                        href="/shop"
                        onMouseEnter={() => prefetchRoute("/shop")}
                        onClick={() => {
                          setIsOpen(false);
                          push("/shop", { scroll: true });
                        }}
                        className="theme-btn px-6 py-3 bg-theme3 text-gray-900 text-sm font-normal hover:bg-theme hover:text-white transition-colors duration-300 rounded-md flex items-center justify-center gap-2 shadow-lg"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>{t(lang, "order_now")}</span>
                      </LocalizedLink>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
