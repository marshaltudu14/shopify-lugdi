"use client";

import React, { useEffect, useState } from "react";
import { useCart } from "./CartContext";
import { toast } from "sonner";
import {
  AnimatedSection,
  buttonHoverVariants,
  iconVariants,
  itemVariants,
} from "@/app/components/FramerMotion";
import {
  Loader2,
  ShoppingCart,
  Trash2,
  ArrowLeft,
  Tag,
  Lock,
  Shield,
  AlertTriangle,
  Info,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getCurrencySymbol } from "@/lib/countries";
import { Badge } from "@/components/ui/badge";

export default function ClientCartPage() {
  const { cart, getCart, updateCartItem, removeFromCart } = useCart();
  const [loadingItems, setLoadingItems] = React.useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [collapseMobileCart, setCollapseMobileCart] = useState(false);

  // Check if any item is out of stock
  const hasOutOfStockItems = cart?.items?.some(
    (item) =>
      item.merchandise?.quantityAvailable !== undefined &&
      item.merchandise.quantityAvailable <= 0
  );

  useEffect(() => {
    getCart().catch((error) => {
      console.error("Error in getCart on mount:", error);
      toast.error("Failed to load cart.");
    });
  }, [getCart]);

  const handleQuantityChange = async (lineId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      toast.error("Quantity must be at least 1.");
      return;
    }

    setLoadingItems((prev) => [...prev, lineId]);
    try {
      await updateCartItem(lineId, newQuantity);
      toast.success("Cart updated successfully");
    } catch (error) {
      console.error(`Error updating quantity for lineId: ${lineId}`, error);
      toast.error("Failed to update quantity.");
    } finally {
      setLoadingItems((prev) => prev.filter((id) => id !== lineId));
    }
  };

  const handleRemoveItem = async (lineId: string) => {
    setLoadingItems((prev) => [...prev, lineId]);
    try {
      await removeFromCart(lineId);
      toast.success("Item removed from cart");
    } catch (error) {
      console.error(`Error removing item with lineId: ${lineId}`, error);
      toast.error("Failed to remove item.");
    } finally {
      setLoadingItems((prev) => prev.filter((id) => id !== lineId));
    }
  };

  const handleCheckout = () => {
    if (hasOutOfStockItems) {
      toast.error("Please remove out of stock items before checkout");
      return;
    }

    if (!cart.checkoutUrl) {
      toast.error("Checkout URL is not available.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      window.location.href = cart.checkoutUrl as string;
    }, 500);
  };

  // Calculate original price (MRP) total
  const calculateOriginalTotal = () => {
    let originalTotal = 0;
    cart?.items?.forEach((item) => {
      const originalPrice = item.merchandise?.compareAtPrice?.amount
        ? Number(item.merchandise.compareAtPrice.amount)
        : Number(item.merchandise?.price.amount);
      originalTotal += originalPrice * item.quantity;
    });
    return originalTotal.toFixed(2);
  };

  // Calculate savings
  const calculateSavings = () => {
    let savings = 0;
    cart?.items?.forEach((item) => {
      if (item.merchandise?.compareAtPrice?.amount) {
        const discount =
          (Number(item.merchandise.compareAtPrice.amount) -
            Number(item.merchandise?.price.amount)) *
          item.quantity;
        savings += discount;
      }
    });
    return savings > 0 ? savings.toFixed(2) : null;
  };

  const totalSavings = calculateSavings();
  const originalTotal = calculateOriginalTotal();
  const priceSymbol = cart?.totalAmount?.currencyCode
    ? getCurrencySymbol(cart.totalAmount.currencyCode)
    : "$";

  if (!cart?.cartId || !cart?.items || cart?.items.length === 0) {
    return (
      <AnimatedSection delay={0.2}>
        <div className="flex flex-col items-center justify-center min-h-[80vh] py-16 px-4 text-center">
          <motion.div
            variants={iconVariants}
            className="mb-8 p-6 rounded-full bg-primary/10 dark:bg-primary/20"
          >
            <ShoppingCart className="w-16 h-16 text-primary" />
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4 max-w-md">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Your Cart is Empty
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Discover our latest collections and fill your cart with style.
            </p>
          </motion.div>

          <motion.div
            variants={buttonHoverVariants}
            whileTap="tap"
            whileHover="hover"
            initial="initial"
            className="mt-8"
          >
            <Link href="/">
              <Button
                size="lg"
                className="px-8 py-6 text-lg cursor-pointer group rounded-full shadow-md"
              >
                <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
                Start Shopping
              </Button>
            </Link>
          </motion.div>
        </div>
      </AnimatedSection>
    );
  }

  return (
    <AnimatedSection delay={0.2}>
      <div className="min-h-screen max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-12">
        {/* Mobile Summary Toggle (mobile only) */}
        <div className="lg:hidden sticky top-0 z-10 bg-white dark:bg-gray-950 pb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link href="/">
                <Button variant="ghost" size="sm" className="group">
                  <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                  Back
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Cart ({cart.itemCount})
              </h1>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCollapseMobileCart(!collapseMobileCart)}
              className="flex items-center"
            >
              {collapseMobileCart ? "Show details" : "Hide details"}
              {collapseMobileCart ? (
                <ChevronDown className="ml-2 w-4 h-4" />
              ) : (
                <ChevronUp className="ml-2 w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Mobile Quick Summary - Always visible */}
          <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total:</span>
              <span className="font-bold text-lg text-primary">
                {priceSymbol}
                {cart.totalAmount?.amount}
              </span>
            </div>
            {totalSavings && (
              <div className="flex justify-between items-center mt-1 text-sm text-green-600 dark:text-green-500">
                <span>You save:</span>
                <span>
                  {priceSymbol}
                  {totalSavings}
                </span>
              </div>
            )}
            <Button
              className="w-full mt-3 font-medium"
              onClick={handleCheckout}
              disabled={isSubmitting || hasOutOfStockItems}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : hasOutOfStockItems ? (
                <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" />
              ) : (
                <Lock className="w-4 h-4 mr-2" />
              )}
              {isSubmitting
                ? "Processing..."
                : hasOutOfStockItems
                ? "Remove Out-of-Stock Items"
                : "Checkout"}
            </Button>
          </div>
        </div>

        {/* Header and Back Button (tablet/desktop only) */}
        <div className="hidden lg:flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Link href="/">
              <Button variant="ghost" size="sm" className="group mr-4">
                <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                Continue Shopping
              </Button>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Shopping Cart
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {cart.itemCount} {cart.itemCount === 1 ? "item" : "items"}
          </p>
        </div>

        {/* Checkout Progress Indicator (hidden on mobile when collapsed) */}
        <AnimatePresence>
          {(!collapseMobileCart || window.innerWidth >= 1024) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex justify-center items-center my-8"
            >
              <div className="flex items-center w-full max-w-md">
                <div className="flex flex-col items-center flex-1">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-white dark:text-black font-bold shadow-md">
                    1
                  </div>
                  <span className="mt-2 font-medium text-primary dark:text-primary">
                    Cart
                  </span>
                </div>

                <div className="h-1 flex-1 bg-gradient-to-r from-primary to-gray-300 dark:to-gray-600"></div>

                <div className="flex flex-col items-center flex-1">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-bold shadow-md">
                    2
                  </div>
                  <span className="mt-2 font-medium text-gray-500 dark:text-gray-400">
                    Checkout
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Out of Stock Warning Banner (if needed) */}
        {hasOutOfStockItems && (
          <Alert className="mb-6 border-amber-500 bg-amber-50 dark:bg-amber-950/30">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-700 dark:text-amber-400">
              Out of Stock Items
            </AlertTitle>
            <AlertDescription className="text-amber-600 dark:text-amber-300">
              Your cart contains out-of-stock items. Please remove them to
              proceed to checkout.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content - Conditionally hide on mobile when collapsed */}
        <AnimatePresence>
          {(!collapseMobileCart || window.innerWidth >= 1024) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col lg:flex-row gap-8"
            >
              {/* Cart Items Section */}
              <div className="lg:flex-2 w-full lg:w-2/3 space-y-6">
                <motion.div
                  variants={itemVariants}
                  className="w-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-xl p-4 md:p-6 shadow-sm sticky top-20 lg:top-6 max-h-[calc(100vh-120px)] overflow-y-auto"
                >
                  <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
                    Your Items
                  </h2>

                  <Separator className="mb-6" />

                  {/* Divider between items instead of each having its own border */}
                  <div className="divide-y divide-gray-200 dark:divide-gray-800">
                    {cart.items.map((item) => {
                      // Calculate line item total
                      const lineItemTotal = (
                        Number(item.merchandise?.price.amount) * item.quantity
                      ).toFixed(2);
                      const isOutOfStock =
                        item.merchandise?.quantityAvailable !== undefined &&
                        item.merchandise.quantityAvailable <= 0;

                      return (
                        <motion.div
                          key={item.lineId}
                          variants={itemVariants}
                          className={`group flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 py-6 ${
                            isOutOfStock
                              ? "bg-red-50/50 dark:bg-red-950/10"
                              : ""
                          }`}
                        >
                          {/* Product Image with Mobile Optimization */}
                          <div className="relative aspect-square w-32 h-32 sm:w-28 sm:h-28 lg:w-32 lg:h-32 mx-auto sm:mx-0 rounded-lg overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                            {item.merchandise?.image?.url && (
                              <Link
                                href={`/product/${item.merchandise?.product?.handle}`}
                                className="group-hover:opacity-90 transition-opacity duration-200"
                              >
                                <Image
                                  src={item.merchandise.image.url}
                                  alt={
                                    item.merchandise.image.altText ||
                                    item.merchandise.product?.title ||
                                    "Product Image"
                                  }
                                  fill
                                  className="object-cover"
                                />
                              </Link>
                            )}
                          </div>

                          {/* Product Details with Mobile Optimization */}
                          <div className="flex-1 flex flex-col justify-between w-full">
                            <div className="space-y-2">
                              {/* Mobile product header - better layout */}
                              <div className="flex flex-wrap justify-between sm:block">
                                {/* Sale badge */}
                                {item.merchandise?.compareAtPrice?.amount && (
                                  <Badge className="mb-1 bg-red-500 hover:bg-red-600 text-white">
                                    <Tag className="w-3 h-3 mr-1" />
                                    Sale
                                  </Badge>
                                )}

                                {/* Out of Stock Badge */}
                                {isOutOfStock && (
                                  <Badge
                                    className="mb-1 bg-red-600 hover:bg-red-700 text-white"
                                    variant="destructive"
                                  >
                                    Out of Stock
                                  </Badge>
                                )}
                              </div>

                              <Link
                                href={`/product/${item.merchandise?.product?.handle}`}
                                className="font-semibold text-lg md:text-xl hover:text-primary transition-colors dark:text-gray-200 break-words"
                              >
                                {item.merchandise?.product?.title}
                              </Link>

                              {/* Price Display with Mobile Optimization */}
                              <div className="flex items-center gap-3 flex-wrap">
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                  {priceSymbol}
                                  {Number(
                                    item.merchandise?.price.amount
                                  ).toFixed(2)}
                                </p>

                                {item.merchandise?.compareAtPrice?.amount && (
                                  <p className="line-through text-gray-400 ml-2">
                                    {priceSymbol}
                                    {Number(
                                      item.merchandise.compareAtPrice.amount
                                    ).toFixed(2)}
                                  </p>
                                )}

                                {/* Show savings percentage if on sale */}
                                {item.merchandise?.compareAtPrice?.amount && (
                                  <Badge
                                    variant="outline"
                                    className="text-red-500 border-red-500"
                                  >
                                    {Math.round(
                                      (1 -
                                        Number(item.merchandise?.price.amount) /
                                          Number(
                                            item.merchandise.compareAtPrice
                                              .amount
                                          )) *
                                        100
                                    )}
                                    % off
                                  </Badge>
                                )}
                              </div>

                              {/* Line Item Total - New! */}
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {priceSymbol}
                                {Number(item.merchandise?.price.amount).toFixed(
                                  2
                                )}{" "}
                                × {item.quantity} ={" "}
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                  {priceSymbol}
                                  {lineItemTotal}
                                </span>
                              </p>

                              {/*Variant Details*/}
                              {(item.merchandise?.selectedOptions ?? [])
                                .length > 0 && (
                                <div className="mt-1">
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {item.merchandise?.selectedOptions
                                      .map((opt) => `${opt.name}: ${opt.value}`)
                                      .join(", ")}
                                  </p>
                                </div>
                              )}

                              {/* Out of Stock Alert - Improved */}
                              {isOutOfStock && (
                                <Alert className="mt-2 border border-red-500 bg-red-50 dark:bg-red-950/30 py-2 px-3">
                                  <AlertTitle className="text-sm font-medium flex items-center">
                                    <AlertTriangle className="w-4 h-4 mr-1 text-red-600" />
                                    Item Out of Stock
                                  </AlertTitle>
                                  <AlertDescription className="text-xs">
                                    Please remove this item to proceed to
                                    checkout.
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() =>
                                        handleRemoveItem(item.lineId)
                                      }
                                      className="w-full mt-2 text-xs h-8"
                                      disabled={loadingItems.includes(
                                        item.lineId
                                      )}
                                    >
                                      {loadingItems.includes(item.lineId) ? (
                                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                      ) : (
                                        <Trash2 className="w-3 h-3 mr-1" />
                                      )}
                                      Remove Item
                                    </Button>
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>

                            {/* Quantity controls and remove button - Mobile layout improvements */}
                            <div className="flex flex-wrap sm:flex-row sm:items-center sm:justify-between mt-4 gap-4">
                              <div className="flex items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400 mr-3">
                                  Quantity:
                                </span>
                                <div className="flex items-center">
                                  <Button
                                    onClick={() =>
                                      handleQuantityChange(
                                        item.lineId,
                                        item.quantity - 1
                                      )
                                    }
                                    disabled={
                                      loadingItems.includes(item.lineId) ||
                                      item.quantity <= 1 ||
                                      isOutOfStock
                                    }
                                    className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-l-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 border border-gray-300 dark:border-gray-700"
                                  >
                                    -
                                  </Button>
                                  <span className="w-10 h-8 flex items-center justify-center border-t border-b border-gray-300 dark:border-gray-700 text-center bg-white dark:bg-gray-900">
                                    {item.quantity}
                                  </span>
                                  <Button
                                    onClick={() =>
                                      handleQuantityChange(
                                        item.lineId,
                                        item.quantity + 1
                                      )
                                    }
                                    disabled={
                                      loadingItems.includes(item.lineId) ||
                                      !item.merchandise?.availableForSale ||
                                      isOutOfStock
                                    }
                                    className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-r-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 border border-gray-300 dark:border-gray-700"
                                  >
                                    +
                                  </Button>
                                </div>
                              </div>

                              {/* Remove Item - Not shown for out of stock items as there's already a remove button */}
                              {!isOutOfStock && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveItem(item.lineId)}
                                  className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 flex items-center"
                                  disabled={loadingItems.includes(item.lineId)}
                                >
                                  {loadingItems.includes(item.lineId) ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4 mr-2" />
                                  )}
                                  Remove
                                </Button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              </div>

              {/* Order Summary Section - Sticky on both mobile and desktop */}
              <div className="lg:flex-1 w-full lg:w-1/3">
                <motion.div
                  variants={itemVariants}
                  className="w-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-xl p-6 h-fit sticky top-20 lg:top-6 shadow-sm"
                >
                  <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
                    Order Summary
                  </h2>

                  <div className="space-y-4 mb-6">
                    {/* MRP Total - New! */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">
                        MRP Total:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {priceSymbol}
                        {originalTotal}
                      </span>
                    </div>

                    {/* Savings - Only show if there are savings */}
                    {totalSavings && (
                      <div className="flex justify-between items-center text-green-600 dark:text-green-500">
                        <span className="flex items-center">
                          <Tag className="w-4 h-4 mr-2" />
                          Savings:
                        </span>
                        <span className="font-medium">
                          -{priceSymbol}
                          {totalSavings}
                        </span>
                      </div>
                    )}

                    {/* Subtotal */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">
                        Subtotal ({cart.itemCount}{" "}
                        {cart.itemCount === 1 ? "item" : "items"}):
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {priceSymbol}
                        {cart.subtotalAmount?.amount}
                      </span>
                    </div>

                    {/* Shipping */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">
                        Shipping:
                      </span>
                      <span className="text-gray-900 dark:text-gray-100">
                        Calculated at checkout
                      </span>
                    </div>

                    {/* Tax */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">
                        Estimated Tax:
                      </span>
                      <span className="text-gray-900 dark:text-gray-100">
                        Calculated at checkout
                      </span>
                    </div>
                  </div>

                  {/* Separator */}
                  <Separator className="my-6" />

                  {/* Total */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                        Total:
                      </span>
                      <span className="font-bold text-xl text-primary">
                        {priceSymbol}
                        {cart.totalAmount?.amount}
                      </span>
                    </div>
                  </div>

                  {/* Checkout Button - With Improved Disabled State */}
                  <Button
                    className="w-full h-12 text-lg font-medium transition-all duration-300 relative overflow-hidden group"
                    onClick={handleCheckout}
                    disabled={isSubmitting || hasOutOfStockItems}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : hasOutOfStockItems ? (
                      <AlertTriangle className="w-5 h-5 mr-2 text-amber-200" />
                    ) : (
                      <Lock className="w-5 h-5 mr-2 transition-transform group-hover:scale-90" />
                    )}
                    {isSubmitting
                      ? "Processing..."
                      : hasOutOfStockItems
                      ? "Remove Out-of-Stock Items"
                      : "Proceed to Checkout"}
                    <motion.span
                      className="absolute inset-0 bg-white dark:bg-black rounded-md opacity-0 group-hover:opacity-10 transition-opacity"
                      initial={{ scale: 0 }}
                      whileHover={{ scale: 4, opacity: 0.1 }}
                    />
                  </Button>

                  {/* Out of Stock Warning */}
                  {hasOutOfStockItems && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg">
                      <p className="text-sm text-red-600 dark:text-red-400 flex items-start">
                        <Info className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                        Please remove all out-of-stock items from your cart to
                        proceed to checkout.
                      </p>
                    </div>
                  )}

                  {/* Trust elements */}
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <Shield className="w-4 h-4 text-primary" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        Secure Payment
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <Lock className="w-4 h-4 text-primary" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        SSL Encrypted
                      </span>
                    </div>
                  </div>

                  {/* Accepted payment methods */}
                  <div className="mt-6">
                    <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-2">
                      We Accept
                    </p>
                    <div className="flex justify-center gap-2">
                      {/* Payment icons - simplified gray rectangles */}
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="w-12 h-8 rounded-md bg-gray-200 dark:bg-gray-700"
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatedSection>
  );
}
