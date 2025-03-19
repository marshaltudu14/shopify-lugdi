"use client";
import { useEffect, useState } from "react";
import { useCartStore } from "@/app/ZustandStore/cartStore";
import { useQuery } from "@apollo/client";
import { GET_CART_VARIANTS } from "@/lib/queries/cart";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { getCurrencySymbol } from "@/lib/countries";
import { Trash2 } from "lucide-react";

export default function ClientCartPage({
  countryCode,
}: {
  countryCode: string;
}) {
  const { items, updateQuantity, removeItem, clearCart } = useCartStore();
  const [cartVariants, setCartVariants] = useState<any[]>([]);

  const { data, loading, error } = useQuery(GET_CART_VARIANTS, {
    variables: {
      ids: items.map((item) => item.variantId),
      country: countryCode,
    },
    skip: items.length === 0, // Skip query if cart is empty
  });

  useEffect(() => {
    if (data?.nodes) {
      setCartVariants(data.nodes);
    }
  }, [data]);

  if (loading) return <div>Loading cart...</div>;
  if (error) return <div>Error loading cart: {error.message}</div>;
  if (items.length === 0) return <div>Your cart is empty</div>;

  const total = cartVariants.reduce((sum, variant) => {
    const item = items.find((i) => i.variantId === variant.id);
    return sum + parseFloat(variant.price.amount) * (item?.quantity || 0);
  }, 0);

  return (
    <div className="min-h-screen px-4 py-6 md:px-8 lg:px-20">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      <div className="grid gap-6">
        {cartVariants.map((variant) => {
          const cartItem = items.find((i) => i.variantId === variant.id);
          if (!cartItem) return null;

          const currencySymbol = getCurrencySymbol(variant.price.currencyCode);
          const subtotal = parseFloat(variant.price.amount) * cartItem.quantity;

          return (
            <div
              key={variant.id}
              className="flex flex-col md:flex-row gap-4 border p-4 rounded-md"
            >
              <Image
                src={variant.image?.url || "/placeholder.jpg"}
                alt={variant.product.title}
                width={150}
                height={150}
                className="object-cover rounded-md"
              />
              <div className="flex-1">
                <h2 className="text-xl font-semibold">
                  {variant.product.title}
                </h2>
                <p className="text-muted-foreground">{variant.title}</p>
                <p>
                  {variant.selectedOptions
                    .map((opt: any) => `${opt.name}: ${opt.value}`)
                    .join(", ")}
                </p>
                <p className="mt-2">
                  {currencySymbol}
                  {variant.price.amount} x {cartItem.quantity} ={" "}
                  {currencySymbol}
                  {subtotal.toFixed(2)}
                </p>
                {variant.compareAtPrice && (
                  <p className="text-muted-foreground line-through">
                    {currencySymbol}
                    {variant.compareAtPrice.amount}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      updateQuantity(
                        variant.id,
                        Math.max(1, cartItem.quantity - 1)
                      )
                    }
                  >
                    -
                  </Button>
                  <span>{cartItem.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      updateQuantity(
                        variant.id,
                        Math.min(
                          cartItem.quantity + 1,
                          variant.quantityAvailable
                        )
                      )
                    }
                    disabled={
                      !variant.availableForSale ||
                      cartItem.quantity >= variant.quantityAvailable
                    }
                  >
                    +
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeItem(variant.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                {!variant.availableForSale && (
                  <p className="text-red-600 mt-2">This item is out of stock</p>
                )}
                {variant.quantityAvailable < 5 && variant.availableForSale && (
                  <p className="text-amber-600 mt-2">
                    Only {variant.quantityAvailable} left in stock
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex justify-between items-center">
        <p className="text-xl font-semibold">
          Total:{" "}
          {getCurrencySymbol(cartVariants[0]?.price.currencyCode || "USD")}
          {total.toFixed(2)}
        </p>
        <div className="space-x-4">
          <Button variant="outline" onClick={clearCart}>
            Clear Cart
          </Button>
          <Button disabled={cartVariants.some((v) => !v.availableForSale)}>
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
