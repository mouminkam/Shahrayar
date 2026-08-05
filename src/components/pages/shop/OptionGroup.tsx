"use client";
import { memo } from "react";
import { Check } from "lucide-react";
import { formatCurrency } from "../../../lib/utils/formatters";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";
import type { OptionGroupType } from "@/types/shop";

interface OptionGroupProps {
  group: OptionGroupType;
  selectedItemIds?: (string | number)[];
  onSelectionChange: (itemIds: (string | number)[]) => void;
}

/**
 * OptionGroup Component
 * Displays a single option group with its items
 * Supports both required and optional groups with min/max selection rules
 */
const OptionGroup = memo(({ group, selectedItemIds = [], onSelectionChange }: OptionGroupProps) => {
  const { lang } = useLanguage();

  if (!group || !Array.isArray(group.items) || group.items.length === 0) {
    return null;
  }

  const isRequired = group.is_required === true;
  const minSelection = parseInt(String(group.min_selection || 0), 10);
  const maxSelection = parseInt(String(group.max_selection || 0), 10);
  const isSingleSelection = maxSelection === 1;
  const currentSelectionCount = selectedItemIds.length;

  // Check if selection is valid
  const isValidSelection =
    (!isRequired || currentSelectionCount >= minSelection) &&
    currentSelectionCount <= maxSelection;

  // Get selection rule text
  const getSelectionRuleText = () => {
    if (isRequired) {
      if (minSelection === 1 && maxSelection === 1) {
        return t(lang, "required_choose_one");
      } else if (minSelection > 0 && maxSelection > minSelection) {
        let message = t(lang, "required_choose_min");
        message = message.replace("{min}", String(minSelection));
        message = message.replace("{max}", String(maxSelection));
        return message;
      } else if (minSelection > 0) {
        return t(lang, "required_choose_minimum").replace("{min}", String(minSelection));
      }
      return t(lang, "required");
    } else {
      if (maxSelection > 0) {
        return t(lang, "choose_up_to").replace("{max}", String(maxSelection));
      }
      return t(lang, "optional");
    }
  };

  const handleItemToggle = (itemId: string | number) => {
    if (isSingleSelection) {
      // Radio button behavior: replace selection
      onSelectionChange([itemId]);
    } else {
      // Checkbox behavior: toggle selection
      const newSelection = selectedItemIds.includes(itemId)
        ? selectedItemIds.filter((id) => id !== itemId)
        : [...selectedItemIds, itemId];

      // Enforce max selection limit
      if (maxSelection > 0 && newSelection.length > maxSelection) {
        return; // Don't allow exceeding max
      }

      onSelectionChange(newSelection);
    }
  };

  const canSelectMore = maxSelection === 0 || currentSelectionCount < maxSelection;

  return (
    <div className={`option-group mb-6 ${!isValidSelection && isRequired ? 'border-l-4 border-red-500 pl-4' : ''}`}>
      {/* Group Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-white text-lg font-semibold">
            {group.name}
          </h4>
          {isRequired && (
            <span className="text-red-400 text-xs font-semibold uppercase">
              {t(lang, "required")}
            </span>
          )}
        </div>
        {group.description && (
          <p className="text-text/70 text-sm mb-2">
            {group.description}
          </p>
        )}
        <p className={`text-xs font-medium ${isValidSelection ? 'text-text/60' : 'text-red-400'}`}>
          {getSelectionRuleText()}
        </p>
      </div>

      {/* Group Items */}
      <div className={`space-y-2 ${isSingleSelection ? 'flex flex-wrap gap-3' : ''}`}>
        {group.items
          .slice()
          .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
          .map((item) => {
            const isSelected = selectedItemIds.includes(item.id);
            const priceDelta = parseFloat(String(item.price_delta || 0));
            const hasPrice = priceDelta !== 0;

            if (isSingleSelection) {
              // Radio button style
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemToggle(item.id)}
                  className={`
                    relative px-4 py-3 rounded-xl border-2 transition-all duration-300 text-sm font-semibold
                    ${
                      isSelected
                        ? "bg-theme3 border-theme3 text-white shadow-lg shadow-theme3/30"
                        : "bg-white/10 border-white/20 text-white hover:border-theme3/50 hover:bg-white/15"
                    }
                  `}
                  aria-label={`Select ${item.name}`}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-center gap-2">
                    <span>{item.name}</span>
                    {hasPrice && (
                      <span className={`text-xs ${isSelected ? "text-white/90" : "text-theme3"}`}>
                        ({priceDelta > 0 ? "+" : ""}{formatCurrency(priceDelta)})
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-theme rounded-full flex items-center justify-center border-2 border-white">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              );
            } else {
              // Checkbox style
              const isDisabled = !isSelected && !canSelectMore;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => !isDisabled && handleItemToggle(item.id)}
                  disabled={isDisabled}
                  className={`
                    w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300
                    ${
                      isDisabled
                        ? "opacity-50 cursor-not-allowed bg-white/5 border-white/5 text-white/50"
                        : isSelected
                        ? "bg-theme3/20 border-theme3 text-white"
                        : "bg-white/5 border-white/10 text-white hover:border-theme3/50 hover:bg-white/10"
                    }
                  `}
                  aria-label={`${isSelected ? "Remove" : "Add"} ${item.name}`}
                  aria-pressed={isSelected}
                  aria-disabled={isDisabled}
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
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <span className="text-base font-semibold block">
                        {item.name}
                      </span>
                    </div>
                  </div>
                  {hasPrice && (
                    <div className="ml-4">
                      <span className="text-theme3 text-sm font-bold">
                        +{formatCurrency(priceDelta)}
                      </span>
                    </div>
                  )}
                </button>
              );
            }
          })}
      </div>
    </div>
  );
});

OptionGroup.displayName = "OptionGroup";

export default OptionGroup;
