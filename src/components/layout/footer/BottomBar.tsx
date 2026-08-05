"use client";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";

export default function BottomBar() {
  const { lang } = useLanguage();
  return (
    <div className="relative z-10 bg-theme py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <p className="text-white text-xs sm:text-sm md:text-base text-center">
            {t(lang, "copyright_text")}
          </p>
        </div>
      </div>
    </div>
  );
}
