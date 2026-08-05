"use client";
import LocalizedLink from "../../ui/LocalizedLink";
import { ChevronsRight } from "lucide-react";
import { usePrefetchRoute } from "../../../hooks/usePrefetchRoute";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";
import { NAV_LINKS } from "../../../data/constants";

interface NavLink {
  href: string;
  label: string;
  [key: string]: unknown;
}

export default function QuickLinks() {
  const { prefetchRoute } = usePrefetchRoute();
  const { lang } = useLanguage();

  // Map NAV_LINKS to translated labels
  const links = (NAV_LINKS as NavLink[]).map((link) => {
    let label = link.label;
    if (link.href === "/") {
      label = t(lang, "home");
    } else if (link.href === "/shop") {
      label = t(lang, "shop");
    } else if (link.href === "/contact-us") {
      label = t(lang, "contact_us");
    } else if (link.href === "/about-us") {
      label = t(lang, "about_us");
    }
    return { href: link.href, label };
  });

  return (
    <div className="mt-6 sm:mt-8 md:mt-0 lg:pl-6 xl:pl-12">
      <div className="mb-6 sm:mb-8">
        <h3 className="text-white text-xl sm:text-2xl font-bold inline-block relative pb-4 sm:pb-5">
          {t(lang, "quick_links")}
          {/* Orange Line */}
          <span className="absolute bottom-0 left-0 w-6 h-0.5 bg-theme3"></span>
          {/* White Line */}
          <span className="absolute bottom-0 left-10 w-12 sm:w-14 h-0.5 bg-white"></span>
        </h3>
      </div>
      <ul className="space-y-3 sm:space-y-4 md:space-y-5">
        {links.map((link, index) => (
          <li key={index} className="transition-all duration-300 hover:translate-x-1">
            <LocalizedLink
              href={link.href}
              onMouseEnter={() => prefetchRoute(link.href)}
              className="flex items-center gap-2 text-white hover:text-theme3 transition-colors duration-300"
            >
              <ChevronsRight className="w-4 h-4" />
              <span>{link.label}</span>
            </LocalizedLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
