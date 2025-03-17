"use client";

import { useCartStore } from "@/app/ZustandStore/cartStore";
import Link from "next/link";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart } = useCartStore(
    (state) => ({
      items: state.items,
      updateQuantity: state.updateQuantity,
      removeItem: state.removeItem,
      clearCart: state.clearCart,
    })
  );

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg font-medium">Your cart is empty.</p>
        <Link href="/" passHref>
          <button className="mt-4 px-6 py-2 bg-primary text-white rounded-md">
            Continue Shopping
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.variantId}
            className="flex justify-between items-center"
          >
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-muted-foreground">
                {item.variantTitle}
              </p>
              <p className="text-primary font-bold">${item.price}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  updateQuantity(item.variantId, item.quantity - 1)
                }
                className="px-2 py-1 border rounded-md"
              >
                -
              </button>
              <span>{item.quantity}</span>
              <button
                onClick={() =>
                  updateQuantity(item.variantId, item.quantity + 1)
                }
                className="px-2 py-1 border rounded-md"
              >
                +
              </button>
              <button
                onClick={() => removeItem(item.variantId)}
                className="text-red-500 hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={clearCart}
          className="px-4 py-2 bg-red-500 text-white rounded-md"
        >
          Clear Cart
        </button>
      </div>
    </div>
  );
}
