"use client";
import { memo, useMemo } from "react";
import { Check } from "lucide-react";
import { formatCurrency } from "../../../lib/utils/formatters";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";
import type { ProductIngredient } from "@/types/shop";

interface ProductIngredientsProps {
  ingredients?: ProductIngredient[];
  selectedIngredientIds?: (string | number)[];
  onIngredientToggle: (ingredientId: string | number) => void;
}

/**
 * ProductIngredients Component
 * Displays available ingredients/add-ons as checkboxes
 */
const ProductIngredients = memo(({ ingredients = [], selectedIngredientIds = [], onIngredientToggle }: ProductIngredientsProps) => {
  const { lang } = useLanguage();

  // Group ingredients by category if available
  const groupedIngredients = useMemo(() => {
    const grouped: Record<string, ProductIngredient[]> = {};
    const uncategorized: ProductIngredient[] = [];

    ingredients.forEach((ingredient) => {
      const category = ingredient.category || null;
      if (category) {
        if (!grouped[category]) {
          grouped[category] = [];
        }
        grouped[category].push(ingredient);
      } else {
        uncategorized.push(ingredient);
      }
    });

    return { grouped, uncategorized };
  }, [ingredients]);

  if (!ingredients || ingredients.length === 0) {
    return null;
  }

  const renderIngredient = (ingredient: ProductIngredient) => {
    const isSelected = selectedIngredientIds.includes(ingredient.id);
    const ingredientPrice = parseFloat(String(ingredient.price || 0));
    const hasPrice = ingredientPrice !== 0;

    return (
      <div
        key={ingredient.id}
        className="mb-3"
      >
        <button
          type="button"
          onClick={() => onIngredientToggle(ingredient.id)}
          className={`
            w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300
            ${
              isSelected
                ? "bg-theme3/20 border-theme3 text-white"
                : "bg-white/5 border-white/10 text-white hover:border-theme3/50 hover:bg-white/10"
            }
          `}
          aria-label={`${isSelected ? "Remove" : "Add"} ${ingredient.name}`}
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
                {ingredient.name}
              </span>
              {ingredient.is_required && (
                <span className="text-xs text-theme3 mt-1 block">{t(lang, "required")}</span>
              )}
            </div>
          </div>
          {hasPrice && (
            <div className="ml-4">
              <span className="text-theme3  text-sm font-bold">
                +{formatCurrency(ingredientPrice)}
              </span>
            </div>
          )}
        </button>
      </div>
    );
  };

  return (
    <div className="product-ingredients mb-6">
      <h4 className="text-white  text-lg font-semibold mb-4">
        {t(lang, "add_ons_extras")}
      </h4>
      <div className="space-y-4">
        {/* Render grouped ingredients */}
        {Object.keys(groupedIngredients.grouped).length > 0 &&
          Object.entries(groupedIngredients.grouped).map(([category, categoryIngredients]) => (
            <div key={category} className="mb-4">
              <h5 className="text-theme3  text-sm font-semibold mb-3 uppercase tracking-wide">
                {category}
              </h5>
              <div className="space-y-2">
                {categoryIngredients.map(renderIngredient)}
              </div>
            </div>
          ))}

        {/* Render uncategorized ingredients */}
        {groupedIngredients.uncategorized.length > 0 && (
          <div>
            {Object.keys(groupedIngredients.grouped).length > 0 && (
              <h5 className="text-theme3  text-sm font-semibold mb-3 uppercase tracking-wide">
                {t(lang, "other")}
              </h5>
            )}
            <div className="space-y-2">
              {groupedIngredients.uncategorized.map(renderIngredient)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

ProductIngredients.displayName = "ProductIngredients";

export default ProductIngredients;
