"use client";
import { Grid, List } from "lucide-react";
import { ITEMS_PER_PAGE } from "../../../data/constants";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";

interface SortBarProps {
  totalItems?: number;
  currentPage?: number;
  itemsPerPage?: number;
  onViewChange: (viewMode: "grid" | "list") => void;
  viewMode?: "grid" | "list";
}

/**
 * SortBar Component
 * Displays product count and view mode toggle
 */
export default function SortBar({ totalItems = 0, currentPage = 1, itemsPerPage = ITEMS_PER_PAGE, onViewChange, viewMode = "grid" }: SortBarProps) {
  const { lang } = useLanguage();

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        {/* Results Count */}
        <div className="shrink-0">
          <p className="text-white text-sm sm:text-base ">
            {t(lang, "showing")} <span className="font-semibold">{startItem}</span> - <span className="font-semibold">{endItem}</span> {t(lang, "of")} <span className="font-semibold">{totalItems}</span> {t(lang, "results")}
          </p>
        </div>

        {/* Sort & View Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
          {/* View Mode Toggle */}
          <div className="shrink-0">
            <div className="flex items-center gap-2 bg-bgimg rounded-lg p-1">
              <button
                className={`p-2 rounded transition-all cursor-pointer duration-300 ${viewMode === "grid"
                  ? "bg-theme text-white"
                  : "text-white hover:text-theme hover:bg-gray-50"
                  }`}
                onClick={() => onViewChange("grid")}
                type="button"
                role="tab"
                aria-label="Grid view"
                aria-selected={viewMode === "grid"}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                className={`p-2 rounded transition-all cursor-pointer duration-300 ${viewMode === "list"
                  ? "bg-theme text-white"
                  : "text-white hover:text-theme hover:bg-gray-50"
                  }`}
                onClick={() => onViewChange("list")}
                type="button"
                role="tab"
                aria-label="List view"
                aria-selected={viewMode === "list"}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
