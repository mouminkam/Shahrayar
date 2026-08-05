"use client";
import Image from "next/image";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";

interface Feature {
  icon: string;
  title: string;
  description: string;
}

export default function AboutSection() {
  const { lang } = useLanguage();

  const features: Feature[] = [
    {
      icon: "/img/icon/aboutIcon1_1.svg",
      title: t(lang, "premium_quality_ingredients"),
      description: t(lang, "premium_quality_ingredients_description"),
    },
    {
      icon: "/img/icon/aboutIcon1_2.svg",
      title: t(lang, "expert_master_chefs"),
      description: t(lang, "expert_master_chefs_description"),
    },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 pt-0 relative bg-bg3 ">
      <div className="container mx-auto  ">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 sm:gap-8 lg:gap-12 items-center">
          {/* Image */}
          <div className="relative border-r-3 border-y-2 border-theme3 rounded-r-full ">
            <Image
              src="/img/about/aboutThumb2_1.png"
              alt="About Us"
              width={600}
              height={600}
              className="w-full h-auto object-contain"
              quality={85}
              loading="lazy"
              sizes="(max-width: 1024px) 100vw, 600px"
            />
            {/* Video Play Button */}
            {/* <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ">
              <Link
                href="https://www.youtube.com"
                className="inline-block"
              >
                <Image
                  src="/img/shape/player.svg"
                  alt={t(lang, "play_video")}
                  width={80}
                  height={80}
                  className="w-16 h-16 sm:w-40 sm:h-40 animate-rotate"
                />
              </Link>
            </div> */}
          </div>

          {/* Content */}
          <div className="relative z-10 ">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-4">
              <Image
                src="/img/icon/titleIcon.svg"
                alt="icon"
                width={20}
                height={20}
              />
              <span className="text-theme2  text-base font-bold uppercase">
                {t(lang, "about_us")}
              </span>
              <Image
                src="/img/icon/titleIcon.svg"
                alt="icon"
                width={20}
                height={20}
              />
            </div>
            <h2 className="text-white  text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-4 text-center sm:text-left">
              {t(lang, "about_us_title")}
            </h2>
            <p className="text-text  text-lg sm:text-xl text-center sm:text-left leading-relaxed mb-12">
              {t(lang, "about_section_description")}
            </p>

            {/* Features */}
            <div className="flex flex-col gap-5 px-15 sm:px-0">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-5">
                  <div className="shrink-0">
                    <Image
                      src={feature.icon}
                      alt={feature.title}
                      width={60}
                      height={60}
                      className="w-12 h-12 sm:w-15 sm:h-15"
                    />
                  </div>
                  <div>
                    <h6 className="text-white  text-lg font-bold mb-1 capitalize">
                      {feature.title}
                    </h6>
                    <p className="text-text  text-base">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
