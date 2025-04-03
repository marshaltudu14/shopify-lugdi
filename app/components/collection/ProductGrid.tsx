"use client";

import React from "react";
import Link from "next/link";
import { Frown, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  AnimatedSection,
  buttonHoverVariants,
  itemVariants,
} from "@/app/components/FramerMotion";
import ProductCard from "@/app/components/ProductCard";
import { CollectionProductNode } from "@/lib/types/collection"; // Corrected import

interface ProductGridProps {
  products: CollectionProductNode[]; // Corrected type
  hasNextPage: boolean;
  sentinelRef: React.RefObject<HTMLDivElement | null>; // Allow null for initial ref state
  isLoadingMore: boolean; // Renamed from 'loading' for clarity in this context
  hasAnyFetchedProducts: boolean;
  onClearFilters: () => void;
}

export default function ProductGrid({
  products,
  hasNextPage,
  sentinelRef,
  isLoadingMore,
  hasAnyFetchedProducts,
  onClearFilters,
}: ProductGridProps) {
  const hasProducts = products.length > 0;

  return (
    <>
      {hasProducts ? (
        // Updated grid columns for responsiveness: 2 (default), 3 (md), 4 (lg)
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 md:gap-4">
          {products.map((product) => (
            <div key={product.id}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-10">
          <AnimatedSection delay={0.2}>
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <motion.div
                variants={itemVariants}
                className="flex flex-col items-center justify-center gap-4 max-w-2xl mx-auto"
              >
                <Frown className="w-12 h-12" />
                <h2 className="text-3xl md:text-4xl font-extrabold">
                  No Products Found
                </h2>
              </motion.div>
              <motion.p
                variants={itemVariants}
                className="text-slate-700 dark:text-slate-300 md:text-lg mt-4"
              >
                {hasAnyFetchedProducts
                  ? "No products match your current filters. Try adjusting or clearing them."
                  : "Looks like we don't have products here yet. Try exploring other categories or check back later."}
              </motion.p>
              {hasAnyFetchedProducts && ( // Show clear filters button only if filters caused no products
                <motion.div
                  variants={buttonHoverVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="mt-6"
                >
                  <Button
                    onClick={onClearFilters}
                    className="px-4 py-2 cursor-pointer"
                  >
                    Clear Filters
                  </Button>
                </motion.div>
              )}
              {!hasAnyFetchedProducts && ( // Show back home only if no products were ever fetched
                <Link href="/">
                  <motion.div
                    variants={buttonHoverVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="mt-6"
                  >
                    <Button className="px-4 py-2 cursor-pointer">
                      Back to Home
                    </Button>
                  </motion.div>
                </Link>
              )}
            </div>
          </AnimatedSection>
        </div>
      )}

      {/* Infinite Scroll Sentinel & Loader */}
      {hasNextPage && (
        <div
          ref={sentinelRef}
          className="flex items-center justify-center mt-8 h-10" // Added height to prevent layout shift
        >
          {isLoadingMore && <Loader2 className="animate-spin" />}
        </div>
      )}
    </>
  );
}
