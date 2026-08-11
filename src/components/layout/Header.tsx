"use client";
import Image from "next/image";
import LocalizedLink from "../ui/LocalizedLink";
import { useState, useRef, useEffect, type MouseEvent } from "react";
import {
  ShoppingCart,
  Menu,
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
  User,
} from "lucide-react";
import CartDropdown from "./header/CartDropdown";
import UserDropdown from "./header/UserDropdown";
import Sidebar from "./header/Sidebar";
import { useCart } from "../../hooks/useCart";
import { useScroll } from "../../hooks/useScroll";
import useAuthStore from "../../store/authStore";
import { usePrefetchRoute } from "../../hooks/usePrefetchRoute";
import { useLocalizedRouter } from "../../hooks/useLocalizedRouter";
import { NAV_LINKS, SOCIAL_LINKS, IMAGE_PATHS, LOGO_DIMENSIONS } from "../../data/constants";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../locales/i18n/getTranslation";

interface NavLink {
  href: string;
  label: string;
  [key: string]: unknown;
}

interface SocialLink {
  href: string;
  label: string;
  icon: "Facebook" | "Twitter" | "Youtube" | "Linkedin";
}

const SOCIAL_ICON_MAP = {
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
} as const;

const FreshHeatHeader = () => {
  const { push } = useLocalizedRouter();
  const { prefetchRoute } = usePrefetchRoute();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeHeader, setActiveHeader] = useState<string | null>(null);
  const cartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Use cart hook instead of hardcoded data
  const { items: cartItems, itemCount: cartCount } = useCart();

  // Use auth store
  const { isAuthenticated, user } = useAuthStore();

  // Use scroll hook
  const isScrolled = useScroll(150);

  // Use language hook
  const { lang } = useLanguage();

  const handleCartClick = (headerId: string) => {
    setActiveHeader(headerId);
    if (cartTimeoutRef.current) {
      clearTimeout(cartTimeoutRef.current);
      cartTimeoutRef.current = null;
    }
    setIsCartOpen((prev) => !prev);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const handleCartMouseEnter = (headerId: string) => {
    setActiveHeader(headerId);
    if (cartTimeoutRef.current) {
      clearTimeout(cartTimeoutRef.current);
      cartTimeoutRef.current = null;
    }
    setIsCartOpen(true);
  };

  const handleCartMouseLeave = () => {
    if (cartTimeoutRef.current) {
      clearTimeout(cartTimeoutRef.current);
    }
    cartTimeoutRef.current = setTimeout(() => {
      setIsCartOpen(false);
      cartTimeoutRef.current = null;
      setActiveHeader(null);
    }, 300);
  };

  const handleMenuClick = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleUserClick = (headerId: string, e?: MouseEvent) => {
    // If user is authenticated, go directly to profile
    if (isAuthenticated) {
      push("/profile");
      return;
    }

    // If not authenticated, show dropdown
    e?.preventDefault();
    setActiveHeader(headerId);
    if (userTimeoutRef.current) {
      clearTimeout(userTimeoutRef.current);
      userTimeoutRef.current = null;
    }
    setIsUserOpen((prev) => !prev);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const handleUserMouseEnter = (headerId: string) => {
    setActiveHeader(headerId);
    if (userTimeoutRef.current) {
      clearTimeout(userTimeoutRef.current);
      userTimeoutRef.current = null;
    }
    setIsUserOpen(true);
  };

  const handleUserMouseLeave = () => {
    if (userTimeoutRef.current) {
      clearTimeout(userTimeoutRef.current);
    }
    userTimeoutRef.current = setTimeout(() => {
      setIsUserOpen(false);
      userTimeoutRef.current = null;
      setActiveHeader(null);
    }, 300);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (cartTimeoutRef.current) {
        clearTimeout(cartTimeoutRef.current);
      }
      if (userTimeoutRef.current) {
        clearTimeout(userTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* First Header - Shows on load, hides on scroll */}
      <header
        className={`w-full hidden lg:block bg-white z-100 transition-all duration-300 ${isScrolled ? "lg:-translate-y-full " : "relative"
          }`}
      >
        {/* Logo and Navigation */}
        <div className="flex items-stretch bg-bg3">
          {/* Logo Section */}
          <div className="w-1/6 relative flex items-center justify-center cursor-pointer overflow-visible self-stretch">
            {/* Decorative shape behind logo */}
            <div
              className="absolute top-0 left-0 h-full w-[calc(100%+90px)] bg-bg3 z-10
              [clip-path:polygon(0_0,100%_0,calc(100%-80px)_100%,0_100%)]"
              aria-hidden="true"
            />

            {/* Logo */}
            <LocalizedLink
              href="/"
              onMouseEnter={() => prefetchRoute("/")}
              className="relative z-20 transform"
            >
              <Image
                src={IMAGE_PATHS.logo}
                alt="logo"
                width={LOGO_DIMENSIONS.width}
                height={LOGO_DIMENSIONS.height}
                className="w-24 h-auto object-cover"
                quality={85}
                loading="eager"
                priority
                decoding="async"
                sizes="(max-width: 640px) 80px, (max-width: 1024px) 100px, 120px"
              />
            </LocalizedLink>
          </div>

          {/* Right Section */}
          <div className="flex-1 flex flex-col">
            {/* Top Bar */}
            <div className="py-1 pl-26 pr-16 bg-theme3 flex justify-between items-center text-lg">
              <div className="flex items-center">
                <span className="mr-2 text-gray-900 font-medium">{t(lang, "copyright")}</span>
                <span className="text-gray-900 font-medium">{t(lang, "business_hours")}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="mr-2 text-gray-900 font-medium">{t(lang, "follow_us")}</span>
                {(SOCIAL_LINKS as SocialLink[]).map((social) => {
                  const IconComponent = SOCIAL_ICON_MAP[social.icon];

                  return (
                    <a
                      key={social.href}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Visit our ${social.label} page`}
                      className="w-9 h-9 border border-white/20 rounded group flex items-center justify-center hover:bg-white hover:border-theme3 transition-all duration-300"
                    >
                      <IconComponent className="w-4 h-4 text-white group-hover:text-theme3 transition-colors duration-300" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <nav className="w-full flex justify-between items-center md:w-auto py-5 px-10 bg-bgimg text-white">
              <ul className="flex justify-around items-center font-medium w-full">
                {(NAV_LINKS as NavLink[]).map((link) => {
                  const labelKey = link.label.toLowerCase().replace(/\s+/g, '_');
                  return (
                    <li key={link.href} className="transition-all duration-300 hover:translate-x-1">
                      <LocalizedLink
                        href={link.href}
                        onMouseEnter={() => prefetchRoute(link.href)}
                        className="hover:text-theme3 transition-colors duration-300 cursor-pointer"
                      >
                        {t(lang, labelKey)}
                      </LocalizedLink>
                    </li>
                  );
                })}
              </ul>

              {/* Cart and User */}
              <div className="flex items-center gap-8 mr-5">
                {/* User Icon with Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => handleUserMouseEnter("header1")}
                  onMouseLeave={handleUserMouseLeave}
                >
                  {isAuthenticated ? (
                    <LocalizedLink
                      href="/profile"
                      onMouseEnter={() => prefetchRoute("/profile")}
                      aria-label={`Go to profile for ${user?.name}`}
                      className="outline-none focus:outline-none rounded cursor-pointer relative"
                    >
                      <User
                        className="h-6 w-6 transition-colors duration-300 text-theme3 hover:text-theme"
                        strokeWidth={2}
                      />
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border-2 border-white"></span>
                    </LocalizedLink>
                  ) : (
                    <>
                      <button
                        onClick={(e) => handleUserClick("header1", e)}
                        aria-label="User menu"
                        className="outline-none focus:outline-none rounded cursor-pointer relative"
                      >
                        <User
                          className="h-6 w-6 transition-colors duration-300 text-text hover:text-theme3"
                          strokeWidth={2}
                        />
                      </button>
                      {activeHeader === "header1" && !isScrolled && (
                        <UserDropdown
                          userOpen={isUserOpen}
                          setUserOpen={setIsUserOpen}
                        />
                      )}
                    </>
                  )}
                </div>

                {/* Cart Icon with Badge */}
                <div
                  className="relative"
                  onMouseEnter={() => handleCartMouseEnter("header1")}
                  onMouseLeave={handleCartMouseLeave}
                >
                  <button
                    onClick={() => handleCartClick("header1")}
                    aria-label={`Open cart with ${cartCount} items`}
                    className="outline-none focus:outline-none rounded cursor-pointer relative"
                  >
                    <ShoppingCart
                      className="h-6 w-6 text-text hover:text-theme3 transition-colors duration-300"
                      strokeWidth={2}
                    />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-theme3 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                        {cartCount}
                      </span>
                    )}
                  </button>
                  {activeHeader === "header1" && !isScrolled && (
                    <CartDropdown
                      cartOpen={isCartOpen}
                      setCartOpen={setIsCartOpen}
                      cartItems={cartItems}
                    />
                  )}
                </div>

                {/* Menu Icon */}
                <button
                  onClick={handleMenuClick}
                  aria-label="Open sidebar menu"
                  className="focus:outline-none focus:ring-2 focus:ring-theme2 focus:ring-offset-2 focus:ring-offset-title rounded cursor-pointer"
                >
                  <Menu
                    className="h-6 w-6 text-text hover:text-theme3 transition-colors duration-300"
                    strokeWidth={2}
                  />
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Second Header - Always visible on mobile, shows on scroll for desktop */}
      <header
        className={`fixed top-0 left-0 right-0 w-full bg-bgimg z-100 transition-transform duration-300 shadow-sm ${isScrolled ? "translate-y-0" : "translate-y-0 lg:-translate-y-full"
          }`}
      >
        <div className="container mx-auto flex flex-row items-center justify-between gap-4 lg:gap-8 px-4 sm:px-6 lg:px-8 xl:px-12 py-3 lg:py-4 w-full">
          {/* Logo Section */}
          <div className="flex items-center justify-start shrink-0 lg:ml-10">
            <LocalizedLink
              href="/"
              onMouseEnter={() => prefetchRoute("/")}
              className="flex items-center"
            >
              <Image
                src={IMAGE_PATHS.logo}
                alt="logo"
                width={LOGO_DIMENSIONS.width}
                height={LOGO_DIMENSIONS.height}
                className="h-12 sm:h-14 lg:h-16 xl:h-20 w-auto object-contain transition-transform duration-300 hover:scale-105"
                quality={85}
                priority
                loading="eager"
                decoding="async"
                sizes="(max-width: 640px) 80px, (max-width: 1024px) 100px, 120px"
              />
            </LocalizedLink>
          </div>

          {/* Navigation - Desktop only */}
          <nav className="hidden lg:flex flex-1 justify-center">
            <ul className="flex items-center gap-8 xl:gap-12 font-medium text-white">
              {(NAV_LINKS as NavLink[]).map((link) => {
                const labelKey = link.label.toLowerCase().replace(' ', '_');
                return (
                  <li key={link.href}>
                    <LocalizedLink
                      href={link.href}
                      onMouseEnter={() => prefetchRoute(link.href)}
                      className="text-sm xl:text-base hover:text-theme3 transition-colors duration-300 cursor-pointer relative group"
                    >
                      {t(lang, labelKey)}
                    </LocalizedLink>
                  </li>
                );
              })}
            </ul>

          </nav>

          {/* Icons */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-5 xl:gap-6 shrink-0">
            {/* User Icon with Dropdown */}
            <div
              className="relative flex items-center"
              onMouseEnter={() => handleUserMouseEnter("header2")}
              onMouseLeave={handleUserMouseLeave}
            >
              {isAuthenticated ? (
                <LocalizedLink
                  href="/profile"
                  onMouseEnter={() => prefetchRoute("/profile")}
                  aria-label={`Go to profile for ${user?.name}`}
                  className="flex items-center justify-center p-2 rounded-lg outline-none focus:outline-none focus:ring-2 focus:ring-theme3 focus:ring-offset-2 focus:ring-offset-bgimg cursor-pointer relative hover:bg-white/15 transition-all duration-300"
                >
                  <User
                    className="h-5 w-5 sm:h-6 sm:w-6 transition-colors duration-300 text-theme3 hover:text-theme"
                    strokeWidth={2}
                  />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border-2 border-bgimg"></span>
                </LocalizedLink>
              ) : (
                <>
                  <button
                    onClick={(e) => handleUserClick("header2", e)}
                    aria-label="User menu"
                    className="flex items-center justify-center p-2 rounded-lg outline-none focus:outline-none focus:ring-2 focus:ring-theme3 focus:ring-offset-2 focus:ring-offset-bgimg cursor-pointer relative hover:bg-white/15 transition-all duration-300"
                  >
                    <User
                      className="h-5 w-5 sm:h-6 sm:w-6 transition-colors duration-300 text-white hover:text-theme3"
                      strokeWidth={2}
                    />
                  </button>
                  {activeHeader === "header2" && (
                    <UserDropdown
                      userOpen={isUserOpen}
                      setUserOpen={setIsUserOpen}
                    />
                  )}
                </>
              )}
            </div>

            {/* Cart Icon with Badge */}
            <div
              className="relative flex items-center"
              onMouseEnter={() => handleCartMouseEnter("header2")}
              onMouseLeave={handleCartMouseLeave}
            >
              <button
                onClick={() => handleCartClick("header2")}
                aria-label={`Open cart with ${cartCount} items`}
                    className="flex items-center justify-center p-2 rounded-lg outline-none focus:outline-none focus:ring-2 focus:ring-theme3 focus:ring-offset-2 focus:ring-offset-bgimg cursor-pointer relative hover:bg-white/15 transition-all duration-300"
              >
                <ShoppingCart
                  className="h-5 w-5 sm:h-6 sm:w-6 text-white hover:text-theme3 transition-colors duration-300"
                  strokeWidth={2}
                />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-theme3 text-white text-xs rounded-full w-5 h-5 lg:w-6 lg:h-6 flex items-center justify-center font-bold shadow-lg">
                    {cartCount}
                  </span>
                )}
              </button>
              {activeHeader === "header2" && (
                <CartDropdown
                  cartOpen={isCartOpen}
                  setCartOpen={setIsCartOpen}
                  cartItems={cartItems}
                />
              )}
            </div>

            {/* Menu Icon */}
            <button
              onClick={handleMenuClick}
              aria-label="Open sidebar menu"
                className="flex items-center justify-center p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme2 focus:ring-offset-2 focus:ring-offset-bgimg cursor-pointer hover:bg-white/15 transition-all duration-300"
            >
              <Menu
                className="h-5 w-5 sm:h-6 sm:w-6 text-white hover:text-theme3 transition-colors duration-300"
                strokeWidth={2}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
    </>
  );
};

export default FreshHeatHeader;
