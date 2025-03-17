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
import { useState, useEffect } from "react";
import {
  Check,
  AlertTriangle,
  AlertCircle,
  ShoppingCart,
  XCircle,
  ArrowRight,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselThumbnail,
} from "@/components/ui/carousel";
import Image from "next/image";
import { useCartStore } from "@/app/ZustandStore/cartStore";
import { Input } from "@/components/ui/input";

interface ClientProductPageProps {
  product: GetSingleProductResponse;
}

export default function ClientProductPage({ product }: ClientProductPageProps) {
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [quantity, setQuantity] = useState<number>(1);

  const { addItem } = useCartStore();
  const { items } = useCartStore((state) => ({
    items: state.items,
  }));

  const [isAddToCartDisabled, setIsAddToCartDisabled] = useState(true);

  useEffect(() => {
    if (product?.productByHandle?.variants.edges[0]) {
      const firstVariant = product.productByHandle.variants.edges[0].node;
      const initialOptions = firstVariant.selectedOptions.reduce(
        (acc, option) => ({
          ...acc,
          [option.name]: option.value,
        }),
        {}
      );
      setSelectedOptions(initialOptions);
    }
  }, [product]);

  useEffect(() => {
    // Enable "Add to Cart" only if all options are selected
    const allOptionsSelected = product?.productByHandle?.options.every(
      (option) => !!selectedOptions[option.name]
    );
    setIsAddToCartDisabled(!allOptionsSelected);
  }, [selectedOptions, product]);

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

  const selectedVariant = productByHandle?.variants.edges.find((edge) => {
    const variantOptions = edge.node.selectedOptions;
    return productByHandle.options.every((option) =>
      variantOptions.some(
        (opt) =>
          opt.name === option.name &&
          opt.value === (selectedOptions[option.name] || "")
      )
    );
  })?.node;

  const isVariantInCart = items.some(
    (item) => item.variantId === selectedVariant?.id
  );

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }));
  };

  const handleAddToCart = () => {
    if (
      selectedVariant?.availableForSale &&
      selectedVariant?.quantityAvailable >= quantity
    ) {
      addItem(
        {
          productId: productByHandle.id,
          variantId: selectedVariant.id,
          title: productByHandle.title,
          variantTitle: selectedVariant.title,
          price: selectedVariant.price.amount,
        },
        quantity
      );
      alert(`Added ${quantity} ${selectedVariant.title} to cart.`);
    } else {
      alert("Not enough stock available.");
    }
  };

  const variantItemVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
    hover: { scale: 1.1, transition: { duration: 0.2 } },
    tap: { scale: 0.95, transition: { duration: 0.1 } },
    selected: { scale: 1.05, boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.1)" },
  };

  const checkmarkVariants = {
    initial: { opacity: 0, scale: 0 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 500, damping: 15 },
    },
  };

  const images = productByHandle.images.edges.map((edge) => edge.node);

  return (
    <div className="min-h-screen px-2 py-2 md:px-3 md:py-3 lg:px-20 lg:py-5">
      <div className="flex flex-col md:flex-row gap-9 pb-10 relative">
        {/* LEFT */}
        <div className="flex-[2] w-full md:w-1/2 md:sticky md:top-20 self-start relative">
          <Carousel images={images}>
            <CarouselContent>
              {images.map((image, index) => (
                <CarouselItem key={index}>
                  <Image
                    src={image.originalSrc}
                    alt={image.altText || productByHandle.title}
                    width={1024}
                    height={1024}
                    className="w-full h-full"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselThumbnail />
          </Carousel>
        </div>

        {/* RIGHT */}
        <motion.div
          className="flex-[1] w-full md:w-1/2 md:sticky md:top-20 self-start space-y-1 md:space-y-2 lg:space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="space-y-4 md:space-y-6">
            <motion.p
              className="text-2xl md:text-3xl lg:text-4xl font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {productByHandle.title}
            </motion.p>

            {/* Pricing */}
            {selectedVariant && (
              <motion.div
                className="space-y-1 md:space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="flex items-center gap-2 md:gap-4">
                  <span className="text-2xl md:text-3xl font-bold text-primary">
                    {currencySymbol}
                    {selectedVariant.price.amount}
                  </span>
                  {selectedVariant.compareAtPrice?.amount && (
                    <span className="text-lg md:text-xl text-muted-foreground line-through">
                      {currencySymbol}
                      {selectedVariant.compareAtPrice.amount}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Inclusive of all taxes
                </p>
              </motion.div>
            )}

            {/* Variant Selectors */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {productByHandle.options.map((option, optionIndex) => {
                const isColorOption = option.name
                  .toLowerCase()
                  .includes("color");
                return (
                  <motion.div
                    key={option.id}
                    className="flex flex-col gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * optionIndex }}
                  >
                    <div className="flex items-center gap-2">
                      <label className="font-medium text-lg">
                        {option.name}
                      </label>
                      {isColorOption && selectedOptions[option.name] && (
                        <span className="text-sm text-muted-foreground">
                          ({selectedOptions[option.name]})
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      {option.values.map((value, valueIndex) => {
                        const isAvailable = productByHandle.variants.edges.some(
                          (edge) =>
                            edge.node.availableForSale &&
                            edge.node.quantityAvailable > 0 &&
                            edge.node.selectedOptions.every((opt) =>
                              opt.name === option.name
                                ? opt.value === value
                                : opt.value ===
                                  (selectedOptions[opt.name] || "")
                            )
                        );
                        const isSelected =
                          selectedOptions[option.name] === value;
                        const isLightColor =
                          value.toLowerCase() === "white" ||
                          value.toLowerCase().includes("light") ||
                          value.toLowerCase() === "cream" ||
                          value.toLowerCase() === "beige";
                        return (
                          <motion.div
                            key={value}
                            className="relative"
                            initial="initial"
                            animate="animate"
                            whileHover={isAvailable ? "hover" : undefined}
                            whileTap={isAvailable ? "tap" : undefined}
                            variants={variantItemVariants}
                            custom={valueIndex}
                            transition={{ delay: 0.05 * valueIndex }}
                          >
                            <Button
                              variant={isSelected ? "default" : "outline"}
                              onClick={() =>
                                isAvailable &&
                                handleOptionChange(option.name, value)
                              }
                              disabled={!isAvailable}
                              className={`
                                ${
                                  isColorOption
                                    ? "w-12 h-12 p-0 rounded-full relative"
                                    : "rounded-full px-4 py-2"
                                }
                                ${
                                  isSelected && !isColorOption
                                    ? "ring-2 ring-offset-2 ring-primary"
                                    : ""
                                }
                                ${!isAvailable ? "opacity-60" : ""}
                              `}
                              style={
                                isColorOption
                                  ? {
                                      backgroundColor: value,
                                      borderColor: isLightColor
                                        ? "rgb(100, 100, 100)"
                                        : "rgb(230, 230, 230)",
                                      borderWidth: "2px",
                                    }
                                  : undefined
                              }
                            >
                              {!isColorOption && value}
                              {!isAvailable && !isColorOption && (
                                <XCircle className="ml-1 w-4 h-4 inline" />
                              )}
                            </Button>
                            {isSelected && (
                              <motion.div
                                className="absolute top-0 right-0 bg-primary rounded-full p-0.5 shadow-md"
                                variants={checkmarkVariants}
                                style={{
                                  top: "-4px",
                                  right: "-4px",
                                }}
                              >
                                <Check className="w-4 h-4 text-white dark:text-black border rounded-full" />
                              </motion.div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Add Quantity Selector */}
            {selectedVariant && (
              <motion.div
                className="space-y-2 pt-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="flex items-center gap-4">
                  <label className="font-medium text-lg">Quantity:</label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
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
                      className="w-16 text-center"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setQuantity((prev) => Math.min(prev + 1, 10))
                      }
                    >
                      +
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Add to Cart Button and Stock Info */}
            {selectedVariant && (
              <motion.div
                className="space-y-2 pt-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  {isVariantInCart ? (
                    <Link href="/cart">
                      <Button className="w-full rounded-md py-6 text-lg font-medium transition-all flex items-center justify-center gap-2">
                        <ArrowRight className="w-5 h-5" />
                        <span>Go to Cart</span>
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      onClick={handleAddToCart}
                      disabled={
                        isAddToCartDisabled ||
                        !selectedVariant.availableForSale ||
                        selectedVariant.quantityAvailable < quantity
                      }
                      className="w-full rounded-md py-6 text-lg font-medium transition-all"
                      variant={
                        selectedVariant.availableForSale &&
                        selectedVariant.quantityAvailable >= quantity
                          ? "default"
                          : "outline"
                      }
                    >
                      {selectedVariant.availableForSale &&
                      selectedVariant.quantityAvailable >= quantity ? (
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="w-5 h-5" />
                          <span>Add to Cart</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <XCircle className="w-5 h-5" />
                          <span>Out of Stock</span>
                        </div>
                      )}
                    </Button>
                  )}
                </motion.div>
                {selectedVariant.availableForSale &&
                  selectedVariant.quantityAvailable > 0 &&
                  selectedVariant.quantityAvailable < 10 && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                      className={`flex items-center justify-center gap-2 p-2 rounded-md ${
                        selectedVariant.quantityAvailable < 5
                          ? "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}
                    >
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{
                          repeat: Infinity,
                          repeatDelay: 1.5,
                          duration: 0.6,
                        }}
                      >
                        {selectedVariant.quantityAvailable < 5 ? (
                          <AlertCircle className="w-5 h-5" />
                        ) : (
                          <AlertTriangle className="w-5 h-5" />
                        )}
                      </motion.div>
                      <p className="font-medium text-sm">
                        Hurry! Only {selectedVariant.quantityAvailable} left in
                        stock
                      </p>
                    </motion.div>
                  )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
