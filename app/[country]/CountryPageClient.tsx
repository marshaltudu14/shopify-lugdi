import React from "react";
import { Banner, Country } from "@/lib/countries";
import { Loader2 } from "lucide-react";
import BannerCarousel from "../components/BannerCarousel";
import { AnimatedSection } from "@/utils/FramerAnimation";
import CategoryMenWomenSection from "../components/CategoryMenWomenSection";

interface CountryPageClientProps {
  country: Country | null;
  banners: Banner[];
  categories?: any[];
  newArrivals?: any[];
}

const CountryPageClient: React.FC<CountryPageClientProps> = ({
  country,
  banners,
  categories = [],
  newArrivals = [],
}) => {
  if (!country) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <BannerCarousel banners={banners} />

      {/* Content Area */}
      <div className="px-2 py-2 md:px-3 md:py-3 lg:px-5 lg:py-5 space-y-2 md:space-y-3 lg:space-y-4">
        {/* New Arrivals */}
        {/* {newArrivals.length > 0 && (
          <div>
            <AnimatedSection delay={0.5}>
              <h2 className="font-semibold text-2xl md:text-3xl text-start mb-3">
                New Arrivals
              </h2>
              <NewArrivals products={newArrivals} />
            </AnimatedSection>
            
            <AnimatedSection delay={0.5}>
              <div className="flex items-center justify-center mt-6">
                <Link href="/">
                  <motion.div
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                    variants={buttonHoverVariants}
                  >
                    <Button className="transition-colors">View More</Button>
                  </motion.div>
                </Link>
              </div>
            </AnimatedSection>
          </div>
        )} */}

        {/* Categories */}
        {/* <CategoryMenWomenSection categories={categories} /> */}
      </div>
    </div>
  );
};

export default CountryPageClient;
