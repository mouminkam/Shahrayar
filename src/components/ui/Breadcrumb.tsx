"use client";
import Link from "@/components/ui/LocalizedLink";
import { usePrefetchRoute } from "../../hooks/usePrefetchRoute";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../locales/i18n/getTranslation";

interface BreadcrumbProps {
  /** The page title */
  title: string;
  /** Whether to show navigation links (default: true) */
  showLinks?: boolean;
}

/**
 * Reusable Breadcrumb component
 */
export default function Breadcrumb({ title, showLinks = true }: BreadcrumbProps) {
  const { prefetchRoute } = usePrefetchRoute();
  const { lang } = useLanguage();

  return (
    <section className="relative">
      <div className="relative bg-cover bg-center bg-no-repeat bg-[url('/img/bg/breadcumb.jpg')]">
        {/* Overlay for gradient effect */}
        <div className="absolute inset-0 pointer-events-none z-5 bg-[linear-gradient(to_left,rgba(0,0,0,0.7)_0%,transparent_30%),linear-gradient(to_right,rgba(0,0,0,0.7)_0%,transparent_30%),linear-gradient(to_top,rgba(0,0,0,1)_0%,transparent_40%)]" />

        {/* Breadcrumb content */}
        <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
          <div className="py-40 text-center">
            <h1 className="text-white  text-4xl sm:text-5xl lg:text-6xl font-black leading-tight uppercase mb-4">
              {title}
            </h1>
            {showLinks && (
              <ul className="flex justify-center items-center gap-3">
                <li>
                  <Link
                    href="/"
                    onMouseEnter={() => prefetchRoute("/")}
                    className="text-white/90  text-xl font-medium hover:text-theme hover:scale-105 transition-all duration-300 px-3 py-1 rounded-lg hover:bg-white/10 backdrop-blur-sm"
                  >
                    {t(lang, "home")}
                  </Link>
                </li>
                <li className="text-white/70 text-xl">›</li>
                <li className="text-white/90  text-xl font-medium hover:text-theme hover:scale-105 transition-all duration-300 px-3 py-1 rounded-lg hover:bg-white/10 backdrop-blur-sm">
                  {title}
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
