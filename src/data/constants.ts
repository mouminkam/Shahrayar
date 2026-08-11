/**
 * Application constants
 * Centralized constants for the application
 */

export interface NavLink {
  href: string;
  label: string;
}

export interface SocialLink {
  href: string;
  label: string;
  icon: string;
}

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/contact-us", label: "Contact Us" },
  { href: "/about-us", label: "About US" },
];

export const SOCIAL_LINKS: SocialLink[] = [
  { href: "https://google.com", label: "Facebook", icon: "Facebook" },
  { href: "https://twitter.com", label: "Twitter", icon: "Twitter" },
  { href: "https://youtube.com", label: "YouTube", icon: "Youtube" },
  { href: "https://linkedin.com", label: "LinkedIn", icon: "Linkedin" },
];

export const BUSINESS_HOURS = "09:00 am - 06:00 pm";

export const TAX_AMOUNT = 10; // 10 EUR fixed tax
/** @deprecated Use TAX_AMOUNT instead. */
export const TAX_RATE = 0.1;

export const ITEMS_PER_PAGE_GRID = 12;
export const ITEMS_PER_PAGE_LIST = 5;
export const ITEMS_PER_PAGE = 12; // Default for backward compatibility

/**
 * Public origin this app is served from — used for canonical links, OpenGraph
 * tags, sitemap.xml and robots.txt. Set NEXT_PUBLIC_SITE_URL at build time; the
 * localhost fallback keeps dev honest rather than baking a stale domain into
 * the generated SEO output.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/**
 * Intrinsic dimensions of the logo file (public/img/logo/mainlogo.png is
 * 548x640), scaled down but kept at the exact same ratio.
 *
 * next/image needs `width`/`height` purely to reserve the right aspect ratio —
 * the rendered size always comes from CSS. Declaring a ratio that does not match
 * the file reserves the wrong box, and if a CSS height happens to land on the
 * declared `height` next/image warns that one dimension was modified and the
 * other was not. Import these instead of hand-writing numbers per call site.
 */
export const LOGO_DIMENSIONS = { width: 137, height: 160 };

export const IMAGE_PATHS = {
  logo: "/img/logo/mainlogo.png",
  breadcrumb: "/img/bg/breadcumb.jpg",
  placeholder: "/img/placeholder.svg",
};
