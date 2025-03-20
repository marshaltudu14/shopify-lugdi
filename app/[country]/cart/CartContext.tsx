"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useApolloClient } from "@apollo/client";
import {
  CREATE_CART,
  ADD_TO_CART,
  REMOVE_FROM_CART,
  UPDATE_CART_ITEMS,
  GET_CART,
} from "@/lib/mutations/cart";
import { toast } from "sonner";
import * as CryptoJS from "crypto-js";

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
  merchandise?: {
    title: string;
    image?: { url: string; altText?: string };
    price: { amount: string; currencyCode: string };
    compareAtPrice?: { amount: string; currencyCode: string } | null;
    availableForSale: boolean;
    selectedOptions: { name: string; value: string }[];
  };
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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "lugdi_shopify_cart_v42"; // More robust storage key
const ENCRYPTION_KEY =
  process.env.NEXT_PUBLIC_CART_ENCRYPTION_KEY || "defaultKey"; // Retrieve encryption key from env

function encryptData(data: CartState): string {
  // Explicit type for data
  try {
    const ciphertext = CryptoJS.AES.encrypt(
      JSON.stringify(data),
      ENCRYPTION_KEY
    ).toString();
    return ciphertext;
  } catch (error) {
    console.error("Encryption error:", error);
    return ""; // Or throw the error if you want to handle it higher up
  }
}

function decryptData(ciphertext: string): CartState | null {
  // Explicit return type
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decryptedData as CartState; // Type assertion for return
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const client = useApolloClient();
  const [cart, setCart] = useState<CartState>(() => {
    if (typeof window === "undefined") {
      return { cartId: null, items: [], checkoutUrl: null, itemCount: 0 };
    }
    const storedCartEncrypted = localStorage.getItem(STORAGE_KEY);
    if (storedCartEncrypted) {
      const storedCart = decryptData(storedCartEncrypted);
      return (
        storedCart || {
          cartId: null,
          items: [],
          checkoutUrl: null,
          itemCount: 0,
        }
      );
    }
    return { cartId: null, items: [], checkoutUrl: null, itemCount: 0 };
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const getCart = useCallback(async () => {
    if (!cart.cartId) return;
    try {
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
        const updatedCartState: CartState = {
          cartId: fetchedCart.id,
          items: fetchedCart.lines.edges.map((edge) => ({
            variantId: edge.node.merchandise.id,
            quantity: edge.node.quantity,
            lineId: edge.node.id,
            merchandise: {
              title: edge.node.merchandise.title,
              image: edge.node.merchandise.image,
              price: edge.node.merchandise.price,
              compareAtPrice: edge.node.merchandise.compareAtPrice,
              availableForSale: edge.node.merchandise.availableForSale,
              selectedOptions: edge.node.merchandise.selectedOptions,
            },
          })),
          checkoutUrl: fetchedCart.checkoutUrl,
          itemCount: fetchedCart.totalQuantity,
        };
        setCart(updatedCartState);
      } else {
        setCart({ cartId: null, items: [], checkoutUrl: null, itemCount: 0 });
        if (typeof window !== "undefined") {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Failed to fetch cart.");
    }
  }, [cart.cartId, client, isAuthenticated]);

  useEffect(() => {
    const initializeCart = async () => {
      const response = await fetch("/api/auth/check-auth");
      const data = await response.json();
      setIsAuthenticated(data.authenticated);

      if (typeof window !== "undefined") {
        const storedCartEncrypted = localStorage.getItem(STORAGE_KEY);
        if (storedCartEncrypted) {
          const storedCart = decryptData(storedCartEncrypted);
          const storedCartId = storedCart ? storedCart.cartId : null;

          if (storedCartId) {
            await getCart();
          }
        }
      }
    };
    initializeCart();
  }, [getCart]); // Added getCart to the dependency array

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (cart.cartId) {
        const encryptedCart = encryptData(cart);
        if (encryptedCart) {
          localStorage.setItem(STORAGE_KEY, encryptedCart);
        }
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [cart]);

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
    const newCart = data!.cartCreate.cart;
    const updatedCartState: CartState = {
      cartId: newCart.id,
      items: newCart.lines.edges.map((edge) => ({
        variantId: edge.node.merchandise.id,
        quantity: edge.node.quantity,
        lineId: edge.node.id,
      })),
      checkoutUrl: newCart.checkoutUrl,
      itemCount: newCart.totalQuantity,
    };
    setCart(updatedCartState);
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
        const updatedCartState: CartState = {
          cartId: updatedCart.id,
          items: updatedCart.lines.edges.map((edge) => ({
            variantId: edge.node.merchandise.id,
            quantity: edge.node.quantity,
            lineId: edge.node.id,
          })),
          checkoutUrl: updatedCart.checkoutUrl,
          itemCount: updatedCart.totalQuantity,
        };
        setCart(updatedCartState);
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
      const updatedCartState: CartState = {
        cartId: updatedCart.id,
        items: updatedCart.lines.edges.map((edge) => ({
          variantId: edge.node.merchandise.id,
          quantity: edge.node.quantity,
          lineId: edge.node.id,
        })),
        checkoutUrl: updatedCart.checkoutUrl,
        itemCount: updatedCart.totalQuantity,
      };
      setCart(updatedCartState);
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
      const updatedCartState: CartState = {
        cartId: updatedCart.id,
        items: updatedCart.lines.edges.map((edge) => ({
          variantId: edge.node.merchandise.id,
          quantity: edge.node.quantity,
          lineId: edge.node.id,
          merchandise: {
            title: edge.node.merchandise.title,
            image: edge.node.merchandise.image,
            price: edge.node.merchandise.price,
            compareAtPrice: edge.node.merchandise.compareAtPrice,
            availableForSale: edge.node.merchandise.availableForSale,
            selectedOptions: edge.node.merchandise.selectedOptions,
          },
        })),
        checkoutUrl: updatedCart.checkoutUrl,
        itemCount: updatedCart.totalQuantity,
      };
      setCart(updatedCartState);
      toast.success("Cart updated!");
    } catch (error) {
      console.error("Error updating cart:", error);
      toast.error("Failed to update cart.");
      // Optionally, refetch the cart to ensure consistency
      await getCart();
    }
  };

  const getAccessToken = () => {
    if (typeof window === "undefined") return null;
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("lugdi_shopify_access_token="))
      ?.split("=")[1];
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateCartItem, getCart }}
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
