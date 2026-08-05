"use client";
import { memo } from "react";
import { Check } from "lucide-react";
import { formatCurrency } from "../../../lib/utils/formatters";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";
import type { ProductSize } from "@/types/shop";

interface ProductSizesProps {
  sizes?: ProductSize[];
  selectedSizeId?: string | number | null;
  onSizeChange: (sizeId: string | number) => void;
}

/**
 * ProductSizes Component
 * Displays available sizes for a product as a selected list (checkboxes style)
 */
const ProductSizes = memo(({ sizes = [], selectedSizeId = null, onSizeChange }: ProductSizesProps) => {
  const { lang } = useLanguage();

  if (!sizes || sizes.length === 0) {
    return null;
  }

  return (
    <div className="product-sizes mb-6">
      <h4 className="text-white  text-lg font-semibold mb-4">
        {t(lang, "select_size")}
      </h4>
      <div className="space-y-4">
        {sizes.map((size) => {
          const isSelected = selectedSizeId === size.id;
          const sizePrice = parseFloat(String(size.price || 0));
          const hasPrice = sizePrice !== 0;

          return (
            <div
              key={size.id}
              className="mb-3"
            >
              <button
                type="button"
                onClick={() => onSizeChange(size.id)}
                className={`
                  w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300
                  ${
                    isSelected
                      ? "bg-theme3/20 border-theme3 text-white"
                      : "bg-white/5 border-white/10 text-white hover:border-theme3/50 hover:bg-white/10"
                  }
                `}
                aria-label={`${isSelected ? "Deselect" : "Select"} size ${size.name}`}
                aria-pressed={isSelected}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className={`
                      w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-300
                      ${
                        isSelected
                          ? "bg-theme3 border-theme3"
                          : "bg-transparent border-white/30"
                      }
                    `}
                  >
                    {isSelected && (
                      <div>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <span className=" text-base font-semibold block">
                      {size.name}
                    </span>
                  </div>
                </div>
                {hasPrice && (
                  <div className="ml-4">
                    <span className="text-theme3  text-sm font-bold">
                      +{formatCurrency(sizePrice)}
                    </span>
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
});

ProductSizes.displayName = "ProductSizes";

export default ProductSizes;
