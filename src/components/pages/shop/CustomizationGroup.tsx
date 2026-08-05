"use client";
import { memo, useState, useEffect, useRef } from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { formatCurrency } from "../../../lib/utils/formatters";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";
import type { CustomizationGroupData, CustomizationType } from "@/types/shop";

interface CustomizationGroupProps {
  group: CustomizationGroupData;
  groupName: CustomizationType | string;
  selectedItemIds?: (string | number)[];
  onSelectionChange: (itemIds: (string | number)[]) => void;
}

/**
 * CustomizationGroup Component
 * Displays a single customization group (allergens, drinks, toppings, sauces)
 * Supports min/max selection rules and free options
 */
const CustomizationGroup = memo(({ group, groupName, selectedItemIds = [], onSelectionChange }: CustomizationGroupProps) => {
  const { lang } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false); // Default collapsed
  const hasBeenExpandedRef = useRef(false); // Track if user has ever expanded this group

  // Keep the list open if user has expanded it, even after selection changes
  useEffect(() => {
    if (hasBeenExpandedRef.current && !isExpanded) {
      // If user has expanded it before, keep it open after selection changes
      setIsExpanded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItemIds]); // Re-check when selection changes (but not isExpanded to avoid loop)

  if (!group || !Array.isArray(group.available) || group.available.length === 0) {
    return null;
  }

  const minSelection = parseInt(String(group.min_selection || 0), 10);
  const maxSelection = group.max_selection !== null && group.max_selection !== undefined
    ? parseInt(String(group.max_selection), 10)
    : null;
  const isRequired = minSelection > 0; // If min > 0, it's required
  const currentSelectionCount = selectedItemIds.length;

  // Check if selection is valid
  const isValidSelection =
    (!isRequired || currentSelectionCount >= minSelection) &&
    (maxSelection === null || currentSelectionCount <= maxSelection);

  // Get selection rule text
  const getSelectionRuleText = () => {
    if (isRequired) {
      if (minSelection === 1 && maxSelection === 1) {
        return t(lang, "required_choose_one");
      } else if (minSelection > 0 && maxSelection && maxSelection > minSelection) {
        let message = t(lang, "required_choose_min");
        message = message.replace("{min}", String(minSelection));
        message = message.replace("{max}", String(maxSelection));
        return message;
      } else if (minSelection > 0) {
        return t(lang, "required_choose_minimum").replace("{min}", String(minSelection));
      }
      return t(lang, "required");
    } else {
      if (maxSelection && maxSelection > 0) {
        return t(lang, "choose_up_to").replace("{max}", String(maxSelection));
      }
      return t(lang, "optional");
    }
  };

  const handleItemToggle = (itemId: string | number, event?: React.SyntheticEvent) => {
    // Prevent event bubbling to avoid any unwanted side effects
    if (event) {
      event.stopPropagation();
    }

    // Always checkbox behavior: toggle selection
    const isCurrentlySelected = selectedItemIds.includes(itemId);
    let newSelection: (string | number)[];

    if (isCurrentlySelected) {
      // Removing item - always allow removal
      // This allows user to swap selections even at min requirement
      // The validation will happen at form submission level
      newSelection = selectedItemIds.filter((id) => id !== itemId);
    } else {
      // Adding item
      newSelection = [...selectedItemIds, itemId];

      // Enforce max selection limit (only if max is not null)
      if (maxSelection !== null && maxSelection > 0 && newSelection.length > maxSelection) {
        return; // Don't allow exceeding max
      }
    }

    onSelectionChange(newSelection);
  };

  // Determine if we've reached the minimum requirement
  // When min is reached, lock unselected items but keep selected items enabled
  // This allows user to swap selections even at min requirement
  const hasReachedMin = isRequired && currentSelectionCount >= minSelection;

  // Get localized group name
  const getGroupDisplayName = () => {
    const groupNameMap: Record<string, string> = {
      'allergens': t(lang, 'allergens') || 'Allergens',
      'drinks': t(lang, 'drinks') || 'Drinks',
      'toppings': t(lang, 'toppings') || 'Toppings',
      'sauces': t(lang, 'sauces') || 'Sauces',
    };
    return groupNameMap[groupName] || groupName;
  };

  return (
    <div className={`customization-group mb-6 ${!isValidSelection && isRequired ? 'border-l-4 border-red-500 pl-4' : ''}`}>
      {/* Group Header - Clickable for Collapse/Expand */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          const newExpandedState = !isExpanded;
          setIsExpanded(newExpandedState);
          if (newExpandedState) {
            hasBeenExpandedRef.current = true; // Mark as expanded by user
          }
        }}
        className="w-full mb-4 text-left hover:bg-white/5 rounded-lg p-3 transition-all duration-200"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3 flex-1">
            <h4 className="text-white text-lg font-semibold">
              {getGroupDisplayName()}
            </h4>
            {isRequired && (
              <span className="text-red-400 text-xs font-semibold uppercase">
                {t(lang, "required")}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-white/70 transition-transform duration-200" />
            ) : (
              <ChevronDown className="w-5 h-5 text-white/70 transition-transform duration-200" />
            )}
          </div>
        </div>
        <p className={`text-xs font-medium ${isValidSelection ? 'text-text/60' : 'text-red-400'}`}>
          {getSelectionRuleText()}
        </p>
      </button>

      {/* Group Items - Collapsible */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {isExpanded && (
          <div className="space-y-2">
        {group.available
          .filter(item => item.is_active !== false)
          .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
          .map((item) => {
            const isSelected = selectedItemIds.includes(item.id);
            const itemPrice = parseFloat(String(item.final_price || item.price || 0));
            const hasPrice = itemPrice !== 0 && !item.is_free;

            // Determine if this item should be disabled:
            // 1. If item is NOT selected and we've reached min, disable it (lock unselected items)
            // 2. If item IS selected, always enable it (user can remove selection, which will unlock other items)
            // This allows user to change their mind and swap selections even at min
            const isDisabled = !isSelected && hasReachedMin;

            return (
              <button
                key={item.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isDisabled) {
                    handleItemToggle(item.id, e);
                  }
                }}
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
                title={isDisabled && isSelected && isRequired && currentSelectionCount === minSelection
                  ? t(lang, "minimum_selection_required") || `Minimum ${minSelection} selection required`
                  : undefined}
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
                    {item.description && (
                      <span className="text-text/70 text-xs block mt-1">
                        {item.description}
                      </span>
                    )}
                  </div>
                </div>
                {hasPrice && (
                  <div className="ml-4">
                    <span className="text-theme3 text-sm font-bold">
                      +{formatCurrency(itemPrice)}
                    </span>
                  </div>
                )}
                {item.is_free && !hasPrice && (
                  <div className="ml-4">
                    <span className="text-green-400 text-sm font-bold">
                      {t(lang, "free") || "Free"}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
          </div>
        )}
      </div>
    </div>
  );
});

CustomizationGroup.displayName = "CustomizationGroup";

export default CustomizationGroup;
