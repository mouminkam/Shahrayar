"use client";
import { useMemo } from "react";
import LocalizedLink from "../../ui/LocalizedLink";
import { ChevronsRight } from "lucide-react";
import { usePrefetchRoute } from "../../../hooks/usePrefetchRoute";
import { transformCategories } from "../../../lib/utils/productTransform";
import { categories as staticCategories } from "@/content/menu";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";

interface Category {
  id: string | number;
  name: string;
  [key: string]: unknown;
}

export default function OurMenu() {
  const { prefetchRoute } = usePrefetchRoute();
  const { lang } = useLanguage();

  // Content is static and localized by the transform below. Switching language
  // navigates to a different locale route, which re-renders this with new
  // props — so there's nothing to refetch and no hydration dance to manage.
  const categories = useMemo(
    () => transformCategories(staticCategories, lang) as unknown as Category[],
    [lang]
  );

  return (
    <div className="mt-6 sm:mt-8 md:mt-0 lg:pl-6 xl:pl-12">
      <div className="mb-6 sm:mb-8">
        <h3 className="text-white text-xl sm:text-2xl font-bold inline-block relative pb-4 sm:pb-5">
          {t(lang, "our_menu")}
          {/* Orange Line */}
          <span className="absolute bottom-0 left-0 w-6 h-0.5 bg-theme3"></span>
          {/* White Line */}
          <span className="absolute bottom-0 left-10 w-12 sm:w-14 h-0.5 bg-white"></span>
        </h3>
      </div>
      <ul className="space-y-3 sm:space-y-4 md:space-y-5">
        {categories.length > 0 ? (
          categories.slice(0, 5).map((category) => {
            const href = `/shop?category=${category.id}`;
            return (
              <li key={category.id} className="transition-all duration-300 hover:translate-x-1">
                <LocalizedLink
                  href={href}
                  onMouseEnter={() => prefetchRoute(href)}
                  className="flex items-center gap-2 text-white hover:text-theme3 transition-colors duration-300"
                >
                  <ChevronsRight className="w-4 h-4" />
                  <span>{category.name}</span>
                </LocalizedLink>
              </li>
            );
          })
        ) : (
          <li className="text-white/70 text-sm">{t(lang, "no_categories_available")}</li>
        )}
      </ul>
    </div>
  );
}
