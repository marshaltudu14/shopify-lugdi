"use client";

import {
  AnimatedSection,
  buttonHoverVariants,
  itemVariants,
} from "@/app/components/FramerMotion";
import { Button } from "@/components/ui/button";
import { GetSingleProductResponse } from "@/lib/types/product";
import { ProductsData } from "@/lib/types/products"; // Import ProductsData
import Link from "next/link";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselThumbnail,
} from "@/components/ui/carousel";
import Image from "next/image";
import { getCurrencySymbol } from "@/lib/countries";
import { Alert, AlertTitle } from "@/components/ui/alert"; // Re-added Alert and AlertTitle
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
import { Loader2, Heart } from "lucide-react"; // Keep Heart
import { useCart } from "../../cart/CartContext";
import { Separator } from "@/components/ui/separator";
import { useWishlist } from "@/lib/contexts/WishlistContext"; // Keep wishlist hook

export default function ClientProductPage({
  productData,
  relatedProductsData, // Changed prop name
}: {
  productData: GetSingleProductResponse | null; // Allow null for safety
  relatedProductsData: ProductsData | null; // Changed prop name and type
}) {
  const product = productData?.product;
  // Removed recommendations variable, use relatedProductsData directly

  const [quantity, setQuantity] = useState<number>(1);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [isAdding, setIsAdding] = useState(false);
  const { cart, addToCart } = useCart();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    // Add check for product before accessing options
    if (product && product.options?.length > 0) {
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

  // Add check for product before accessing variants
  const selectedVariant = product && product.variants?.edges?.find((edge) =>
    edge.node.selectedOptions.every(
      (opt) => selectedOptions[opt.name] === opt.value
    )
  )?.node;

  const isVariantInCart =
    selectedVariant &&
    cart.items.some((item) => item.variantId === selectedVariant.id);

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }));
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    setIsAdding(true);
    try {
      await addToCart(selectedVariant.id, quantity);
    } finally {
      setIsAdding(false);
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
    <div className="min-h-screen px-4 py-4 md:px-6 md:py-6 lg:px-24 lg:py-8">
      {" "}
      {/* Increased padding */}
      <div className="flex flex-col md:flex-row gap-16 pb-16 relative">
        {" "}
        {/* Increased gap and bottom padding */}
        <div className="flex-[2] w-full md:w-1/2 md:sticky md:top-24 self-start relative">
          {" "}
          {/* Adjusted sticky top */}
          <Carousel images={product.images.edges.map((e) => e.node)}>
            <CarouselContent>
              {product.images.edges.map((edge, index) => (
                <CarouselItem key={index} className="aspect-[2/3]"> {/* Changed aspect ratio */}
                  <button
                    type="button"
                    className="relative w-full h-full rounded-lg overflow-hidden cursor-zoom-in block"
                    onClick={() => {
                      setLightboxIndex(index);
                      setLightboxOpen(true);
                    }}
                  >
                    <Image
                      // Decode URL before passing to Image component
                      src={edge.node.url ? decodeURIComponent(edge.node.url) : ''}
                      alt={edge.node.altText || product.title}
                      fill={true} // Use fill instead of width/height
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Example sizes, adjust as needed
                      className="object-cover" // Keep object-cover, remove w-full and aspect ratio here
                    />
                  </button>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselThumbnail />{" "}
            {/* We might need to adjust this later if needed */}
          </Carousel>
          <Lightbox
            open={lightboxOpen}
            close={() => setLightboxOpen(false)}
            index={lightboxIndex}
            slides={product.images.edges.map((edge) => ({
              // Decode URL for lightbox slides as well
              src: edge.node.url ? decodeURIComponent(edge.node.url) : '',
              alt: edge.node.altText || product.title,
              width: 1024, // Use hardcoded width like the Image component
              height: 1024, // Use hardcoded height like the Image component
            }))}
            styles={{ container: { backgroundColor: "rgba(0, 0, 0, .8)" } }}
            plugins={[Zoom, Thumbnails]} // Added Zoom and Thumbnails plugins
            zoom={{
              maxZoomPixelRatio: 2, // Limit max zoom
              scrollToZoom: true, // Enable scroll to zoom
            }}
            thumbnails={{
              border: 0, // Remove thumbnail border
              padding: 0, // Remove thumbnail padding
              gap: 8, // Gap between thumbnails
            }}
          />
        </div>
        <div className="flex-[1] w-full md:w-1/2 md:sticky md:top-24 self-start space-y-4 md:space-y-6 lg:space-y-8">
          {" "}
          {/* Increased spacing & Adjusted sticky top */}
          <div className="space-y-6 lg:space-y-8">
            {" "}
            {/* Increased spacing */}
            <p className="text-3xl lg:text-5xl font-bold">
              {product.title}
            </p>{" "}
            {/* Slightly larger title */}
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
                {/* Reverted Discount Section Start */}
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
                {/* Reverted Discount Section End */}
              </div>
            )}
            <Separator />
            {/* Add check for product before accessing options/variants */}
            {product && product.options?.length > 0 && product.variants?.edges?.length > 1
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
                        // Add check for product before accessing variants
                        const variantForOption = product && product.variants.edges.find(
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
                            className={`relative flex items-center justify-center rounded-md px-4 py-2 cursor-pointer border-2 ${
                              // Already has cursor-pointer
                              isSelected ? "border-primary" : "border-border"
                            } ${
                              !isAvailable
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                            style={{ minWidth: "4rem" }} // Ensure minimum width for consistency
                            onClick={() =>
                              handleOptionChange(option.name, value.name)
                            }
                          >
                            {hasSwatch && value.swatch?.color && (
                              <span
                                className="w-5 h-5 rounded-sm border mr-2" // Changed to rounded-sm, added margin
                                style={{ backgroundColor: value.swatch.color }}
                              />
                            )}
                            {value.swatch?.image?.previewImage.url ? (
                              <Image
                                // Decode swatch image URL
                                src={value.swatch.image.previewImage.url ? decodeURIComponent(value.swatch.image.previewImage.url) : ''}
                                alt={value.swatch.image.alt || value.name}
                                width={24}
                                height={24}
                                className="rounded-sm mr-2" // Changed to rounded-sm, added margin
                              />
                            ) : null}
                            <span className="text-sm">{value.name}</span>{" "}
                            {/* Ensure text is always visible */}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ))
              : null}
            {selectedVariant && (
              <div>
                <div className="space-y-2">
                  <label className="font-medium text-lg">Quantity:</label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="cursor-pointer rounded-md" // Already has cursor-pointer
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
                        setQuantity(Math.min(parseInt(e.target.value) || 1, 10))
                      }
                      min={1}
                      max={10}
                      className="w-full text-center"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="cursor-pointer rounded-md" // Already has cursor-pointer
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
            {selectedVariant && (
              <div className="space-y-4 pt-4">
                {" "}
                {/* Increased spacing */}
                {/* Container for Action Buttons */}
                <div className="space-y-3">
                  {" "}
                  {/* Add space between buttons */}
                  {/* Add to Cart / Go to Cart Button */}
                  {isVariantInCart ? (
                    <Link href="/cart" className="block">
                      {" "}
                      {/* Use block for full width */}
                      <Button className="w-full rounded-md py-3 text-lg font-medium transition-all flex items-center justify-center gap-2 cursor-pointer">
                        {/* Already has cursor-pointer */}
                        <ArrowRight className="w-5 h-5" />
                        <span>Go to Cart</span>
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      onClick={handleAddToCart}
                      disabled={
                        !selectedVariant.availableForSale ||
                        selectedVariant.quantityAvailable < quantity ||
                        isAdding
                      }
                      className="w-full rounded-md py-6 flex items-center justify-center gap-2 text-lg font-medium cursor-pointer" // Already has cursor-pointer
                      // glowVariant="vip-gold" // Removed glow effect
                    >
                      {isAdding ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : selectedVariant.availableForSale &&
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
                  {/* Wishlist Button (Full Width) */}
                  <WishlistActionButton variantId={selectedVariant.id} />
                </div>
                {selectedVariant.quantityAvailable > 0 &&
                  selectedVariant.quantityAvailable < 10 && (
                    <div
                      className={`flex items-center justify-center gap-2 mt-3 ${
                        // Removed padding and rounded-md
                        selectedVariant.quantityAvailable < 5
                          ? "text-red-600 dark:text-red-400" // Removed background, kept text color
                          : "text-amber-600 dark:text-amber-400" // Removed background, kept text color
                      }`}
                    >
                      <div>
                        {selectedVariant.quantityAvailable < 5 ? (
                          <AlertCircle className="w-5 h-5" />
                        ) : (
                          <AlertTriangle className="w-5 h-5" />
                        )}
                      </div>
                      <p className="text-sm font-medium">
                        {" "}
                        {/* Added font-medium */}
                        Hurry! Only {selectedVariant.quantityAvailable} left in
                        stock
                      </p>
                    </div>
                  )}
                {/* Add check for product before accessing descriptionHtml */}
                {product && product.descriptionHtml && (
                  <div className="mt-8 pt-6 border-t">
                    {" "}
                    {/* Added top margin, padding, and border */}
                    <h2 className="text-xl font-semibold mb-4">
                      Description
                    </h2>{" "}
                    {/* Increased heading size and margin */}
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none" // Added prose styling for description
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
      {/* Conditionally render based on relatedProductsData (more robust check) */}
      {relatedProductsData && relatedProductsData.products && relatedProductsData.products.edges && relatedProductsData.products.edges.length > 0 && (
        <div className="mt-16 pt-10 border-t">
          {" "}
          {/* Increased top margin, added padding and border */}
          <h2 className="text-3xl text-center font-bold mb-8">
            {" "}
            {/* Increased heading size and margin */}
            You Might Also Like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Map over relatedProductsData, ensuring it's not null */}
            {relatedProductsData?.products?.edges?.map((edge) => (
              <div key={edge.node.id}>
                {/* Pass edge.node which matches BasicProductFragment structure */}
                <ProductCard product={edge.node} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// --- WishlistActionButton Component (Moved outside ClientProductPage for clarity) ---
interface WishlistActionButtonProps {
  variantId: string;
}

const WishlistActionButton: React.FC<WishlistActionButtonProps> = ({
  variantId,
}) => {
  const { addToWishlist, removeFromWishlist, isItemInWishlist } = useWishlist();
  // No need for local state here, rely directly on context for button state
  const isInWishlist = isItemInWishlist(variantId);

  const handleToggle = () => {
    if (isInWishlist) {
      removeFromWishlist(variantId);
    } else {
      addToWishlist(variantId);
    }
  };

  return (
    <Button
      variant="outline" // Use outline variant
      className="w-full rounded-md py-6 flex items-center justify-center gap-2 cursor-pointer text-lg font-medium" // Match py-6 and text/font styles
      onClick={handleToggle}
      aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={`w-5 h-5 transition-colors duration-200 ${
          isInWishlist ? "fill-red-500 text-red-500" : "text-gray-500" // Add default color
        }`}
      />
      {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
    </Button>
  );
};
