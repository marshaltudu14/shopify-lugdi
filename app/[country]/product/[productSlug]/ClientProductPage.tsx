"use client";

import {
  AnimatedSection,
  buttonHoverVariants,
  itemVariants,
} from "@/app/components/FramerMotion";
import { Button } from "@/components/ui/button";
import { getCurrencySymbol } from "@/lib/countries";
import { GetSingleProductResponse } from "@/lib/types/product";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

interface ClientProductPageProps {
  product: GetSingleProductResponse;
}

export default function ClientProductPage({ product }: ClientProductPageProps) {
  const [selectedVariant, setSelectedVariant] = useState(
    product?.productByHandle?.variants.edges[0]?.node
  );

  if (!product?.productByHandle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <AnimatedSection delay={0.2}>
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <motion.p
              variants={itemVariants}
              className="text-2xl font-bold mb-2"
            >
              This product is currently not available in your region.
            </motion.p>
            <motion.p variants={itemVariants} className="max-w-md">
              Meanwhile, you can check out our other available products in your
              region.
            </motion.p>
            <motion.div
              variants={buttonHoverVariants}
              whileHover="hover"
              whileTap="tap"
              className="mt-6"
            >
              <Link href="/" passHref>
                <Button className="px-4 py-2 rounded-md">Go to Home</Button>
              </Link>
            </motion.div>
          </div>
        </AnimatedSection>
      </div>
    );
  }

  const { productByHandle } = product;
  const currencyCode = productByHandle.priceRange.maxVariantPrice.currencyCode;
  const currencySymbol = getCurrencySymbol(currencyCode);

  // Handle variant selection
  const handleVariantChange = (variantId: string) => {
    const variant = productByHandle.variants.edges.find(
      (edge) => edge.node.id === variantId
    )?.node;
    setSelectedVariant(variant);
  };

  return (
    <div className="min-h-screen px-2 py-2 md:px-3 md:py-3 lg:px-20 lg:py-5">
      <div className="flex flex-col md:flex-row gap-9 pb-10 relative">
        {/* LEFT */}
        <div className="flex-[2] w-full md:w-1/2 md:sticky md:top-20 self-start relative">
          <img
            src={productByHandle.featuredImage?.originalSrc}
            alt={
              productByHandle.featuredImage?.altText || productByHandle.title
            }
            className="w-full h-auto"
          />
        </div>

        {/* RIGHT */}
        <div className="flex-[1] w-full md:w-1/2 md:sticky md:top-20 self-start space-y-1 md:space-y-2 lg:space-y-3">
          <div className="space-y-2 md:space-y-4">
            <p className="text-2xl md:text-3xl lg:text-4xl font-bold">
              {productByHandle.title}
            </p>

            {/* Pricing */}
            <div className="space-y-1 md:space-y-2">
              <div className="flex items-center gap-2 md:gap-4">
                <span className="text-2xl md:text-3xl font-bold text-primary">
                  {currencySymbol}
                  {selectedVariant?.price.amount}
                </span>
                {selectedVariant?.compareAtPrice?.amount && (
                  <span className="text-lg md:text-xl text-muted-foreground line-through">
                    {currencySymbol}
                    {selectedVariant.compareAtPrice.amount}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Inclusive of all taxes
              </p>
            </div>

            {/* Variant Selector */}
            <div className="space-y-2">
              {productByHandle.options.map((option) => (
                <div key={option.id} className="flex flex-col gap-2">
                  <label className="font-medium">{option.name}</label>
                  <div className="flex gap-2 flex-wrap">
                    {option.values.map((value) => {
                      // Find variant with this option value
                      const variant = productByHandle.variants.edges.find(
                        (edge) =>
                          edge.node.selectedOptions.some(
                            (opt) =>
                              opt.name === option.name && opt.value === value
                          )
                      )?.node;

                      return (
                        <Button
                          key={value}
                          variant={
                            selectedVariant?.id === variant?.id
                              ? "default"
                              : "outline"
                          }
                          onClick={() =>
                            variant && handleVariantChange(variant.id)
                          }
                          disabled={!variant?.availableForSale}
                          className="text-sm"
                        >
                          {value}
                          {!variant?.availableForSale && " (Sold Out)"}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Availability */}
            <p className="text-sm">
              {selectedVariant?.availableForSale
                ? `In Stock (${selectedVariant.quantityAvailable} available)`
                : "Out of Stock"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
