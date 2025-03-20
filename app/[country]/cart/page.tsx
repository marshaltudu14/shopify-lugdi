"use client";

import React, { useEffect } from "react";
import { useCart } from "./CartContext";
import { toast } from "sonner";
import {
  AnimatedSection,
  buttonHoverVariants,
  iconVariants,
  itemVariants,
} from "@/app/components/FramerMotion";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function ClientCartPage() {
  const { cart, getCart, updateCartItem, removeFromCart } = useCart();
  const [loadingItems, setLoadingItems] = React.useState<string[]>([]);

  useEffect(() => {
    getCart().catch((error) => {
      console.error("Error in getCart on mount:", error);
      toast.error("Failed to load cart.");
    });
  }, [getCart]);

  const handleQuantityChange = async (lineId: string, newQuantity: number) => {
    console.log(`Updating quantity for lineId: ${lineId} to ${newQuantity}`);
    if (newQuantity < 1) {
      toast.error("Quantity must be at least 1.");
      return;
    }

    setLoadingItems((prev) => [...prev, lineId]);
    try {
      await updateCartItem(lineId, newQuantity);
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
    } catch (error) {
      console.error(`Error removing item with lineId: ${lineId}`, error);
      toast.error("Failed to remove item.");
    } finally {
      setLoadingItems((prev) => prev.filter((id) => id !== lineId));
    }
  };

  if (!cart.cartId && cart.items.length === 0) {
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
              <Button size="lg" className="px-8 py-6 text-lg cursor-pointer">
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
      </div>
    </AnimatedSection>
  );
}
