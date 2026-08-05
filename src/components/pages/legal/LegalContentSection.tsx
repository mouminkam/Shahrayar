"use client";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
// PHASE-A FIX [H2]: sanitize HTML to prevent XSS
import DOMPurify from "isomorphic-dompurify";

export interface LegalContentData {
  content: string;
  last_updated?: string | null;
  [key: string]: unknown;
}

interface LegalContentSectionProps {
  /** Content data from API */
  content: LegalContentData | null;
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Retry function */
  onRetry?: () => void;
}

/**
 * Shared component for displaying legal content (Terms & Conditions or Privacy Policy)
 */
export default function LegalContentSection({ content, isLoading, error, onRetry }: LegalContentSectionProps) {
  const { lang } = useLanguage();

  // Format date for display
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(lang === "en" ? "en-US" : "bg-BG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-12 h-12 text-theme3 animate-spin mb-4" />
        <p className="text-white text-lg">{t(lang, "loading_legal_content")}</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-bgimg border-2 border-red-500/50 rounded-2xl p-6 text-center">
        <div className="flex justify-center mb-4">
          <AlertCircle className="w-16 h-16 text-red-500" />
        </div>
        <h3 className="text-white text-xl sm:text-2xl font-bold mb-4">{t(lang, "error_loading_content")}</h3>
        <p className="text-white text-sm sm:text-base mb-6">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-6 py-3 bg-theme3 text-white font-medium rounded-xl hover:bg-theme transition-colors duration-300"
          >
            <RefreshCw className="w-4 h-4" />
            {t(lang, "try_again")}
          </button>
        )}
      </div>
    );
  }

  // No content state
  if (!content) {
    return (
      <div className="text-center py-8">
        <p className="text-white text-lg">{t(lang, "error_loading_content")}</p>
      </div>
    );
  }

  // Content display
  return (
    <div>
      {/* Last Updated Date */}
      {content.last_updated && (
        <div className="mb-4 text-right">
          <p className="text-white text-sm">
            <span className="font-semibold">{t(lang, "last_updated")}: </span>
            <span>{formatDate(content.last_updated)}</span>
          </p>
        </div>
      )}

      {/* Content */}
      <div
        className="legal-content prose prose-invert prose-lg max-w-none text-white
          prose-headings:text-white prose-headings:font-bold
          prose-h1:text-3xl prose-h1:sm:text-4xl prose-h1:mb-6
          prose-h2:text-2xl prose-h2:sm:text-3xl prose-h2:mt-8 prose-h2:mb-4
          prose-h3:text-xl prose-h3:sm:text-2xl prose-h3:mt-6 prose-h3:mb-3
          prose-p:text-white prose-p:text-base prose-p:sm:text-lg prose-p:leading-relaxed prose-p:mb-4
          prose-strong:text-white prose-strong:font-semibold
          prose-ul:text-white prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4
          prose-ol:text-white prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4
          prose-li:text-white prose-li:mb-2
          prose-a:text-theme3 prose-a:no-underline prose-a:hover:text-theme prose-a:hover:underline
          prose-blockquote:border-l-4 prose-blockquote:border-theme3 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-white
          prose-code:text-theme3 prose-code:bg-gray-800 prose-code:px-2 prose-code:py-1 prose-code:rounded
          prose-pre:bg-gray-900 prose-pre:text-white prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content.content) }}
      />
    </div>
  );
}
