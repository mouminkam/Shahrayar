import TopBar from "./footer/TopBar";
import CompanyInfo from "./footer/CompanyInfo";
import QuickLinks from "./footer/QuickLinks";
import OurMenu from "./footer/OurMenu";
import ContactInfo from "./footer/ContactInfo";
import BottomBar from "./footer/BottomBar";
import ScrollToTop from "./footer/ScrollToTop";
import BackgroundShapes from "./footer/BackgroundShapes";

function FreshHeatFooter() {
  return (
    <footer className="relative w-full bg-bgimg overflow-hidden">
      {/* Main Dark Section */}
      <div className="relative bg-bgimg py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32">
        <BackgroundShapes />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          {/* Top Orange Bar */}
          <TopBar />

          {/* Footer Widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 xl:gap-12">
            <CompanyInfo />
            <QuickLinks />
            <OurMenu />
            <ContactInfo />
          </div>
        </div>
      </div>

      {/* Bottom Red Bar */}
      {/* <BottomBar /> */}

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </footer>
  );
}

export default FreshHeatFooter;
