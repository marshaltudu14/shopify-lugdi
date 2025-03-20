"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useApolloClient } from "@apollo/client";
import {
  CREATE_CART,
  ADD_TO_CART,
  REMOVE_FROM_CART,
  UPDATE_CART_ITEMS,
  GET_CART,
} from "@/lib/mutations/cart";
import { toast } from "sonner";

// Define types based on Shopify Storefront API
interface CartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
  };
}

interface Cart {
  id: string;
  checkoutUrl: string;
  lines: { edges: { node: CartLine }[] };
  totalQuantity: number;
}

interface CartItem {
  variantId: string;
  quantity: number;
  lineId?: string;
}

interface CartState {
  cartId: string | null;
  items: CartItem[];
  checkoutUrl: string | null;
  itemCount: number;
}

interface CartContextType {
  cart: CartState;
  addToCart: (variantId: string, quantity: number) => Promise<void>;
  removeFromCart: (lineId: string) => Promise<void>;
  updateCartItem: (lineId: string, quantity: number) => Promise<void>;
  getCart: () => Promise<void>;
  syncCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const client = useApolloClient();
  const [cart, setCart] = useState<CartState>({
    cartId: null,
    items: [],
    checkoutUrl: null,
    itemCount: 0,
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const response = await fetch("/api/auth/check-auth");
      const data = await response.json();
      setIsAuthenticated(data.authenticated);
      const storedCartId = localStorage.getItem("guestCartId");
      if (storedCartId && !data.authenticated) {
        setCart((prev) => ({ ...prev, cartId: storedCartId }));
        await getCart();
      }
    };
    checkAuth();
  }, []);

  const createCart = async (
    lines: { merchandiseId: string; quantity: number }[]
  ) => {
    const { data } = await client.mutate<{ cartCreate: { cart: Cart } }>({
      mutation: CREATE_CART,
      variables: { input: { lines } },
      context: {
        headers: isAuthenticated
          ? { Authorization: `Bearer ${getAccessToken()}` }
          : {},
      },
    });
    const newCart = data!.cartCreate.cart; // Non-null assertion since we assume success
    setCart({
      cartId: newCart.id,
      items: newCart.lines.edges.map((edge) => ({
        variantId: edge.node.merchandise.id,
        quantity: edge.node.quantity,
        lineId: edge.node.id,
      })),
      checkoutUrl: newCart.checkoutUrl,
      itemCount: newCart.totalQuantity,
    });
    if (!isAuthenticated) {
      localStorage.setItem("guestCartId", newCart.id);
    }
  };

  const addToCart = async (variantId: string, quantity: number) => {
    try {
      if (!cart.cartId) {
        await createCart([{ merchandiseId: variantId, quantity }]);
      } else {
        const { data } = await client.mutate<{ cartLinesAdd: { cart: Cart } }>({
          mutation: ADD_TO_CART,
          variables: {
            cartId: cart.cartId,
            lines: [{ merchandiseId: variantId, quantity }],
          },
          context: {
            headers: isAuthenticated
              ? { Authorization: `Bearer ${getAccessToken()}` }
              : {},
          },
        });
        const updatedCart = data!.cartLinesAdd.cart;
        setCart({
          cartId: updatedCart.id,
          items: updatedCart.lines.edges.map((edge) => ({
            variantId: edge.node.merchandise.id,
            quantity: edge.node.quantity,
            lineId: edge.node.id,
          })),
          checkoutUrl: updatedCart.checkoutUrl,
          itemCount: updatedCart.totalQuantity,
        });
      }
      toast.success("Item added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart.");
    }
  };

  const removeFromCart = async (lineId: string) => {
    try {
      if (!cart.cartId) return;
      const { data } = await client.mutate<{ cartLinesRemove: { cart: Cart } }>(
        {
          mutation: REMOVE_FROM_CART,
          variables: {
            cartId: cart.cartId,
            lineIds: [lineId],
          },
          context: {
            headers: isAuthenticated
              ? { Authorization: `Bearer ${getAccessToken()}` }
              : {},
          },
        }
      );
      const updatedCart = data!.cartLinesRemove.cart;
      setCart({
        cartId: updatedCart.id,
        items: updatedCart.lines.edges.map((edge) => ({
          variantId: edge.node.merchandise.id,
          quantity: edge.node.quantity,
          lineId: edge.node.id,
        })),
        checkoutUrl: updatedCart.checkoutUrl,
        itemCount: updatedCart.totalQuantity,
      });
      toast.success("Item removed from cart!");
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast.error("Failed to remove item from cart.");
    }
  };

  const updateCartItem = async (lineId: string, quantity: number) => {
    try {
      if (!cart.cartId) return;
      const { data } = await client.mutate<{ cartLinesUpdate: { cart: Cart } }>(
        {
          mutation: UPDATE_CART_ITEMS,
          variables: {
            cartId: cart.cartId,
            lines: [{ id: lineId, quantity }],
          },
          context: {
            headers: isAuthenticated
              ? { Authorization: `Bearer ${getAccessToken()}` }
              : {},
          },
        }
      );
      const updatedCart = data!.cartLinesUpdate.cart;
      setCart({
        cartId: updatedCart.id,
        items: updatedCart.lines.edges.map((edge) => ({
          variantId: edge.node.merchandise.id,
          quantity: edge.node.quantity,
          lineId: edge.node.id,
        })),
        checkoutUrl: updatedCart.checkoutUrl,
        itemCount: updatedCart.totalQuantity,
      });
      toast.success("Cart updated!");
    } catch (error) {
      console.error("Error updating cart:", error);
      toast.error("Failed to update cart.");
    }
  };

  const getCart = async () => {
    if (!cart.cartId) return;
    const { data } = await client.query<{ cart: Cart | null }>({
      query: GET_CART,
      variables: { cartId: cart.cartId },
      context: {
        headers: isAuthenticated
          ? { Authorization: `Bearer ${getAccessToken()}` }
          : {},
      },
    });
    const fetchedCart = data.cart;
    if (fetchedCart) {
      setCart({
        cartId: fetchedCart.id,
        items: fetchedCart.lines.edges.map((edge) => ({
          variantId: edge.node.merchandise.id,
          quantity: edge.node.quantity,
          lineId: edge.node.id,
        })),
        checkoutUrl: fetchedCart.checkoutUrl,
        itemCount: fetchedCart.totalQuantity,
      });
    }
  };

  const syncCart = async () => {
    if (!isAuthenticated || !cart.cartId) return;
    const guestCartId = localStorage.getItem("guestCartId");
    if (guestCartId && guestCartId !== cart.cartId) {
      const { data } = await client.query<{ cart: Cart | null }>({
        query: GET_CART,
        variables: { cartId: guestCartId },
      });
      const guestItems =
        data.cart?.lines.edges.map((edge) => ({
          merchandiseId: edge.node.merchandise.id,
          quantity: edge.node.quantity,
        })) || [];

      if (guestItems.length > 0) {
        if (!cart.cartId) {
          await createCart(guestItems);
        } else {
          await client.mutate<{ cartLinesAdd: { cart: Cart } }>({
            mutation: ADD_TO_CART,
            variables: { cartId: cart.cartId, lines: guestItems },
            context: {
              headers: { Authorization: `Bearer ${getAccessToken()}` },
            },
          });
        }
        localStorage.removeItem("guestCartId");
      }
    }
    await getCart();
  };

  const getAccessToken = () => {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("lugdi_shopify_access_token="))
      ?.split("=")[1];
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateCartItem,
        getCart,
        syncCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
