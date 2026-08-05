// MODIFIED: Phase B — SSR/CSR Migration
import { Suspense } from "react";
import dynamic from "next/dynamic";
import type { Metadata } from "next";
import AnimatedSection from "../../../components/ui/AnimatedSection";
import ErrorBoundary from "../../../components/ui/ErrorBoundary";
import SectionSkeleton from "../../../components/ui/SectionSkeleton";
import GuestOnly from "../../../components/auth/GuestOnly";

// Lazy load PhoneInputSection - Heavy component with API calls
const PhoneInputSection = dynamic(
  () => import("../../../components/pages/add-phone/PhoneInputSection"),
  {
    loading: () => <SectionSkeleton variant="default" height="h-96" />,
  }
);

export const metadata: Metadata = { title: "Add Phone" };

export default function AddPhonePage() {
  return (
    <GuestOnly>
      <div className="bg-bg3 min-h-screen">
        <section className="add-phone-section section-padding fix bg-bg3 py-12 px-1 sm:px-5 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
            <div className="max-w-2xl mx-auto">
              <ErrorBoundary>
                <Suspense fallback={<SectionSkeleton variant="default" height="h-96" />}>
              <AnimatedSection>
                <PhoneInputSection />
              </AnimatedSection>
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        </section>
      </div>
    </GuestOnly>
  );
}
