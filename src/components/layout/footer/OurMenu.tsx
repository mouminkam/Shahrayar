"use client";
import { useState, useEffect } from "react";
import LocalizedLink from "../../ui/LocalizedLink";
import { ChevronsRight } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { usePrefetchRoute } from "../../../hooks/usePrefetchRoute";
import { useApiCache } from "../../../hooks/useApiCache";
import api from "../../../api";
import useBranchStore from "../../../store/branchStore";
import { transformCategories } from "../../../lib/utils/productTransform";
import { extractCategoriesFromResponse } from "../../../lib/utils/responseExtractor";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";

interface Category {
  id: string | number;
  name: string;
  [key: string]: unknown;
}

export default function OurMenu() {
  const { prefetchRoute } = usePrefetchRoute();
  const { selectedBranch, initialize } = useBranchStore();
  const { lang } = useLanguage();
  const { getCachedOrFetch } = useApiCache("CATEGORIES");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Intersection Observer - defer API call until footer is visible
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true, // Only trigger once when it becomes visible
  });

  // Initialize branch if not loaded
  useEffect(() => {
    if (!selectedBranch) {
      initialize();
    }
  }, [selectedBranch, initialize]);

  // Fetch categories from API - only when footer is visible
  useEffect(() => {
    if (!inView) {
      return; // Don't fetch until footer is visible
    }

    const fetchCategories = async () => {
      if (!selectedBranch) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Use cache to avoid redundant API calls
        const response = await getCachedOrFetch(
          "/menu-categories",
          {},
          () => api.menu.getMenuCategories(),
          // 10 minutes TTL for categories (same as useShopSidebar)
          10 * 60 * 1000
        );
        const categoriesData = extractCategoriesFromResponse(response as never);
        const transformed = transformCategories(categoriesData, lang);
        setCategories(transformed as unknown as Category[]);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [inView, selectedBranch, lang, getCachedOrFetch]);

  return (
    <div ref={ref} className="mt-6 sm:mt-8 md:mt-0 lg:pl-6 xl:pl-12">
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
        {isLoading ? (
          <li className="text-white/70 text-sm">{t(lang, "loading_categories")}</li>
        ) : categories.length > 0 ? (
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
