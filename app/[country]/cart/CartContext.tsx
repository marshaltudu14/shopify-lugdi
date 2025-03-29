// CartContext.tsx
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
import { getCookie } from "@/utils/CookieUtils";
import LugdiUtils from "@/utils/LugdiUtils";

interface CartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    image?: { url: string; altText?: string };
    price: { amount: string; currencyCode: string };
    compareAtPrice?: { amount: string; currencyCode: string } | null;
    availableForSale: boolean;
    quantityAvailable: number;
    selectedOptions: { name: string; value: string }[];
    product: { handle: string; title: string };
  };
}

interface Cart {
  id: string;
  checkoutUrl: string;
  cost: {
    subtotalAmount: { amount: string; currencyCode: string };
    totalAmount: { amount: string; currencyCode: string };
  };
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
    quantityAvailable?: number;
    selectedOptions: { name: string; value: string }[];
    product?: { handle: string; title: string };
  };
}

interface CartState {
  cartId: string | null;
  items: CartItem[];
  checkoutUrl: string | null;
  itemCount: number;
  subtotalAmount: { amount: string; currencyCode: string } | null;
  totalAmount: { amount: string; currencyCode: string } | null;
}

interface CartContextType {
  cart: CartState;
  addToCart: (variantId: string, quantity: number) => Promise<void>;
  removeFromCart: (lineId: string) => Promise<void>;
  updateCartItem: (lineId: string, quantity: number) => Promise<void>;
  getCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = `lugdi_shopify_cart_v42_${getCookie(
  LugdiUtils.location_name_country_cookie
)}`;
const ENCRYPTION_KEY =
  process.env.NEXT_PUBLIC_CART_ENCRYPTION_KEY || "defaultKey";

function encryptData(data: CartState): string {
  try {
    const ciphertext = CryptoJS.AES.encrypt(
      JSON.stringify(data),
      ENCRYPTION_KEY
    ).toString();
    return ciphertext;
  } catch (error) {
    console.error("Encryption error:", error);
    return "";
  }
}

function decryptData(ciphertext: string): CartState | null {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decryptedData as CartState;
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
      return {
        cartId: null,
        items: [],
        checkoutUrl: null,
        itemCount: 0,
        subtotalAmount: null,
        totalAmount: null,
      };
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
          subtotalAmount: null,
          totalAmount: null,
        }
      );
    }
    return {
      cartId: null,
      items: [],
      checkoutUrl: null,
      itemCount: 0,
      subtotalAmount: null,
      totalAmount: null,
    };
  });

  const getCart = useCallback(async () => {
    if (!cart.cartId) return;
    try {
      const { data } = await client.query<{ cart: Cart | null }>({
        query: GET_CART,
        variables: { cartId: cart.cartId },
        fetchPolicy: "no-cache",
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
              quantityAvailable: edge.node.merchandise.quantityAvailable,
              selectedOptions: edge.node.merchandise.selectedOptions,
              product: {
                handle: edge.node.merchandise.product.handle,
                title: edge.node.merchandise.product.title,
              },
            },
          })),
          checkoutUrl: fetchedCart.checkoutUrl,
          itemCount: fetchedCart.totalQuantity,
          subtotalAmount: fetchedCart.cost.subtotalAmount,
          totalAmount: fetchedCart.cost.totalAmount,
        };
        setCart(updatedCartState);
      } else {
        setCart({
          cartId: null,
          items: [],
          checkoutUrl: null,
          itemCount: 0,
          subtotalAmount: null,
          totalAmount: null,
        });
        if (typeof window !== "undefined") {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Failed to fetch cart.");
    }
  }, [cart.cartId, client]);

  useEffect(() => {
    const initializeCart = async () => {
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
  }, [getCart]);

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

  // Helper function to map API Cart to CartState
  const mapApiCartToState = (apiCart: Cart): CartState => ({
    cartId: apiCart.id,
    items: apiCart.lines.edges.map((edge) => ({
      variantId: edge.node.merchandise.id,
      quantity: edge.node.quantity,
      lineId: edge.node.id,
      merchandise: {
        title: edge.node.merchandise.title,
        image: edge.node.merchandise.image,
        price: edge.node.merchandise.price,
        compareAtPrice: edge.node.merchandise.compareAtPrice,
        availableForSale: edge.node.merchandise.availableForSale,
        quantityAvailable: edge.node.merchandise.quantityAvailable,
        selectedOptions: edge.node.merchandise.selectedOptions,
        product: {
          handle: edge.node.merchandise.product.handle,
          title: edge.node.merchandise.product.title,
        },
      },
    })),
    checkoutUrl: apiCart.checkoutUrl,
    itemCount: apiCart.totalQuantity,
    subtotalAmount: apiCart.cost.subtotalAmount,
    totalAmount: apiCart.cost.totalAmount,
  });

  const createCart = async (
    lines: { merchandiseId: string; quantity: number }[]
  ) => {
    // Get the country code from the cookie and convert to uppercase
    const countryName = getCookie(LugdiUtils.location_cookieName) || "IN"; // Default to "IN" if cookie not found
    const countryCode = countryName.toUpperCase();

    const { data } = await client.mutate<{ cartCreate: { cart: Cart } }>({
      mutation: CREATE_CART,
      variables: {
        input: {
          lines,
          buyerIdentity: {
            countryCode, // Pass the uppercase country code
          },
        },
      },
    });
    const newCart = data?.cartCreate?.cart;
    if (newCart) {
      setCart(mapApiCartToState(newCart));
    } else {
      throw new Error("Failed to create cart: No cart data returned.");
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
        });
        const updatedCart = data?.cartLinesAdd?.cart;
        if (updatedCart) {
          setCart(mapApiCartToState(updatedCart));
        } else {
          throw new Error("Failed to add to cart: No cart data returned.");
        }
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
      const { data } = await client.mutate<{
        cartLinesRemove: { cart: Cart | null };
      }>({
        mutation: REMOVE_FROM_CART,
        variables: {
          cartId: cart.cartId,
          lineIds: [lineId],
        },
      });
      const updatedCart = data?.cartLinesRemove?.cart;
      if (updatedCart) {
        setCart(mapApiCartToState(updatedCart));
        toast.success("Product removed from cart!");
      } else {
        // If cart becomes null (e.g., last item removed), reset state
        setCart({
          cartId: null,
          items: [],
          checkoutUrl: null,
          itemCount: 0,
          subtotalAmount: null,
          totalAmount: null,
        });
        if (typeof window !== "undefined") {
          localStorage.removeItem(STORAGE_KEY);
        }
        toast.success("Cart emptied!");
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast.error("Failed to remove product from cart.");
      // Optionally refetch cart on error to ensure consistency
      // await getCart();
    }
  };

  const updateCartItem = async (lineId: string, quantity: number) => {
    try {
      if (!cart.cartId) return;

      const cartItem = cart.items.find((item) => item.lineId === lineId);
      if (!cartItem || !cartItem.merchandise) {
        throw new Error("Item not found in cart.");
      }

      const availableQuantity = cartItem.merchandise.quantityAvailable ?? 0;
      const MAX_PRODUCT_QUANTITY = 10;

      if (quantity > availableQuantity) {
        throw new Error(`Only ${availableQuantity} items available in stock.`);
      }

      if (quantity > MAX_PRODUCT_QUANTITY) {
        throw new Error(`Maximum allowed quantity is ${MAX_PRODUCT_QUANTITY}.`);
      }

      const { data } = await client.mutate<{
        cartLinesUpdate: { cart: Cart | null };
      }>({
        mutation: UPDATE_CART_ITEMS,
        variables: {
          cartId: cart.cartId,
          lines: [{ id: lineId, quantity }],
        },
      });
      const updatedCart = data?.cartLinesUpdate?.cart;
      if (updatedCart) {
        setCart(mapApiCartToState(updatedCart));
        toast.success("Cart updated successfully!");
      } else {
        throw new Error("Failed to update cart: No cart data returned.");
      }
    } catch (error: unknown) {
      // Use unknown and type guard
      console.error("Error updating cart:", error);
      let errorMessage = "Failed to update cart.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
      // Optionally refetch cart on error to ensure consistency
      // await getCart();
    }
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
