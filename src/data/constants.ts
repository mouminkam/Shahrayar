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

export const IMAGE_PATHS = {
  logo: "/img/logo/mainlogo.png",
  breadcrumb: "/img/bg/breadcumb.jpg",
  placeholder: "/img/placeholder.svg",
};
