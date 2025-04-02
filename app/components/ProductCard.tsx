"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { GlowingEffect } from "@/components/ui/glowing-effect";

import { cn } from "@/lib/utils";
import { getCurrencySymbol } from "@/lib/countries";
// Removed useTheme import
import { Sparkles, AlertCircle } from "lucide-react"; // Removed Heart import
import { CollectionProductNode } from "@/lib/types/collection";
import WishlistButton from "./WishlistButton"; // Added import

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

const discountBadgeVariants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.5,
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  },
  hover: {
    scale: 1.05,
    rotate: -2,
    transition: { type: "spring", stiffness: 500 },
  },
};

export default function ProductCard({ product }: ProductCardProps) {
  // Removed unused useTheme hook and isDark variable

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

    // Use theme variables for styling
    if (isCriticalStock) {
      return {
        message: `Last ${quantityAvailable} remaining`,
        icon: (
          <AlertCircle className="w-4 h-4 mr-1 text-destructive-foreground" />
        ), // Use destructive foreground for icon
        bgClass: "bg-destructive/80", // Use destructive background with opacity
        textClass: "text-destructive-foreground", // Use destructive foreground text
        borderClass: "border-destructive", // Use destructive border
        pulseClass: "bg-destructive", // Use destructive for pulse
      };
    }

    if (isLowStock) {
      return {
        message: `Limited stock • ${quantityAvailable} left`,
        icon: <Sparkles className="w-3.5 h-3.5 mr-1 text-accent-foreground" />, // Use accent foreground for icon
        bgClass: "bg-accent/80", // Use accent background with opacity
        textClass: "text-accent-foreground", // Use accent foreground text
        borderClass: "border-accent", // Use accent border
        pulseClass: "bg-accent", // Use accent for pulse
      };
    }

    return null;
  };

  const stockIndicator = getStockIndicator();
  const defaultVariantId = product?.variants?.edges?.[0]?.node?.id; // Correctly access variant ID

  return (
    <motion.div
      variants={cardContainerVariants}
      initial="hidden"
      animate="show"
      whileHover="hover"
      className="w-full overflow-hidden rounded-xl"
    >
      <Link
        href={`/products/${product?.handle ?? "#"}`}
        className="group block"
      >
        <div className="relative h-full border p-2 md:p-3">
          <GlowingEffect
            blur={0}
            borderWidth={3}
            spread={80}
            glow={true}
            disabled={false}
            proximity={64}
            inactiveZone={0.01}
            // variant="vip-gold" // Removed gold variant
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
                      className={`w-full aspect-[2/3] object-cover transition-transform duration-300 ease-in-out group-hover:scale-105 ${
                        // Changed height classes to aspect-[2/3]
                        isOutOfStock &&
                        "filter grayscale opacity-70 transition-all duration-500"
                      }`}
                    />
                  </motion.div>
                </div>
              ) : (
                <Skeleton className="w-full aspect-[2/3] rounded-t-xl" /> // Changed height classes to aspect-[2/3]
              )}

              {/* Wishlist Button Removed From Here */}

              {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/70 to-black/40">
                  {/* Use theme variables for background and text */}
                  <div
                    className={cn(
                      "px-6 py-2 backdrop-blur-sm rounded-full",
                      "bg-background/80 text-foreground" // Use theme variables
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

              {isDiscounted && discountPercentage && (
                <AnimatePresence>
                  <motion.div
                    key="discount-badge"
                    variants={discountBadgeVariants}
                    initial="initial"
                    animate="animate"
                    whileHover="hover"
                    className={cn(
                      "absolute top-4 right-4 px-3 py-1.5 rounded-lg font-bold text-sm shadow-lg",
                      "bg-destructive", // Use destructive background
                      "text-destructive-foreground border border-destructive-foreground/20", // Use destructive foreground text
                      "transform-gpu" // Removed backdrop-blur as it might not be needed with solid color
                    )}
                    // Removed gradient animation style
                    /* style={{
                      backgroundSize: "200% 200%",
                      animation: "gradientShift 4s ease infinite",
                    }} */
                  >
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-xs font-medium">SAVE</span>
                      <span className="text-md leading-none">
                        {discountPercentage}%
                      </span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
            </motion.div>

            <div className="px-3 pt-2 pb-3 space-y-1">
              {" "}
              {/* Added space-y-1 */}
              {/* Title - Ensure truncate is applied */}
              <p className="font-semibold text-sm md:text-md lg:text-lg line-clamp-1 truncate">
                {product?.title ?? "Unnamed Product"}
              </p>
              {/* Price and Wishlist Button Container */}
              <div className="flex justify-between items-center gap-2">
                {" "}
                {/* Use flex justify-between */}
                {/* Price Group */}
                <div className="flex items-baseline space-x-2 text-sm md:text-md lg:text-lg flex-shrink min-w-0">
                  {" "}
                  {/* Allow shrinking, prevent overflow */}
                  {price && (
                    <p className="truncate">
                      {" "}
                      {/* Truncate price if needed */}
                      {priceSymbol}
                      {parseFloat(price?.amount?.toString())?.toString()}
                    </p>
                  )}
                  {isDiscounted && compareAtPrice && (
                    <p className="line-through opacity-60 truncate">
                      {" "}
                      {/* Truncate compare price */}
                      {compareAtSymbol}
                      {parseFloat(
                        compareAtPrice?.amount?.toString()
                      )?.toString()}
                    </p>
                  )}
                </div>
                {/* Wishlist Button */}
                {defaultVariantId && (
                  <WishlistButton
                    variantId={defaultVariantId}
                    className="flex-shrink-0 cursor-pointer" // Prevent shrinking, add cursor
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
