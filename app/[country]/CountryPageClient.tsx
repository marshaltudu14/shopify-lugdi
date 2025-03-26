"use client";

import React from "react";
import { Banner, Country } from "@/lib/countries";
import { Loader2 } from "lucide-react";
import BannerCarousel from "../components/BannerCarousel";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { CollectionData } from "@/lib/types/collection";
import ProductCard from "../components/ProductCard";

interface CountryPageClientProps {
  country: Country | null;
  banners: Banner[];
  menFeaturedProducts: CollectionData | null;
  womenFeaturedProducts: CollectionData | null;
}

const CountryPageClient: React.FC<CountryPageClientProps> = ({
  country,
  banners,
  menFeaturedProducts,
  womenFeaturedProducts,
}) => {
  if (!country) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-foreground/50" />
      </div>
    );
  }

  console.log("Men:", menFeaturedProducts);

  const menProducts =
    menFeaturedProducts?.collection?.products?.edges?.map(
      (edge) => edge.node
    ) || [];
  const womenProducts =
    womenFeaturedProducts?.collection?.products?.edges?.map(
      (edge) => edge.node
    ) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Banner Carousel */}
      <BannerCarousel banners={banners} />

      {/* Featured Products */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 space-y-5">
          <h1 className="text-3xl font-bold">Featured Products</h1>

          {menProducts.length > 0 && (
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 md:gap-4">
              {menProducts.map((product) => (
                <div key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}

          {womenProducts.length > 0 && (
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 md:gap-4">
              {womenProducts.map((product) => (
                <div key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative rounded-xl overflow-hidden h-96">
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10 flex items-end p-8">
              <div>
                <h3 className="text-3xl font-bold text-white">
                  Men&apos;s Collection
                </h3>
                <p className="text-white/80 mb-4">
                  Timeless elegance for the modern gentleman
                </p>
                <Button variant="secondary" className="cursor-pointer">
                  Shop Now
                </Button>
              </div>
            </div>
            <Image
              fill
              src="/collections/Men Category.webp"
              alt="Men's Collection"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="relative rounded-xl overflow-hidden h-96">
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10 flex items-end p-8">
              <div>
                <h3 className="text-3xl font-bold text-white">
                  Women&apos;s Collection
                </h3>
                <p className="text-white/80 mb-4">
                  Sophisticated styles for every occasion
                </p>
                <Button variant="secondary" className="cursor-pointer">
                  Shop Now
                </Button>
              </div>
            </div>
            <Image
              fill
              src="/collections/Women Category.webp"
              alt="Women's Collection"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default CountryPageClient;
