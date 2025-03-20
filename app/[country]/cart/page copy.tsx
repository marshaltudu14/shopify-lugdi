"use client";

import React, { useEffect } from "react";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "./CartContext";

const CartPage: React.FC = () => {
  const { cart, getCart, updateCartItem, removeFromCart } = useCart();
  const [loadingItems, setLoadingItems] = React.useState<string[]>([]);

  useEffect(() => {
    console.log("Fetching cart on mount...");
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
      console.log(`Successfully updated quantity for lineId: ${lineId}`);
    } catch (error) {
      console.error(`Error updating quantity for lineId: ${lineId}`, error);
      toast.error("Failed to update quantity.");
    } finally {
      setLoadingItems((prev) => prev.filter((id) => id !== lineId));
    }
  };

  const handleRemoveItem = async (lineId: string) => {
    console.log(`Removing item with lineId: ${lineId}`);
    setLoadingItems((prev) => [...prev, lineId]);
    try {
      await removeFromCart(lineId);
      console.log(`Successfully removed item with lineId: ${lineId}`);
    } catch (error) {
      console.error(`Error removing item with lineId: ${lineId}`, error);
      toast.error("Failed to remove item.");
    } finally {
      setLoadingItems((prev) => prev.filter((id) => id !== lineId));
    }
  };

  console.log("Current cart state:", cart);

  if (!cart.cartId && cart.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Your Cart</h1>
      <div className="max-w-4xl mx-auto">
        {cart.items.length === 0 ? (
          <p className="text-center text-gray-600">Your cart is empty.</p>
        ) : (
          <div className="space-y-6">
            {cart.items.map((item) => (
              <div
                key={item.lineId}
                className="flex items-center border-b pb-4"
              >
                {item.merchandise.image?.url && (
                  <div className="w-20 h-20 relative mr-4">
                    <Image
                      src={item.merchandise.image.url}
                      alt={
                        item.merchandise.image.altText || item.merchandise.title
                      }
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                )}

                <div className="flex-1">
                  <h2 className="text-lg font-semibold">
                    {item.merchandise.title}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {item.merchandise.selectedOptions
                      .map((opt) => `${opt.name}: ${opt.value}`)
                      .join(", ")}
                  </p>
                  <p className="text-sm text-gray-600">
                    Price: {item.merchandise.price.amount}{" "}
                    {item.merchandise.price.currencyCode}
                    {item.merchandise.compareAtPrice && (
                      <span className="line-through text-gray-400 ml-2">
                        {item.merchandise.compareAtPrice.amount}{" "}
                        {item.merchandise.compareAtPrice.currencyCode}
                      </span>
                    )}
                  </p>
                  {!item.merchandise.availableForSale && (
                    <p className="text-red-500 text-sm">Out of stock</p>
                  )}
                </div>

                <div className="flex items-center space-x-4 mr-6">
                  <button
                    onClick={() =>
                      handleQuantityChange(item.lineId, item.quantity - 1)
                    }
                    disabled={
                      loadingItems.includes(item.lineId) || item.quantity <= 1
                    }
                    className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="text-lg">{item.quantity}</span>
                  <button
                    onClick={() =>
                      handleQuantityChange(item.lineId, item.quantity + 1)
                    }
                    disabled={
                      loadingItems.includes(item.lineId) ||
                      !item.merchandise.availableForSale
                    }
                    className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => handleRemoveItem(item.lineId)}
                  disabled={loadingItems.includes(item.lineId)}
                  className="text-red-500 hover:text-red-700 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            ))}

            <div className="mt-8 flex justify-between items-center">
              <p className="text-lg">
                Total Items:{" "}
                <span className="font-semibold">{cart.itemCount}</span>
              </p>
              {cart.checkoutUrl && (
                <Link
                  href={cart.checkoutUrl}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Proceed to Checkout
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
