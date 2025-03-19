"use client";

import {
  AnimatedSection,
  buttonHoverVariants,
  itemVariants,
} from "@/app/components/FramerMotion";
import { Button } from "@/components/ui/button";
import {
  GetSingleProductRecommendationResponse,
  GetSingleProductResponse,
} from "@/lib/types/product";
import Link from "next/link";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselThumbnail,
} from "@/components/ui/carousel";
import Image from "next/image";
import { getCurrencySymbol } from "@/lib/countries";
import { useCartStore } from "@/app/ZustandStore/cartStore";
import { Alert, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BadgePercent,
  ShoppingCart,
  XCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import ProductCard from "@/app/components/ProductCard";
import { useRouter } from "next/navigation";

export default function ClientProductPage({
  productData,
  recommendationsData,
}: {
  productData: GetSingleProductResponse;
  recommendationsData: GetSingleProductRecommendationResponse;
}) {
  const product = productData?.product;
  const recommendations = recommendationsData?.productRecommendations;

  const [quantity, setQuantity] = useState<number>(1);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { items, addItem } = useCartStore();

  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const response = await fetch("/api/auth/check-auth");
      const data = await response.json();
      setIsAuthenticated(data.authenticated);
    }
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (product?.options?.length > 0) {
      const initialOptions = product.options.reduce(
        (acc, option) => ({
          ...acc,
          [option.name]: option.optionValues[0].name,
        }),
        {}
      );
      setSelectedOptions(initialOptions);
    }
  }, [product]);

  const selectedVariant = product?.variants?.edges?.find((edge) =>
    edge.node.selectedOptions.every(
      (opt) => selectedOptions[opt.name] === opt.value
    )
  )?.node;

  const isVariantInCart =
    selectedVariant &&
    items.some((item) => item.variantId === selectedVariant.id);

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }));
  };

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    if (
      selectedVariant.availableForSale &&
      (selectedVariant.quantityAvailable ?? 0) >= quantity
    ) {
      addItem(
        {
          productId: product.id,
          variantId: selectedVariant.id,
        },
        quantity
      );
    }
  };

  const currencySymbol = selectedVariant
    ? getCurrencySymbol(selectedVariant.price.currencyCode)
    : "";

  if (!product) {
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

  return (
    <div className="min-h-screen px-2 py-2 md:px-3 md:py-3 lg:px-20 lg:py-5">
      <div className="flex flex-col md:flex-row gap-9 pb-10 relative">
        {/* LEFT */}
        <div className="flex-[2] w-full md:w-1/2 md:sticky md:top-20 self-start relative">
          <Carousel images={product.images.edges.map((e) => e.node)}>
            <CarouselContent>
              {product.images.edges.map((edge, index) => (
                <CarouselItem key={index}>
                  <div className="relative w-full h-full rounded-lg overflow-hidden">
                    <Image
                      src={edge.node.url}
                      alt={edge.node.altText || product.title}
                      width={1024}
                      height={1024}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselThumbnail />
          </Carousel>
        </div>

        {/* RIGHT */}
        <div className="flex-[1] w-full md:w-1/2 md:sticky md:top-20 self-start space-y-1 md:space-y-2 lg:space-y-3">
          <div className="space-y-4 lg:space-y-6">
            <p className="text-2xl lg:text-4xl font-bold">{product.title}</p>

            {/* Pricing */}
            {selectedVariant && (
              <div className="space-y-1 md:space-y-2">
                <div className="flex items-center gap-2 md:gap-4">
                  <span className="text-2xl font-bold text-primary">
                    {currencySymbol}
                    {Number(selectedVariant.price.amount).toFixed(2)}
                  </span>
                  {selectedVariant.compareAtPrice?.amount && (
                    <span className="text-xl line-through text-muted-foreground">
                      {currencySymbol}
                      {Number(selectedVariant.compareAtPrice.amount).toFixed(2)}
                    </span>
                  )}
                </div>

                {selectedVariant.taxable && (
                  <p className="text-sm text-muted-foreground">
                    Inclusive of all taxes
                  </p>
                )}

                {selectedVariant.compareAtPrice?.amount && (
                  <Alert className="bg-green-100 dark:bg-green-950 border border-green-500">
                    <BadgePercent className="h-4 w-4 text-green-500" />
                    <AlertTitle>
                      <div className="text-xs lg:text-sm">
                        <span>Save up to </span>
                        <span className="font-semibold text-green-500">
                          {currencySymbol}
                          {(
                            Number(selectedVariant.compareAtPrice.amount) -
                            Number(selectedVariant.price.amount)
                          ).toFixed(2)}
                        </span>{" "}
                        <span className="">
                          (
                          {Math.round(
                            ((Number(selectedVariant.compareAtPrice.amount) -
                              Number(selectedVariant.price.amount)) /
                              Number(selectedVariant.compareAtPrice.amount)) *
                              100
                          )}
                          % OFF)
                        </span>
                      </div>
                    </AlertTitle>
                  </Alert>
                )}
              </div>
            )}

            {/* Variant Selectors */}
            {product.options?.length > 0 && product.variants?.edges?.length > 1
              ? product.options.map((option) => (
                  <div key={option.id} className="space-y-2">
                    <label className="font-medium text-lg">{option.name}</label>
                    <div className="flex gap-3 flex-wrap">
                      {option.optionValues.map((value) => {
                        const isSelected =
                          selectedOptions[option.name] === value.name;
                        const hasSwatch =
                          !!value.swatch?.color ||
                          !!value.swatch?.image?.previewImage.url;
                        const variantForOption = product.variants.edges.find(
                          (edge) =>
                            edge.node.selectedOptions.some(
                              (opt) =>
                                opt.name === option.name &&
                                opt.value === value.name
                            )
                        )?.node;
                        const isAvailable =
                          variantForOption?.availableForSale &&
                          (variantForOption?.quantityAvailable ?? 0) > 0;

                        return (
                          <Button
                            key={value.id}
                            variant={isSelected ? "default" : "outline"}
                            disabled={!isAvailable}
                            className={`relative flex items-center rounded-full gap-2 cursor-pointer ${
                              hasSwatch && !value.swatch?.image ? "pl-8" : ""
                            }`}
                            onClick={() =>
                              handleOptionChange(option.name, value.name)
                            }
                          >
                            {hasSwatch && value.swatch?.color && (
                              <span
                                className="absolute left-2 w-5 h-5 rounded-full border"
                                style={{ backgroundColor: value.swatch.color }}
                              />
                            )}
                            {value.swatch?.image?.previewImage.url ? (
                              <Image
                                src={value.swatch.image.previewImage.url}
                                alt={value.swatch.image.alt || value.name}
                                width={24}
                                height={24}
                                className="rounded-full"
                              />
                            ) : (
                              !value.swatch?.color && value.name
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ))
              : null}

            {/* Quantity */}
            {selectedVariant && (
              <div>
                <div className="space-y-2">
                  <label className="font-medium text-lg">Quantity:</label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="cursor-pointer"
                      onClick={() =>
                        setQuantity((prev) => Math.max(prev - 1, 1))
                      }
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.min(parseInt(e.target.value), 10) || 1)
                      }
                      min={1}
                      max={10}
                      className="w-full text-center"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="cursor-pointer"
                      onClick={() =>
                        setQuantity((prev) => Math.min(prev + 1, 10))
                      }
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Cart Button */}
            {selectedVariant && (
              <div className="space-y-2 pt-4">
                {isVariantInCart ? (
                  <Link href="/cart">
                    <Button className="w-full rounded-md py-6 text-lg font-medium transition-all flex items-center justify-center gap-2 cursor-pointer">
                      <ArrowRight className="w-5 h-5" />
                      <span>Go to Cart</span>
                    </Button>
                  </Link>
                ) : (
                  <Button
                    onClick={handleAddToCart}
                    disabled={
                      !selectedVariant.availableForSale ||
                      selectedVariant.quantityAvailable < quantity
                    }
                    className="w-full py-6 flex items-center gap-2 cursor-pointer"
                  >
                    {selectedVariant.availableForSale &&
                    selectedVariant.quantityAvailable >= quantity ? (
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5" />
                        Add to Cart
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <XCircle className="w-5 h-5" />
                        Out of Stock
                      </div>
                    )}
                  </Button>
                )}
                {selectedVariant.quantityAvailable > 0 &&
                  selectedVariant.quantityAvailable < 10 && (
                    <div
                      className={`flex items-center justify-center gap-2 p-2 mt-3 rounded-md ${
                        selectedVariant.quantityAvailable < 5
                          ? "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}
                    >
                      <div>
                        {selectedVariant.quantityAvailable < 5 ? (
                          <AlertCircle className="w-5 h-5" />
                        ) : (
                          <AlertTriangle className="w-5 h-5" />
                        )}
                      </div>
                      <p className="text-sm">
                        Hurry! Only {selectedVariant.quantityAvailable} left in
                        stock
                      </p>
                    </div>
                  )}

                {/* Description */}
                {product.descriptionHtml && (
                  <div className="mt-5">
                    <h2 className="text-lg font-semibold mb-2">Description</h2>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: product.descriptionHtml,
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Recommendations */}
      {recommendations?.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl text-center font-bold mb-4">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recommendations?.map((rec) => (
              <div key={rec.id}>
                <ProductCard product={rec} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
