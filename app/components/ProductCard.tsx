"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { GlowingEffect } from "@/components/ui/glowing-effect";

import { cn } from "@/lib/utils";
import { getCurrencySymbol } from "@/lib/countries";
import { useTheme } from "next-themes";
import { Sparkles, AlertCircle } from "lucide-react";
import { CollectionProductNode } from "@/lib/types/collection";

interface ProductCardProps {
  product: CollectionProductNode;
}

const cardContainerVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

const stockIndicatorVariants = {
  initial: { scale: 0.95, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.4,
      delay: 0.2,
      type: "spring",
      stiffness: 300,
    },
  },
};

export default function ProductCard({ product }: ProductCardProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const imageUrl = product?.featuredImage?.url;
  const altText =
    product?.featuredImage?.altText ?? product?.title ?? "Product Image";

  const price = product?.priceRange?.minVariantPrice;
  const compareAtPrice = product?.compareAtPriceRange?.minVariantPrice;
  const isDiscounted =
    price && compareAtPrice
      ? parseFloat(compareAtPrice?.amount?.toString()) >
        parseFloat(price?.amount?.toString())
      : false;
  const isOutOfStock = product?.availableForSale === false;
  const quantityAvailable = product?.totalInventory ?? 0;
  const isCriticalStock = quantityAvailable > 0 && quantityAvailable <= 5;
  const isLowStock =
    quantityAvailable > 0 && quantityAvailable <= 10 && !isCriticalStock;

  const discountPercentage = isDiscounted
    ? Math.round(
        ((parseFloat(compareAtPrice?.amount?.toString() ?? "0") -
          parseFloat(price?.amount?.toString() ?? "0")) /
          parseFloat(compareAtPrice?.amount?.toString() ?? "1")) *
          100
      )
    : null;

  const priceSymbol = price ? getCurrencySymbol(price?.currencyCode) : "";
  const compareAtSymbol = compareAtPrice
    ? getCurrencySymbol(compareAtPrice?.currencyCode)
    : "";

  const getStockIndicator = () => {
    if (isOutOfStock) return null;

    if (isCriticalStock) {
      return {
        message: `Last ${quantityAvailable} remaining`,
        icon: <AlertCircle className="w-4 h-4 mr-1" />,
        bgClass: isDark
          ? "bg-gradient-to-r from-rose-900/60 via-rose-800/60 to-rose-900/60"
          : "bg-gradient-to-r from-rose-50 via-rose-100 to-rose-50",
        textClass: isDark ? "text-rose-100" : "text-rose-800",
        borderClass: isDark ? "border-rose-700" : "border-rose-200",
        pulseClass: isDark ? "bg-rose-700" : "bg-rose-500",
      };
    }

    if (isLowStock) {
      return {
        message: `Limited stock • ${quantityAvailable} left`,
        icon: <Sparkles className="w-3.5 h-3.5 mr-1" />,
        bgClass: isDark
          ? "bg-gradient-to-r from-amber-900/60 via-amber-800/60 to-amber-900/60"
          : "bg-gradient-to-r from-amber-50 via-amber-100 to-amber-50",
        textClass: isDark ? "text-amber-100" : "text-amber-800",
        borderClass: isDark ? "border-amber-700" : "border-amber-200",
        pulseClass: isDark ? "bg-amber-600" : "bg-amber-500",
      };
    }

    return null;
  };

  const stockIndicator = getStockIndicator();

  return (
    <motion.div
      variants={cardContainerVariants}
      initial="hidden"
      animate="show"
      whileHover="hover"
      className="w-full overflow-hidden rounded-xl"
    >
      <Link href={`/product/${product?.handle ?? "#"}`} className="group block">
        <div className="relative h-full border p-2 md:p-3">
          <GlowingEffect
            blur={0}
            borderWidth={3}
            spread={80}
            glow={true}
            disabled={false}
            proximity={64}
            inactiveZone={0.01}
          />
          <div className="relative w-full overflow-hidden rounded-xl border">
            <motion.div className="relative w-full overflow-hidden rounded-t-xl">
              {imageUrl ? (
                <div className="overflow-hidden">
                  <motion.div className="w-full">
                    <Image
                      src={imageUrl}
                      width={500}
                      height={500}
                      alt={altText}
                      className={`w-full h-[250px] md:h-[300px] lg:h-[350px] object-cover transition-transform duration-300 ease-in-out group-hover:scale-105 ${
                        isOutOfStock &&
                        "filter grayscale opacity-70 transition-all duration-500"
                      }`}
                    />
                  </motion.div>
                </div>
              ) : (
                <Skeleton className="w-full h-[250px] md:h-[300px] lg:h-[350px] rounded-t-xl" />
              )}

              {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/70 to-black/40">
                  <div
                    className={cn(
                      "px-6 py-2 backdrop-blur-sm rounded-full",
                      "dark:bg-gray-900/80 dark:text-gray-100 bg-white/80 text-gray-900"
                    )}
                  >
                    <span className="font-medium tracking-wide uppercase text-sm">
                      Out of Stock
                    </span>
                  </div>
                </div>
              )}

              {stockIndicator && (
                <AnimatePresence>
                  <motion.div
                    key="stock-indicator"
                    variants={stockIndicatorVariants}
                    initial="initial"
                    animate="animate"
                    className={cn(
                      "absolute top-4 left-0 right-0 mx-auto w-fit px-3 py-1.5 rounded-full border backdrop-blur-sm",
                      stockIndicator.bgClass,
                      stockIndicator.textClass,
                      stockIndicator.borderClass
                    )}
                  >
                    <div className="flex items-center text-xs font-medium">
                      {stockIndicator.icon}
                      <span>{stockIndicator.message}</span>

                      {isCriticalStock && (
                        <span className="relative flex h-2 w-2 ml-2">
                          <span
                            className={cn(
                              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                              stockIndicator.pulseClass
                            )}
                          ></span>
                          <span
                            className={cn(
                              "relative inline-flex rounded-full h-2 w-2",
                              stockIndicator.pulseClass
                            )}
                          ></span>
                        </span>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
            </motion.div>

            <div className="px-3 pt-2 pb-3">
              <p className="font-semibold text-sm md:text-md lg:text-lg line-clamp-1 truncate">
                {product?.title ?? "Unnamed Product"}
              </p>
              <div className="flex items-center space-x-2 text-sm md:text-md lg:text-lg">
                {price && (
                  <p>
                    {priceSymbol}
                    {parseFloat(price?.amount?.toString())?.toString()}
                  </p>
                )}

                {isDiscounted && compareAtPrice && (
                  <p className="line-through opacity-60">
                    {compareAtSymbol}
                    {parseFloat(compareAtPrice?.amount?.toString())?.toString()}
                  </p>
                )}
              </div>
              {isDiscounted && discountPercentage && (
                <motion.div
                  initial="initial"
                  animate="animate"
                  className={cn(
                    "font-medium text-xs flex items-center justify-center py-0.5",
                    isDark
                      ? "bg-gradient-to-r from-emerald-950/50 via-emerald-800/70 to-emerald-950/50 text-emerald-100 border border-emerald-700/40"
                      : "bg-gradient-to-r from-emerald-50 via-emerald-100 to-emerald-50 text-emerald-700 border border-emerald-200",
                    "bg-[length:200%_100%]"
                  )}
                >
                  <p className="text-center">GET {discountPercentage}% OFF</p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
