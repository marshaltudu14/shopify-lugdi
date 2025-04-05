// CartContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode, // Import ReactNode
} from "react";
import { useApolloClient } from "@apollo/client";
import {
  CREATE_CART,
  ADD_TO_CART,
  REMOVE_FROM_CART,
  UPDATE_CART_ITEMS,
  GET_CART,
  CART_DISCOUNT_CODES_UPDATE, // Import discount mutation
} from "@/lib/mutations/cart";
import { toast } from "sonner";
import * as CryptoJS from "crypto-js";
import { getCookie } from "@/utils/CookieUtils";
import LugdiUtils from "@/utils/LugdiUtils";

// Interface for Cart Line Item (Merchandise details)
interface CartLineMerchandise {
  id: string;
  title: string;
  image?: { url: string; altText?: string };
  price: { amount: string; currencyCode: string };
  compareAtPrice?: { amount: string; currencyCode: string } | null;
  availableForSale: boolean;
  quantityAvailable?: number; // Optional based on query
  selectedOptions: { name: string; value: string }[];
  product: { handle: string; title: string };
}

// Interface for Cart Line Node from API
interface CartLineNode {
  id: string;
  quantity: number;
  cost: {
    totalAmount: { amount: string; currencyCode: string };
    compareAtAmountPerQuantity?: {
      amount: string;
      currencyCode: string;
    } | null;
  };
  merchandise: CartLineMerchandise;
}

// Interface for the Cart object from API
interface Cart {
  id: string;
  checkoutUrl: string;
  cost: {
    subtotalAmount: { amount: string; currencyCode: string };
    totalAmount: { amount: string; currencyCode: string };
    totalTaxAmount?: { amount: string; currencyCode: string } | null; // Optional
    totalDutyAmount?: { amount: string; currencyCode: string } | null; // Optional
  };
  // Moved discountAllocations to top level of Cart interface
  discountAllocations?: {
    discountedAmount: { amount: string; currencyCode: string };
  }[];
  lines: { edges: { node: CartLineNode }[] };
  totalQuantity: number;
  discountCodes: {
    // Added discount codes field from API
    applicable: boolean;
    code: string;
  }[];
}

// Interface for Cart Item used in local state
interface CartItem {
  variantId: string;
  quantity: number;
  lineId?: string; // Optional, as it's set after adding
  merchandise?: CartLineMerchandise; // Optional, populated after fetch
}

// Interface for the local Cart State
interface CartState {
  cartId: string | null;
  items: CartItem[];
  checkoutUrl: string | null;
  itemCount: number;
  subtotalAmount: { amount: string; currencyCode: string } | null;
  totalAmount: { amount: string; currencyCode: string } | null;
  totalTaxAmount: { amount: string; currencyCode: string } | null; // Added tax amount
  totalDutyAmount: { amount: string; currencyCode: string } | null; // Added duty amount
  totalDiscountAmount: { amount: string; currencyCode: string } | null; // Added total discount amount
  discountCodes: { code: string; applicable: boolean }[]; // Added discount codes to state
}

// Interface for the Cart Context value
interface CartContextType {
  cart: CartState;
  addToCart: (variantId: string, quantity: number) => Promise<void>;
  removeFromCart: (lineId: string) => Promise<void>;
  updateCartItem: (lineId: string, quantity: number) => Promise<void>;
  getCart: () => Promise<void>;
  discountCodeInput: string; // Added state for input
  setDiscountCodeInput: (code: string) => void; // Added setter for input
  applyDiscountCode: () => Promise<void>; // Added function to apply code
  removeDiscountCode: (codeToRemove: string) => Promise<void>; // Added function to remove code
  discountError: string | null; // Added state for errors
  isApplyingDiscount: boolean; // Added loading state
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = `lugdi_shopify_cart_v42_${getCookie(
  LugdiUtils.location_name_country_cookie
)}`;
const ENCRYPTION_KEY =
  process.env.NEXT_PUBLIC_CART_ENCRYPTION_KEY || "defaultKey";

// --- Encryption/Decryption Functions ---
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
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedString) {
      // Handle empty string case after decryption
      console.error("Decryption resulted in empty string.");
      return null;
    }
    const decryptedData = JSON.parse(decryptedString);
    // Ensure default discountCodes if missing in stored data
    return {
      ...decryptedData,
      discountCodes: decryptedData.discountCodes || [],
    } as CartState;
  } catch (error) {
    console.error("Decryption error:", error);
    // Clear potentially corrupted data
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    return null;
  }
}

