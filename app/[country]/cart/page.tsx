"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";
import { useCart } from "./CartContext";

export default function CartPage() {
  const { cart, removeFromCart, updateCartItem, getCart } = useCart();

  useEffect(() => {
    getCart();
  }, [getCart]);

  if (!cart.cartId) return <p>Your cart is empty.</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
      {cart.items.map((item) => (
        <div key={item.lineId} className="flex justify-between mb-2">
          <span>{item.variantId}</span>{" "}
          {/* Replace with actual product details from GET_CART */}
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={item.quantity}
              onChange={(e) =>
                updateCartItem(item.lineId!, parseInt(e.target.value) || 1)
              }
              min={1}
              className="w-16"
            />
            <Button
              variant="destructive"
              onClick={() => removeFromCart(item.lineId!)}
            >
              Remove
            </Button>
          </div>
        </div>
      ))}
      <p>Total Items: {cart.itemCount}</p>
      {cart.checkoutUrl && (
        <Button asChild>
          <a href={cart.checkoutUrl}>Proceed to Checkout</a>
        </Button>
      )}
    </div>
  );
}
