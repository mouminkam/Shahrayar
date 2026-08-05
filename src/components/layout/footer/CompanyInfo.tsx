"use client";
import Image from "next/image";
import LocalizedLink from "../../ui/LocalizedLink";
import { Facebook, Twitter, Youtube, Linkedin } from "lucide-react";
import { usePrefetchRoute } from "../../../hooks/usePrefetchRoute";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";

export default function CompanyInfo() {
  const { prefetchRoute } = usePrefetchRoute();
  const { lang } = useLanguage();

  return (
    <div className="mt-6 sm:mt-8 md:mt-0 sm:col-span-2 lg:col-span-1">
      {/* Logo */}
      <div className="mb-6 sm:mb-8">
        <LocalizedLink
          href="/"
          onMouseEnter={() => prefetchRoute("/")}
          className="inline-block"
        >
          <Image
            src="/img/logo/mainlogo.png"
            alt="logo"
            width={180}
            height={72}
            className="h-14 sm:h-16 md:h-18 w-auto h-auto object-contain"
            priority
          />
        </LocalizedLink>
      </div>

      {/* Description */}
      <p className="text-white/85 text-sm leading-relaxed mb-6 sm:mb-8 lg:mb-10 max-w-md">
        {t(lang, "company_description")}
      </p>

      {/* Social Media Icons */}
      <div className="flex items-center gap-2 sm:gap-3">
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 border border-white/20 rounded flex items-center justify-center hover:bg-white hover:border-theme3 transition-all duration-300 group"
          aria-label="Facebook"
        >
          <Facebook className="w-4 h-4 text-white group-hover:text-theme3 transition-colors duration-300" />
        </a>
        <a
          href="https://twitter.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 border border-white/20 rounded flex items-center justify-center hover:bg-white hover:border-theme3 transition-all duration-300 group"
          aria-label="Twitter"
        >
          <Twitter className="w-4 h-4 text-white group-hover:text-theme3 transition-colors duration-300" />
        </a>
        <a
          href="https://linkedin.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 border border-white/20 rounded flex items-center justify-center hover:bg-white hover:border-theme3 transition-all duration-300 group"
          aria-label="LinkedIn"
        >
          <Linkedin className="w-4 h-4 text-white group-hover:text-theme3 transition-colors duration-300" />
        </a>
        <a
          href="https://youtube.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 border border-white/20 rounded flex items-center justify-center hover:bg-white hover:border-theme3 transition-all duration-300 group"
          aria-label="YouTube"
        >
          <Youtube className="w-4 h-4 text-white group-hover:text-theme3 transition-colors duration-300" />
        </a>
      </div>
    </div>
  );
}