// --- Cart Provider Component ---
export const CartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const client = useApolloClient();

  // Initialize state function
  const initializeState = (): CartState => {
    const defaultState: CartState = {
      cartId: null,
      items: [],
      checkoutUrl: null,
      itemCount: 0,
      subtotalAmount: null,
      totalAmount: null,
      totalTaxAmount: null, // Initialize tax
      totalDutyAmount: null, // Initialize duty
      totalDiscountAmount: null, // Initialize total discount
      discountCodes: [], // Initialize discount codes
    };

    if (typeof window === "undefined") {
      return defaultState;
    }

    const storedCartEncrypted = localStorage.getItem(STORAGE_KEY);
    if (storedCartEncrypted) {
      const storedCart = decryptData(storedCartEncrypted);
      // Return stored cart or default if decryption failed
      return storedCart || defaultState;
    }

    return defaultState;
  };

  const [cart, setCart] = useState<CartState>(initializeState);
  const [discountCodeInput, setDiscountCodeInput] = useState<string>("");
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState<boolean>(false);

  // Helper function to map API Cart to CartState
  const mapApiCartToState = (apiCart: Cart): CartState => {
    // Calculate total discount amount from top-level discountAllocations
    const totalDiscountValue = (apiCart.discountAllocations || []).reduce(
      (sum: number, allocation: { discountedAmount: { amount: string } }) => sum + parseFloat(allocation.discountedAmount.amount),
      0
    );
    const totalDiscountAmount =
      totalDiscountValue > 0 && apiCart.cost.subtotalAmount // Ensure currency code exists
        ? {
            amount: totalDiscountValue.toFixed(2),
            currencyCode: apiCart.cost.subtotalAmount.currencyCode,
          }
        : null;

    return {
      cartId: apiCart.id,
      items: apiCart.lines.edges.map((edge: { node: CartLineNode }) => ({ // Add type for edge
        variantId: edge.node.merchandise.id,
        quantity: edge.node.quantity,
        lineId: edge.node.id,
        merchandise: edge.node.merchandise, // Use the full merchandise object
      })),
      checkoutUrl: apiCart.checkoutUrl,
      itemCount: apiCart.totalQuantity,
      subtotalAmount: apiCart.cost.subtotalAmount,
      totalAmount: apiCart.cost.totalAmount,
      totalTaxAmount: apiCart.cost.totalTaxAmount || null, // Map tax amount
      totalDutyAmount: apiCart.cost.totalDutyAmount || null, // Map duty amount
      totalDiscountAmount: totalDiscountAmount, // Map calculated total discount
      discountCodes: apiCart.discountCodes || [], // Ensure discountCodes is always an array
    };
  };


  // Function to fetch cart data from Shopify
  const getCart = useCallback(async () => {
    if (!cart.cartId) return;
    try {
      // Use the GET_CART query defined in mutations file (which uses the fragment)
      const { data } = await client.query<{ cart: Cart | null }>({
        query: GET_CART, // Use the query from mutations/cart.ts
        variables: { cartId: cart.cartId },
        fetchPolicy: "network-only", // Fetch fresh data
      });
      const fetchedCart = data?.cart;
      if (fetchedCart) {
        setCart(mapApiCartToState(fetchedCart));
      } else {
        // Cart doesn't exist on Shopify, reset local state
        setCart(initializeState()); // Reset to default
        if (typeof window !== "undefined") {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Could not retrieve cart details.");
      // Consider resetting local cart if fetch fails critically
      // setCart(initializeState());
      // localStorage.removeItem(STORAGE_KEY);
    }
  }, [cart.cartId, client]); // Removed initializeState from deps

  // Effect to initialize cart from storage or fetch on load
  useEffect(() => {
    const initializeCartOnLoad = async () => {
      if (cart.cartId) {
        await getCart(); // Fetch fresh cart data if ID exists
      }
    };
    initializeCartOnLoad();
    // Run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect to save cart to localStorage on change
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (cart.cartId) {
        const encryptedCart = encryptData(cart);
        if (encryptedCart) {
          localStorage.setItem(STORAGE_KEY, encryptedCart);
        }
      } else {
        // Clear storage if cartId becomes null
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [cart]);

  // Function to create a new cart
  const createCart = async (
    lines: { merchandiseId: string; quantity: number }[]
  ) => {
    const countryName = getCookie(LugdiUtils.location_cookieName) || "IN";
    const countryCode = countryName.toUpperCase();

    try {
      const { data } = await client.mutate<{ cartCreate: { cart: Cart } }>({
        mutation: CREATE_CART,
        variables: {
          input: {
            lines,
            buyerIdentity: { countryCode },
          },
        },
      });
      const newCart = data?.cartCreate?.cart;
      if (newCart) {
        setCart(mapApiCartToState(newCart));
        return newCart; // Return the new cart object
      } else {
        throw new Error("Failed to create cart: No cart data returned.");
      }
    } catch (error) {
      console.error("Error creating cart:", error);
      toast.error("Could not create cart.");
      throw error; // Re-throw error for caller handling
    }
  };

  // Function to add items to the cart
  const addToCart = async (variantId: string, quantity: number) => {
    try {
      let targetCartId = cart.cartId;
      if (!targetCartId) {
        const newCart = await createCart([
          { merchandiseId: variantId, quantity },
        ]);
        targetCartId = newCart.id; // Use the ID from the newly created cart
        // No need to add lines again if cart was just created with the item
        toast.success("Item added to cart!");
        return;
      }

      // If cart already exists, add lines
      const { data } = await client.mutate<{ cartLinesAdd: { cart: Cart } }>({
        mutation: ADD_TO_CART,
        variables: {
          cartId: targetCartId,
          lines: [{ merchandiseId: variantId, quantity }],
        },
      });
      const updatedCart = data?.cartLinesAdd?.cart;
      if (updatedCart) {
        setCart(mapApiCartToState(updatedCart));
        toast.success("Item added to cart!");
      } else {
        throw new Error("Failed to add to cart: No cart data returned.");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart.");
    }
  };

  // Function to remove items from the cart
  const removeFromCart = async (lineId: string) => {
    if (!cart.cartId) return;
    try {
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
        // Cart is now empty or doesn't exist
        setCart(initializeState()); // Reset to default empty state
        toast.success("Cart emptied!");
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast.error("Failed to remove product from cart.");
    }
  };

  // Function to update item quantity in the cart
  const updateCartItem = async (lineId: string, quantity: number) => {
    if (!cart.cartId) return;

    const cartItem = cart.items.find((item) => item.lineId === lineId);
    if (!cartItem || !cartItem.merchandise) {
      toast.error("Item not found in cart.");
      return;
    }

    const availableQuantity =
      cartItem.merchandise.quantityAvailable ?? Infinity; // Assume available if null/undefined
    const MAX_PRODUCT_QUANTITY = LugdiUtils.maxProductQuantityUserCanAdd; // Use constant

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      await removeFromCart(lineId);
      return;
    }

    if (quantity > availableQuantity) {
      toast.error(`Only ${availableQuantity} items available in stock.`);
      return; // Prevent update
    }

    if (quantity > MAX_PRODUCT_QUANTITY) {
      toast.error(`Maximum allowed quantity is ${MAX_PRODUCT_QUANTITY}.`);
      return; // Prevent update
    }

    try {
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
      console.error("Error updating cart:", error);
      let errorMessage = "Failed to update cart.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    }
  };

  // --- Discount Code Logic ---
  const applyDiscountCode = async () => {
    if (!cart.cartId || !discountCodeInput.trim()) {
      setDiscountError("Please enter a discount code.");
      return;
    }

    setIsApplyingDiscount(true);
    setDiscountError(null);

    try {
      const { data } = await client.mutate<{
        cartDiscountCodesUpdate: {
          cart: Cart | null;
          userErrors: { field: string[]; message: string }[];
        };
      }>({
        mutation: CART_DISCOUNT_CODES_UPDATE,
        variables: {
          cartId: cart.cartId,
          discountCodes: [discountCodeInput.trim()], // Send as array
        },
      });

      const updatedCart = data?.cartDiscountCodesUpdate?.cart;
      const userErrors = data?.cartDiscountCodesUpdate?.userErrors;

      if (userErrors && userErrors.length > 0) {
        // Handle errors reported by Shopify API
        const errorMessage = userErrors[0].message;
        setDiscountError(errorMessage);
        toast.error(`Discount Error: ${errorMessage}`);
        // Optionally refetch cart to ensure state consistency if mutation partially failed
        await getCart();
      } else if (updatedCart) {
        // Success! Update cart state and clear input/error
        setCart(mapApiCartToState(updatedCart));
        setDiscountCodeInput(""); // Clear input on success
        toast.success(`Discount code "${discountCodeInput.trim()}" applied!`);
      } else {
        // Handle unexpected null cart response
        throw new Error("Failed to apply discount: No cart data returned.");
      }
    } catch (error) {
      console.error("Error applying discount code:", error);
      const message =
        error instanceof Error ? error.message : "An unknown error occurred.";
      setDiscountError(`Failed to apply discount: ${message}`);
      toast.error(`Failed to apply discount.`);
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  // Function to remove a specific discount code (or all if needed)
  const removeDiscountCode = async (codeToRemove: string) => {
    if (!cart.cartId) return;

    // Filter out the code to remove, keep others
    const remainingCodes = cart.discountCodes
      .filter((d) => d.code !== codeToRemove && d.applicable) // Keep only applicable codes that are not the one being removed
      .map((d) => d.code);

    setIsApplyingDiscount(true); // Reuse loading state for removal
    setDiscountError(null);

    try {
      const { data } = await client.mutate<{
        cartDiscountCodesUpdate: {
          cart: Cart | null;
          userErrors: { field: string[]; message: string }[];
        };
      }>({
        mutation: CART_DISCOUNT_CODES_UPDATE,
        variables: {
          cartId: cart.cartId,
          discountCodes: remainingCodes, // Send the remaining applicable codes
        },
      });

      const updatedCart = data?.cartDiscountCodesUpdate?.cart;
      const userErrors = data?.cartDiscountCodesUpdate?.userErrors;

      if (userErrors && userErrors.length > 0) {
        // This shouldn't ideally happen when just removing, but handle defensively
        const errorMessage = userErrors[0].message;
        setDiscountError(errorMessage);
        toast.error(`Error updating discounts: ${errorMessage}`);
        await getCart(); // Refetch cart on error
      } else if (updatedCart) {
        setCart(mapApiCartToState(updatedCart));
        toast.success(`Discount code "${codeToRemove}" removed.`);
      } else {
        throw new Error("Failed to update discounts: No cart data returned.");
      }
    } catch (error) {
      console.error("Error removing discount code:", error);
      const message =
        error instanceof Error ? error.message : "An unknown error occurred.";
      setDiscountError(`Failed to remove discount: ${message}`);
      toast.error(`Failed to remove discount.`);
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  // --- Context Provider Value ---
  const contextValue: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateCartItem,
    getCart,
    discountCodeInput,
    setDiscountCodeInput,
    applyDiscountCode,
    removeDiscountCode, // Add remove function to context
    discountError,
    isApplyingDiscount,
  };

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};

// --- Custom Hook to use Cart Context ---
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
