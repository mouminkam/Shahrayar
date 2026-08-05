"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "@/components/ui/LocalizedLink";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";
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
          <Image
            src="/img/shape/shawerma.png"
            alt="shape"
            width={400}
            height={400}
            quality={100}
            className="w-full h-130 object-contain"
            sizes="300px"
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
          <Image
            src="/img/shape/shawerma.png"
            alt="shape"
            width={400}
            height={400}
            quality={100}
            className="w-full h-130 object-contain"
            sizes="400px"
            loading="lazy"
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="about-us section-padding">
            <div className="row">
              <div className="col-12">
                <div className="title-area text-center">
                  <div className="sub-title text-theme3  text-2xl font-bold uppercase mb-4 flex items-center justify-center gap-2">
                    {t(lang, "about_us")}
                  </div>
                  <h2 className="title text-white  text-3xl sm:text-4xl lg:text-5xl font-black mb-10 sm:w-1/2 text-center mx-auto">
                    {t(lang, "about_us_title")}
                  </h2>
                  <div className="text text-text  text-base leading-relaxed mb-8 max-w-3xl mx-auto sm:w-1/3 text-center ">
                    {t(lang, "about_us_description")}
                  </div>
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
