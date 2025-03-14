"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";

// Define TypeScript interfaces
interface PriceInfo {
  amount: string;
  currencyCode: string;
}

interface VariantNode {
  price: PriceInfo;
  compareAtPrice: PriceInfo | null;
  availableForSale: boolean;
  quantityAvailable: number | null;
}

interface ImageNode {
  originalSrc: string;
  altText?: string;
}

interface ProductCardProps {
  product: {
    title: string;
    handle: string;
    images: {
      edges: Array<{
        node: ImageNode;
      }>;
    };
    variants: {
      edges: Array<{
        node: VariantNode;
      }>;
    };
  };
}

// Framer-motion variants
const cardContainerVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
  hover: {
    transition: {
      duration: 0.3,
    },
  },
};

const imageVariants = {
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

export default function ProductCard({
  product,
}: ProductCardProps): JSX.Element | null {
  const params = useParams();

  const firstImageUrl = product.images.edges[0]?.node.originalSrc;
  const altText = product.images.edges[0]?.node.altText || product.title;

  const variant = product.variants.edges[0]?.node;
  if (!variant) return null;

  const price = variant.price;
  const compareAtPrice = variant.compareAtPrice || {
    amount: "0",
    currencyCode: price.currencyCode,
  };
  const isDiscounted =
    parseFloat(compareAtPrice.amount) > parseFloat(price.amount);
  const isOutOfStock = !variant.availableForSale;
  const quantityAvailable = variant.quantityAvailable || 0;

  const discountPercentage = isDiscounted
    ? Math.round(
        ((parseFloat(compareAtPrice.amount) - parseFloat(price.amount)) /
          parseFloat(compareAtPrice.amount)) *
          100
      )
    : null;

  return (
    <motion.div
      variants={cardContainerVariants}
      initial="hidden"
      animate="show"
      whileHover="hover"
      className="w-full overflow-hidden rounded-xl"
    >
      <Link href={`/product/${product.handle || "#"}`} className="group block">
        <div className="relative h-full border p-3 md:p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
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
            {discountPercentage !== null && (
              <div className="absolute top-2 right-2 px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold bg-red-500 z-10 shadow-sm">
                {discountPercentage}% OFF
              </div>
            )}
            <motion.div className="relative w-full overflow-hidden">
              {firstImageUrl ? (
                <div className="overflow-hidden">
                  <motion.div
                    className="w-full relative"
                    variants={imageVariants}
                  >
                    <Image
                      src={firstImageUrl}
                      width={600}
                      height={600}
                      alt={altText}
                      className={cn(
                        "w-full h-[250px] md:h-[300px] lg:h-[350px] object-cover",
                        isOutOfStock && "opacity-50"
                      )}
                    />
                    {isOutOfStock && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="bg-opacity-70  px-4 py-2 rounded-md text-sm md:text-base font-bold uppercase tracking-wider">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </motion.div>
                </div>
              ) : (
                <Skeleton className="w-full h-[250px] md:h-[300px] lg:h-[350px]" />
              )}
            </motion.div>
            <div className="px-4 py-3 ">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="font-semibold text-sm md:text-md lg:text-lg line-clamp-1 text-right">
                    {product.title || "Unnamed Product"}
                  </p>
                </div>
              </div>
              <div className="mt-2 flex items-center space-x-2">
                <div className="flex items-baseline">
                  <p className="font-bold text-sm md:text-md lg:text-lg">
                    {price.currencyCode} {price.amount}
                  </p>
                  {isDiscounted && (
                    <p className="ml-2 line-through opacity-60 text-xs md:text-sm">
                      {compareAtPrice.currencyCode} {compareAtPrice.amount}
                    </p>
                  )}
                </div>
                {quantityAvailable > 0 && quantityAvailable <= 10 && (
                  <div className="ml-auto bg-amber-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                    Only {quantityAvailable} left
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
