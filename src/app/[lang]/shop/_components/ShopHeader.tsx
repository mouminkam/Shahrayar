// MODIFIED: Phase C — Page Splitting
import AnimatedSection from "../../../../components/ui/AnimatedSection";
import Breadcrumb from "../../../../components/ui/Breadcrumb";
import { t } from "../../../../locales/i18n/getTranslation";
import type { Locale } from "@/locales/i18n/config";

interface ShopHeaderProps {
  lang: Locale;
}

export default function ShopHeader({ lang }: ShopHeaderProps) {
  return (
    <AnimatedSection>
      <Breadcrumb title={t(lang, "shop")} />
    </AnimatedSection>
  );
}
