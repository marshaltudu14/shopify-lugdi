"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useCartStore } from "@/app/ZustandStore/cartStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselThumbnail,
} from "@/components/ui/carousel";
import {
  Check,
  AlertTriangle,
  AlertCircle,
  ShoppingCart,
  XCircle,
  ArrowRight,
  Tag,
} from "lucide-react";
import { getCurrencySymbol } from "@/lib/countries";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  GetSingleProductRecommendationResponse,
  GetSingleProductResponse,
} from "@/lib/types/product";

export default function ClientProductPage({
  productData,
  recommendationsData,
}: {
  productData: GetSingleProductResponse;
  recommendationsData: GetSingleProductRecommendationResponse;
}) {
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const { items, addItem } = useCartStore();

  // Destructure product from productData
  const product = productData.product;
  // Destructure productRecommendations from recommendationsData
  const recommendations = recommendationsData.productRecommendations || [];

  console.log("Product:", product);

  useEffect(() => {
    if (product?.options?.length > 0) {
      const initialOptions = product.options.reduce(
        (acc: any, option: any) => ({
          ...acc,
          [option.name]: option.optionValues[0].name,
        }),
        {}
      );
      setSelectedOptions(initialOptions);
      setActiveImage(product.images.edges[0]?.node.url);
    }
  }, [product]);

  const selectedVariant =
    product?.options && Object.keys(selectedOptions).length > 0
      ? product.options[0].optionValues.find((ov: any) =>
          product.options.every((opt: any) =>
            ov.firstSelectableVariant.selectedOptions.some(
              (so: any) =>
                so.name === opt.name && so.value === selectedOptions[opt.name]
            )
          )
        )?.firstSelectableVariant
      : null;

  useEffect(() => {
    if (selectedVariant?.image?.url) {
      setActiveImage(selectedVariant.image.url);
    }
  }, [selectedVariant]);

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
      selectedVariant.quantityAvailable >= quantity
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
    return <div>Product not found</div>;
  }

  const variantItemVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    hover: { scale: 1.1 },
    tap: { scale: 0.95 },
    selected: { scale: 1.05, boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.1)" },
  };

  const checkmarkVariants = {
    initial: { opacity: 0, scale: 0 },
    animate: { opacity: 1, scale: 1 },
  };

  return (
    <div className="min-h-screen px-2 py-2 md:px-3 md:py-3 lg:px-20 lg:py-5">
      <div className="flex flex-col md:flex-row gap-9 pb-10">
        {/* Images */}
        <div className="flex-[2] md:sticky md:top-20 self-start">
          <Carousel images={product.images.edges.map((e: any) => e.node)}>
            <CarouselContent>
              {product.images.edges.map((edge: any, index: number) => (
                <CarouselItem key={index}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Image
                          src={activeImage || edge.node.url}
                          alt={edge.node.altText || product.title}
                          width={1024}
                          height={1024}
                          className="w-full h-full object-cover"
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        {edge.node.altText || "Product Image"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselThumbnail />
          </Carousel>
          {product.totalInventory > 0 && (
            <Badge variant="secondary" className="mt-2">
              {product.totalInventory} in stock
            </Badge>
          )}
        </div>

        {/* Product Details */}
        <motion.div className="flex-[1] space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
              {product.title}
            </h1>
            {product.tags.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {product.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline">
                    <Tag className="w-4 h-4 mr-1" /> {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Pricing */}
          {selectedVariant && (
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-primary">
                  {currencySymbol}
                  {selectedVariant.price.amount}
                </span>
                {selectedVariant.compareAtPrice?.amount && (
                  <span className="text-lg text-muted-foreground line-through">
                    {currencySymbol}
                    {selectedVariant.compareAtPrice.amount}
                  </span>
                )}
              </div>
              {selectedVariant.taxable && (
                <p className="text-sm text-muted-foreground">Tax included</p>
              )}
            </div>
          )}

          {/* Variant Selectors */}
          {product.options.map((option: any) => (
            <div key={option.id} className="space-y-2">
              <label className="font-medium text-lg">{option.name}</label>
              <div className="flex gap-3 flex-wrap">
                {option.optionValues.map((value: any) => {
                  const isSelected =
                    selectedOptions[option.name] === value.name;
                  const isAvailable =
                    value.firstSelectableVariant.availableForSale;
                  const isColor = option.name.toLowerCase().includes("color");
                  return (
                    <motion.div
                      key={value.id}
                      variants={variantItemVariants}
                      initial="initial"
                      animate="animate"
                      whileHover={isAvailable ? "hover" : undefined}
                      whileTap={isAvailable ? "tap" : undefined}
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant={isSelected ? "default" : "outline"}
                              onClick={() =>
                                handleOptionChange(option.name, value.name)
                              }
                              disabled={!isAvailable}
                              className={`
                                ${
                                  isColor
                                    ? "w-12 h-12 p-0 rounded-full"
                                    : "rounded-full px-4 py-2"
                                }
                                ${!isAvailable ? "opacity-60" : ""}
                              `}
                              style={
                                isColor && value.swatch?.color
                                  ? { backgroundColor: value.swatch.color }
                                  : undefined
                              }
                            >
                              {!isColor && value.name}
                              {isSelected && (
                                <motion.div
                                  className="absolute top-0 right-0 bg-primary rounded-full p-0.5"
                                  variants={checkmarkVariants}
                                  style={{ top: "-4px", right: "-4px" }}
                                >
                                  <Check className="w-4 h-4 text-white" />
                                </motion.div>
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {value.name}
                            {!isAvailable && " (Out of Stock)"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quantity */}
          {selectedVariant && (
            <div className="space-y-2">
              <label className="font-medium text-lg">Quantity:</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity((prev) => Math.max(prev - 1, 1))}
                >
                  -
                </Button>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      Math.max(
                        1,
                        Math.min(
                          parseInt(e.target.value) || 1,
                          selectedVariant.quantityAvailable
                        )
                      )
                    )
                  }
                  min={1}
                  max={selectedVariant.quantityAvailable}
                  className="w-16 text-center"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setQuantity((prev) =>
                      Math.min(prev + 1, selectedVariant.quantityAvailable)
                    )
                  }
                >
                  +
                </Button>
              </div>
              {selectedVariant.barcode && (
                <p className="text-sm text-muted-foreground">
                  Barcode: {selectedVariant.barcode}
                </p>
              )}
            </div>
          )}

          {/* Cart Button */}
          {selectedVariant && (
            <div className="space-y-2">
              {isVariantInCart ? (
                <Link href="/cart">
                  <Button className="w-full py-6 flex items-center gap-2">
                    <ArrowRight className="w-5 h-5" />
                    Go to Cart
                  </Button>
                </Link>
              ) : (
                <Button
                  onClick={handleAddToCart}
                  disabled={
                    !selectedVariant.availableForSale ||
                    selectedVariant.quantityAvailable < quantity
                  }
                  className="w-full py-6 flex items-center gap-2"
                >
                  {selectedVariant.availableForSale &&
                  selectedVariant.quantityAvailable >= quantity ? (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5" />
                      Out of Stock
                    </>
                  )}
                </Button>
              )}
              {selectedVariant.quantityAvailable > 0 &&
                selectedVariant.quantityAvailable < 10 && (
                  <div className="flex items-center gap-2 p-2 rounded-md bg-amber-50 text-amber-600">
                    <AlertTriangle className="w-5 h-5" />
                    <p className="text-sm">
                      Only {selectedVariant.quantityAvailable} left in stock
                    </p>
                  </div>
                )}
              {selectedVariant.currentlyNotInStock && (
                <div className="flex items-center gap-2 p-2 rounded-md bg-red-50 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  <p className="text-sm">
                    Currently not in stock but can be ordered
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <div
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          </div>
        </motion.div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">You Might Also Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map((rec: any) => (
              <Link key={rec.id} href={`/product/${rec.handle}`}>
                <div className="border p-4 rounded-md hover:shadow-lg transition-shadow">
                  <Image
                    src={rec.featuredImage?.url}
                    alt={rec.title}
                    width={300}
                    height={300}
                    className="w-full h-48 object-cover"
                  />
                  <h3 className="mt-2 font-medium">{rec.title}</h3>
                  <div className="flex items-center gap-2">
                    <p>
                      {getCurrencySymbol(
                        rec.priceRange.minVariantPrice.currencyCode
                      )}
                      {rec.priceRange.minVariantPrice.amount}
                    </p>
                    {rec.compareAtPriceRange?.minVariantPrice?.amount && (
                      <p className="text-muted-foreground line-through">
                        {getCurrencySymbol(
                          rec.compareAtPriceRange.minVariantPrice.currencyCode
                        )}
                        {rec.compareAtPriceRange.minVariantPrice.amount}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={rec.availableForSale ? "success" : "destructive"}
                  >
                    {rec.availableForSale ? "In Stock" : "Out of Stock"}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
