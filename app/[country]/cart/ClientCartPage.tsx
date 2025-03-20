"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Loader2, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart } from "./CartContext";
import {
  AnimatedSection,
  buttonHoverVariants,
  iconVariants,
  itemVariants,
} from "@/app/components/FramerMotion";
import { toast } from "sonner";

export default function CartPage() {
  const { cart, removeFromCart, updateCartItem, getCart } = useCart();
  const [loadingItems, setLoadingItems] = useState<{ [key: string]: boolean }>(
    {}
  ); // Track loading state per item

  useEffect(() => {
    getCart();
  }, [getCart]);

  if (!cart.cartId) {
    return (
      <AnimatedSection delay={0.2}>
        <div className="flex flex-col items-center justify-center h-screen py-24 text-center">
          <motion.div variants={iconVariants} className="mb-8 p-6 rounded-full">
            <ShoppingCart className="w-16 h-16" />
          </motion.div>
          <motion.div variants={itemVariants} className="space-y-4 max-w-md">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Your Cart is Empty
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Discover our latest collection and fill your cart with style
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
              <Button size="lg" className="px-8 py-6 text-lg">
                Start Shopping
              </Button>
            </Link>
          </motion.div>
        </div>
      </AnimatedSection>
    );
  }

  const cartItems = cart.items.map((item) => ({
    lineId: item.lineId,
    variantId: item.variantId,
    quantity: item.quantity,
    title: item.merchandise?.title || "Unknown Product",
    image: item.merchandise?.image?.url || null,
    price: parseFloat(item.merchandise?.price.amount || "0"),
    compareAtPrice: item.merchandise?.compareAtPrice?.amount
      ? parseFloat(item.merchandise.compareAtPrice.amount)
      : null,
    currencyCode: item.merchandise?.price.currencyCode || "USD",
    availableForSale: item.merchandise?.availableForSale ?? true,
    selectedOptions: item.merchandise?.selectedOptions || [],
  }));

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const currency = cartItems[0]?.currencyCode || "USD";
  const hasOutOfStockItems = cartItems.some((item) => !item.availableForSale);

  const handleQuantityChange = async (lineId: string, value: string) => {
    const newQuantity = parseInt(value) || 1;
    setLoadingItems((prev) => ({ ...prev, [lineId]: true }));
    try {
      await updateCartItem(lineId, newQuantity);
      toast.success("Quantity updated successfully!");
    } catch (error) {
      toast.error("Failed to update quantity.");
    } finally {
      setLoadingItems((prev) => ({ ...prev, [lineId]: false }));
    }
  };

  const handleRemoveItem = async (lineId: string) => {
    setLoadingItems((prev) => ({ ...prev, [lineId]: true }));
    try {
      await removeFromCart(lineId);
      toast.success("Item removed from cart!");
    } catch (error) {
      toast.error("Failed to remove item.");
    } finally {
      setLoadingItems((prev) => ({ ...prev, [lineId]: false }));
    }
  };

  return (
    <AnimatedSection delay={0.2}>
      <div className="min-h-screen max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-12">
        {/* Checkout Progress Indicator */}
        <div className="flex justify-center items-center mb-10">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-white dark:text-black font-bold shadow-lg">
                1
              </div>
              <span className="ml-3 font-semibold text-gray-800 dark:text-gray-200">
                Cart
              </span>
            </div>
            <div className="w-16 h-1 bg-gray-300 dark:bg-gray-600"></div>
            <div className="flex items-center">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-300 dark:bg-gray-700 text-gray-100 font-bold shadow-lg">
                2
              </div>
              <span className="ml-3 font-semibold text-gray-500 dark:text-gray-400">
                Checkout
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items Section */}
          <div className="lg:flex-2 w-full lg:w-2/3 space-y-6">
            <div className="w-full border-t mb-[30px] bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
                {cart.itemCount} Items in Cart
              </h2>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {cartItems.map((item) => (
                  <motion.div
                    key={item.lineId}
                    variants={itemVariants}
                    className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-4"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-[2/3] w-1/2 sm:w-32 h-50 mx-auto rounded-lg overflow-hidden shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-700" />
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 flex flex-col justify-between w-full">
                      <div className="space-y-2">
                        <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                          {item.title}
                        </span>
                        <div className="flex items-center gap-3 flex-wrap">
                          {item.compareAtPrice ? (
                            <>
                              <span className="text-xl font-bold text-primary">
                                {currency} {item.price.toFixed(2)}
                              </span>
                              <span className="text-gray-500 line-through dark:text-gray-400">
                                {currency} {item.compareAtPrice.toFixed(2)}
                              </span>
                              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-md dark:bg-green-900/50 dark:text-green-400">
                                {(
                                  ((item.compareAtPrice - item.price) /
                                    item.compareAtPrice) *
                                  100
                                ).toFixed(0)}
                                % OFF
                              </span>
                            </>
                          ) : (
                            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                              {currency} {item.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity and Actions */}
                      <div className="flex items-center justify-between mt-4 gap-4">
                        <div className="flex items-center gap-4">
                          <span className="text-gray-600 dark:text-gray-400">
                            Quantity:
                          </span>
                          {loadingItems[item.lineId] ? (
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                          ) : (
                            <Select
                              onValueChange={(value) =>
                                handleQuantityChange(item.lineId, value)
                              }
                              defaultValue={item.quantity.toString()}
                              disabled={loadingItems[item.lineId]}
                            >
                              <SelectTrigger className="w-24 h-10 rounded-md border-gray-200 dark:border-gray-700">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  {Array.from(
                                    { length: 10 },
                                    (_, i) => i + 1
                                  ).map((num) => (
                                    <SelectItem
                                      key={num}
                                      value={num.toString()}
                                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                      {num}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(item.lineId)}
                          className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500"
                          disabled={loadingItems[item.lineId]}
                        >
                          {loadingItems[item.lineId] ? (
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </Button>
                      </div>

                      {/* Selected Variants */}
                      {item.selectedOptions.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex flex-wrap gap-4">
                            {item.selectedOptions.map((option) => (
                              <div
                                key={option.name}
                                className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-md text-sm break-words"
                              >
                                <span className="text-gray-600 dark:text-gray-300">
                                  {option.name}:
                                </span>
                                <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">
                                  {option.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Out of Stock Warning */}
                      {!item.availableForSale && (
                        <p className="text-red-600 dark:text-red-400 mt-2">
                          This item is out of stock. Please remove it to proceed
                          to checkout.
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary Section */}
          <div className="lg:flex-1 w-full lg:w-1/3">
            <motion.div
              variants={itemVariants}
              className="w-full border-t mb-[30px] bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 rounded-xl p-6 h-fit sticky top-6 shadow-md"
            >
              <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
                Order Summary
              </h2>
              <div className="space-y-2 mb-6">
                {cartItems.map((item) => (
                  <div
                    key={item.lineId}
                    className="flex justify-between items-center gap-5"
                  >
                    <span className="flex-1 text-sm text-gray-600 dark:text-gray-400 truncate">
                      {item.title} x {item.quantity}
                    </span>
                    <span className="flex-shrink-0 font-medium text-gray-900 dark:text-gray-100 text-sm whitespace-nowrap">
                      {currency} {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      Subtotal:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {currency} {subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      Shipping:
                    </span>
                    <span className="text-gray-900 dark:text-gray-100">
                      Calculated at checkout
                    </span>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                      Total:
                    </span>
                    <span className="font-bold text-xl text-primary">
                      {currency} {subtotal.toFixed(2)}
                    </span>
                  </div>
                  <motion.div
                    variants={buttonHoverVariants}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      className="w-full h-12 text-lg"
                      disabled={hasOutOfStockItems}
                      asChild={!hasOutOfStockItems}
                    >
                      {hasOutOfStockItems ? (
                        <span>Remove out-of-stock items to proceed</span>
                      ) : (
                        <a href={cart.checkoutUrl}>Proceed to Checkout</a>
                      )}
                    </Button>
                  </motion.div>
                  <p className="mt-4 text-sm text-center text-gray-500 dark:text-gray-400">
                    Secure SSL encryption & protected payment options
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
