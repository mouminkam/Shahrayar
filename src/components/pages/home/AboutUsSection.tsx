"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "@/components/ui/LocalizedLink";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";
import SectionHeading from "../../ui/SectionHeading";
import type { Locale } from "@/locales/i18n/config";

interface AboutUsSectionProps {
  lang?: Locale | null;
}

export default function AboutUsSection({ lang: serverLang = null }: AboutUsSectionProps) {
  const { lang: clientLang } = useLanguage();
  const [lang, setLang] = useState<string>(serverLang || clientLang || "bg");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && clientLang) {
      setLang(clientLang);
    }
  }, [clientLang, isHydrated]);
  return (
    <section className="about-us-section  section-padding pb-0 py-0 sm:py-12  relative overflow-hidden">
      <div className="about-wrapper style1 relative h-[450px]">
        {/* Shapes */}
        <div className="shape5 hidden xl:block absolute -bottom-25 right-100 z-0">
          <Image
            src="/img/shape/aboutShape1_2.png"
            alt="shape"
            width={120}
            height={120}
            unoptimized={true}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="shape3 hidden xl:block absolute -bottom-1 left-0 z-10 animate-float-bob-y">
          {/* h-130 renders this square image at 520px. It previously declared
              width 400 / sizes="300px", so the browser was handed a ~300px file
              and stretched it to 520 — the source is 1080x1080, so the detail
              was there all along and was simply never requested. */}
          <Image
            src="/img/shape/shawerma.png"
            alt="shape"
            width={1080}
            height={1080}
            quality={100}
            className="w-full h-130 object-contain"
            sizes="520px"
            loading="lazy"
          />
        </div>
        <div className="shape5 hidden xl:block absolute bottom-25 left-100 z-0">
          <Image
            src="/img/shape/aboutShape1_5.png"
            alt="shape"
            width={70}
            height={70}
            unoptimized={true}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="shape6 hidden xl:block absolute bottom-0 right-0 z-10 animate-float-bob-y">
          {/* Same 520px box as .shape3 above — see the note there. */}
          <Image
            src="/img/shape/shawerma.png"
            alt="shape"
            width={1080}
            height={1080}
            quality={100}
            className="w-full h-130 object-contain"
            sizes="520px"
            loading="lazy"
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="about-us section-padding">
            <div className="row">
              <div className="col-12">
                <div className="title-area text-center">
                  <SectionHeading
                    chapter={3}
                    eyebrow={t(lang, "about_us")}
                    title={t(lang, "about_us_title")}
                    description={t(lang, "about_us_description")}
                    className="mb-8"
                  />
                  <div className="btn-wrapper flex justify-center">
                    <Link
                      className="theme-btn px-8 py-3 bg-theme3 text-gray-900 text-base font-medium hover:bg-theme hover:text-white transition-all duration-300 rounded-xl shadow-md hover:shadow-lg inline-flex items-center justify-center gap-2"
                      href="/shop"
                    >
                      {t(lang, "order_now")}
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
