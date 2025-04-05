"use client";

import React from "react";
import { Banner, Country } from "@/lib/countries";
import { Loader2 } from "lucide-react";
import BannerCarousel from "../components/BannerCarousel";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import ProductCard from "../components/ProductCard";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { GetCollectionsByMenuResponse } from "@/lib/queries/menu"; // Import the new type
import { MenuItemWithCollection } from "@/lib/types/menu"; // Import the menu item type
import { useRef } from "react"; // Removed unused useContext import
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
// import { ProductsData } from "@/lib/types/products"; // Removed unused import
import { CollectionProductNode } from "@/lib/types/collection"; // Import CollectionProductNode
import { cn } from "@/lib/utils"; // Import cn utility
// Removed ThemeContext import

interface CountryPageClientProps {
  country: Country | null;
  banners: Banner[];
  // Update props to use menu data
  menCollectionsMenu: GetCollectionsByMenuResponse | null;
  womenCollectionsMenu: GetCollectionsByMenuResponse | null;
  newArrivalsProducts: CollectionProductNode[]; // Change type to match passed data
  mensProducts: CollectionProductNode[]; // Change prop name and type
  womensProducts: CollectionProductNode[]; // Change prop name and type
  // themeClass prop is no longer needed here, will get from context
}

const CountryPageClient: React.FC<CountryPageClientProps> = ({
  country,
  banners,
  // Use new props
  menCollectionsMenu,
  womenCollectionsMenu,
  newArrivalsProducts,
  mensProducts, // Destructure new prop name
  womensProducts, // Destructure new prop name
  // themeClass removed from props
}) => {
  // Removed theme context usage
  // const { currentThemeClass } = useContext(ThemeContext);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  if (!country) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-foreground/50" />
      </div>
    );
  }

  // Extract collection items from menu data, filtering for valid resources
  const menCollections =
    menCollectionsMenu?.menu?.items?.filter(
      (item): item is MenuItemWithCollection =>
        item.resource?.__typename === "Collection" && !!item.resource.handle
    ) || [];

  const womenCollections =
    womenCollectionsMenu?.menu?.items?.filter(
      (item): item is MenuItemWithCollection =>
        item.resource?.__typename === "Collection" && !!item.resource.handle
    ) || [];

  // New arrivals products are now passed directly as CollectionProductNode[]
  // const newArrivals = ... // No longer needed, use prop directly

  // Products are now directly passed as arrays of nodes
  // const mensProducts = ... // No longer needed, use prop directly
  // const womensProducts = ... // No longer needed, use prop directly

  // --- Remove Logging Here ---
  // console.log("Mens Products Data:", mensProducts);
  // console.log("Womens Products Data:", womensProducts);

  // Note: The featured product sections ("Curated For Him", "Designed For Her")
  // are currently using different data sources (GET_COLLECTION_PRODUCTS).
  // This change only affects the "EXPLORE OUR COLLECTIONS" section below.
  // We might need to adjust the featured sections later if they should also use menu data.

  return (
    // Removed themeClass application from main container
    <div
      className={cn(
        "min-h-screen overflow-hidden bg-background" // Added bg-background
        // currentThemeClass // Removed theme class application
      )}
      ref={containerRef}
    >
      {/* Parallax Banner Carousel */}
      <motion.div style={{ y: yBg }}>
        <BannerCarousel banners={banners} />
      </motion.div>

      {/* New Arrivals */}
      <section className="py-12 bg-background relative z-10"> {/* Reduced padding */}
        <div className="container mx-auto px-4 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold tracking-tight flex items-center">
              New Arrivals
              <span className="ml-3 px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                Just In
              </span>
            </h2>
            <p className="mt-2 text-muted-foreground">
              Discover our latest additions
            </p>
          </motion.div>

          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex w-max space-x-6 pb-4">
              {/* Map directly over newArrivalsProducts prop */}
              {newArrivalsProducts.map((product, index) => (
                <motion.div
                  key={`new-${product.id}`}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className="w-[200px] md:w-[250px] lg:w-[300px] inline-block" // Reduced width
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <div className="text-right">
            <Link href="/collections/new-arrivals">
              <Button variant="link" className="cursor-pointer">
                View all new arrivals →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products - For Him */}
      <section className="py-12 relative z-10"> {/* Reduced padding */}
        {mensProducts.length > 0 && ( // Use mensProducts data
          <div className="container mx-auto px-4 space-y-8">
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4"
              >
                <div>
                  <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                    Featured Collection
                  </span>
                  <h2 className="text-3xl font-bold tracking-tight mt-2">
                    Curated For Him
                  </h2>
                  <p className="text-muted-foreground mt-2 max-w-2xl">
                    Handpicked selection of premium menswear designed for
                    comfort, style, and confidence.
                  </p>
                </div>
                <Link href="/collections/mens-collection">
                  <Button
                    variant="outline"
                    className="hidden md:flex items-center gap-2 cursor-pointer"
                  >
                    View All
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </Button>
                </Link>
              </motion.div>
            </div>

            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex w-max space-x-6 pb-4">
                {/* Map over mensProducts */}
                {mensProducts.map((product, index) => (
                  <motion.div
                    key={`men-feat-${product.id}`}
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="w-[200px] md:w-[250px] lg:w-[300px] inline-block" // Reduced width
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            <div className="md:hidden text-right">
              <Link href="/collections/mens-collection">
                <Button variant="link" className="cursor-pointer">
                  Shop all men's collection →
                </Button>
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Featured Products - For Her */}
      <section className="py-12 bg-background relative z-10"> {/* Reduced padding */}
        {womensProducts.length > 0 && ( // Use womensProducts data
          <div className="container mx-auto px-4 space-y-8">
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4"
              >
                <div>
                  {/* Changed pink to primary theme color */}
                  <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                    Featured Collection
                  </span>
                  <h2 className="text-3xl font-bold tracking-tight mt-2">
                    Designed For Her
                  </h2>
                  <p className="text-muted-foreground mt-2 max-w-2xl">
                    Elegant and contemporary womenswear that celebrates
                    individuality and grace.
                  </p>
                </div>
                <Link href="/collections/womens-collection">
                  <Button
                    variant="outline"
                    className="hidden md:flex items-center gap-2 cursor-pointer"
                  >
                    View All
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </Button>
                </Link>
              </motion.div>
            </div>

            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex w-max space-x-6 pb-4">
                {/* Map over womensProducts */}
                {/* Removed hardcoded URL */}                {womensProducts.map((product, index) => (
                  <motion.div
                    key={`women-feat-${product.id}`}
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="w-[200px] md:w-[250px] lg:w-[300px] inline-block" // Reduced width
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            <div className="md:hidden text-right">
              <Link href="/collections/womens-collection">
                <Button variant="link" className="cursor-pointer">
                  Shop all women's collection →
                </Button>
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Premium Category Showcase */}
      <section className="py-16 relative overflow-hidden bg-gradient-to-b from-background via-background/80 to-background"> {/* Reduced padding */}
        <div className="absolute inset-0 bg-grid-small-black/[0.04] dark:bg-grid-small-white/[0.03] z-0" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-sm font-medium text-foreground/70">
              EXPLORE OUR COLLECTIONS
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mt-2">
              Discover Your Style
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Carefully crafted collections for every occasion and personality
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Main Men's Collection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="group relative h-[300px] rounded-xl overflow-hidden shadow-lg cursor-pointer md:col-span-2 md:row-span-2 md:h-[500px]"
            >
              <Link href="/collections/mens-collection">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10 flex flex-col justify-end p-6">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white">
                      Men's Collection
                    </h3>
                    <p className="text-white/80 mt-2 mb-4 text-sm md:text-base">
                      Sophisticated styles for the modern gentleman
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent backdrop-blur-sm border-white/30 text-white hover:bg-white/10 hover:text-white group-hover:scale-105 transition-transform"
                    >
                      Explore
                    </Button>
                  </div>
                </div>
                <Image
                  fill
                  src="/collections/Men Category.webp"
                  alt="Men's Collection"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                  priority
                />
              </Link>
            </motion.div>

            {/* Dynamically render Men's Subcategories */}
            {menCollections.map((item, index) => (
              <motion.div
                key={item.resource!.id} // Use collection ID as key
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }} // Stagger animation
                viewport={{ once: true }}
                className="group relative h-[200px] rounded-xl overflow-hidden shadow-lg cursor-pointer" // Added cursor-pointer
              >
                <Link href={`/collections/${item.resource!.handle}`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10 flex flex-col justify-end p-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {item.title} {/* Use dynamic title */}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-auto text-white/80 hover:text-white hover:bg-transparent mt-1"
                        tabIndex={-1} // Prevent button from being focusable if Link handles click
                      >
                        Shop Now →
                      </Button>
                    </div>
                  </div>
                  {item.resource!.image?.url && ( // Check if image exists
                    <Image
                      fill
                      src={item.resource!.image.url} // Use dynamic image URL
                      alt={item.resource!.image.altText || item.title} // Use alt text or title
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw" // Add sizes for optimization
                    />
                  )}
                </Link>
              </motion.div>
            ))}

            {/* Main Women's Collection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="group relative h-[300px] rounded-xl overflow-hidden shadow-lg cursor-pointer md:col-span-2 md:row-span-2 md:h-[500px]"
            >
              <Link href="/collections/womens-collection">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10 flex flex-col justify-end p-6">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white">
                      Women's Collection
                    </h3>
                    <p className="text-white/80 mt-2 mb-4 text-sm md:text-base">
                      Timeless pieces that celebrate femininity
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent backdrop-blur-sm border-white/30 text-white hover:bg-white/10 hover:text-white group-hover:scale-105 transition-transform"
                    >
                      Explore
                    </Button>
                  </div>
                </div>
                <Image
                  fill
                  src="/collections/Women Category.webp"
                  alt="Women's Collection"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                  priority
                />
              </Link>
            </motion.div>

            {/* Dynamically render Women's Subcategories */}
            {womenCollections.map((item, index) => (
              <motion.div
                key={item.resource!.id} // Use collection ID as key
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: (menCollections.length + index) * 0.1,
                }} // Adjust delay based on men's items
                viewport={{ once: true }}
                className="group relative h-[200px] rounded-xl overflow-hidden shadow-lg cursor-pointer" // Added cursor-pointer
              >
                <Link href={`/collections/${item.resource!.handle}`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10 flex flex-col justify-end p-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {item.title} {/* Use dynamic title */}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-auto text-white/80 hover:text-white hover:bg-transparent mt-1"
                        tabIndex={-1} // Prevent button from being focusable if Link handles click
                      >
                        Shop Now →
                      </Button>
                    </div>
                  </div>
                  {item.resource!.image?.url && ( // Check if image exists
                    <Image
                      fill
                      src={item.resource!.image.url} // Use dynamic image URL
                      alt={item.resource!.image.altText || item.title} // Use alt text or title
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw" // Add sizes for optimization
                    />
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CountryPageClient;
