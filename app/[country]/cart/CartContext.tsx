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
import cartVariantsData from "@/lib/mock-data/cartVariants.json";
import { toast } from "sonner";

import { getCookie } from "@/utils/CookieUtils";
import LugdiUtils from "@/utils/LugdiUtils";

// Interface for Cart Line Item (Merchandise details)
interface MockCartLineMerchandise {
  id: string;
  title: string;
  image?: { url: string; altText?: string };
  price: { amount: string; currencyCode: string };
  compareAtPrice?: { amount: string; currencyCode: string } | null;
  availableForSale: boolean;
  quantityAvailable?: number;
  selectedOptions: { name: string; value: string }[];
  product: { handle: string; title: string };
}

interface MockCartItem {
  variantId: string;
  quantity: number;
  lineId: string; // Mock lineId
  merchandise: MockCartLineMerchandise;
}

interface MockCartState {
  cartId: string;
  items: MockCartItem[];
  checkoutUrl: string;
  itemCount: number;
  subtotalAmount: { amount: string; currencyCode: string };
  totalAmount: { amount: string; currencyCode: string };
  totalTaxAmount: { amount: string; currencyCode: string } | null;
  totalDutyAmount: { amount: string; currencyCode: string } | null;
  totalDiscountAmount: { amount: string; currencyCode: string } | null;
  discountCodes: { code: string; applicable: boolean }[];
}

interface CartContextType {
  cart: MockCartState;
  addToCart: (variantId: string, quantity: number) => Promise<void>;
  removeFromCart: (lineId: string) => Promise<void>;
  updateCartItem: (lineId: string, quantity: number) => Promise<void>;
  getCart: () => Promise<void>;
  discountCodeInput: string;
  setDiscountCodeInput: (code: string) => void;
  applyDiscountCode: () => Promise<void>;
  removeDiscountCode: (codeToRemove: string) => Promise<void>;
  discountError: string | null;
  isApplyingDiscount: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = `lugdi_shopify_cart_v42_${getCookie(
  LugdiUtils.location_name_country_cookie
)}`;

// --- Cart Provider Component ---
export const CartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const initializeState = (): MockCartState => {
    const defaultState: MockCartState = {
      cartId: "mock_cart_id",
      items: [],
      checkoutUrl: "/mock-checkout",
      itemCount: 0,
      subtotalAmount: { amount: "0.00", currencyCode: "INR" },
      totalAmount: { amount: "0.00", currencyCode: "INR" },
      totalTaxAmount: null,
      totalDutyAmount: null,
      totalDiscountAmount: null,
      discountCodes: [],
    };

    if (typeof window === "undefined") {
      return defaultState;
    }

    const storedCart = localStorage.getItem(STORAGE_KEY);
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        return parsedCart as MockCartState;
      } catch (error) {
        console.error("Error parsing stored cart data:", error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    return defaultState;
  };

  const [cart, setCart] = useState<MockCartState>(initializeState);
  const [discountCodeInput, setDiscountCodeInput] = useState<string>("");
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState<boolean>(false);

  // Helper function to map mock data to CartState
  const mapMockDataToCartState = (mockItems: MockCartItem[]): MockCartState => {
    let subtotal = 0;
    let totalQuantity = 0;

    mockItems.forEach((item) => {
      subtotal += parseFloat(item.merchandise.price.amount) * item.quantity;
      totalQuantity += item.quantity;
    });

    return {
      cartId: cart.cartId || "mock_cart_id",
      items: mockItems,
      checkoutUrl: cart.checkoutUrl || "/mock-checkout",
      itemCount: totalQuantity,
      subtotalAmount: { amount: subtotal.toFixed(2), currencyCode: "INR" },
      totalAmount: { amount: subtotal.toFixed(2), currencyCode: "INR" },
      totalTaxAmount: null,
      totalDutyAmount: null,
      totalDiscountAmount: null,
      discountCodes: [],
    };
  };

  // Mock getCart function
  const getCart = useCallback(async () => {
    // In a real scenario, you might fetch mock data based on cart.cartId
    // For now, we'll just ensure the state is consistent with current items
    setCart((prevCart) => mapMockDataToCartState(prevCart.items));
  }, []);

  // Effect to initialize cart from storage on load
  useEffect(() => {
    const initializeCartOnLoad = async () => {
      getCart();
    };
    initializeCartOnLoad();
  }, [getCart]);

  // Effect to save cart to localStorage on change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart]);

  // Mock createCart function
  const createCart = async (
    lines: { merchandiseId: string; quantity: number }[]
  ): Promise<MockCartState> => {
    const newItems: MockCartItem[] = [];
    lines.forEach((line) => {
      const productVariant = cartVariantsData.find(
        (p) => p.id === line.merchandiseId
      );
      if (productVariant) {
        newItems.push({
          variantId: line.merchandiseId,
          quantity: line.quantity,
          lineId: `mock_line_${Date.now()}_${Math.random()}`,
          merchandise: {
            id: productVariant.id,
            title: productVariant.title,
            image: productVariant.image,
            price: productVariant.price,
            compareAtPrice: productVariant.compareAtPrice,
            availableForSale: productVariant.availableForSale,
            quantityAvailable: productVariant.quantityAvailable,
            selectedOptions: productVariant.selectedOptions,
            product: productVariant.product,
          },
        });
      }
    });
    const newCartState = mapMockDataToCartState(newItems);
    setCart(newCartState);
    toast.success("Cart created with item!");
    return newCartState;
  };

  // Mock addToCart function
  const addToCart = async (variantId: string, quantity: number) => {
    const currentItems = [...cart.items];
    const existingItem = currentItems.find(
      (item) => item.variantId === variantId
    );

    if (existingItem) {
      // Update quantity if item already exists
      existingItem.quantity += quantity;
      toast.success("Item quantity updated in cart!");
    } else {
      // Add new item
      const productVariant = cartVariantsData.find((p) => p.id === variantId);
      if (productVariant) {
        currentItems.push({
          variantId,
          quantity,
          lineId: `mock_line_${Date.now()}_${Math.random()}`,
          merchandise: {
            id: productVariant.id,
            title: productVariant.title,
            image: productVariant.image,
            price: productVariant.price,
            compareAtPrice: productVariant.compareAtPrice,
            availableForSale: productVariant.availableForSale,
            quantityAvailable: productVariant.quantityAvailable,
            selectedOptions: productVariant.selectedOptions,
            product: productVariant.product,
          },
        });
        toast.success("Item added to cart!");
      } else {
        toast.error("Product variant not found in mock data.");
      }
    }
    setCart(mapMockDataToCartState(currentItems));
  };

  // Mock removeFromCart function
  const removeFromCart = async (lineId: string) => {
    const updatedItems = cart.items.filter((item) => item.lineId !== lineId);
    setCart(mapMockDataToCartState(updatedItems));
    toast.success("Product removed from cart!");
  };

  // Mock updateCartItem function
  const updateCartItem = async (lineId: string, quantity: number) => {
    const updatedItems = cart.items.map((item) =>
      item.lineId === lineId ? { ...item, quantity } : item
    );
    setCart(mapMockDataToCartState(updatedItems));
    toast.success("Cart updated successfully!");
  };

  // Mock applyDiscountCode function
  const applyDiscountCode = async () => {
    setIsApplyingDiscount(true);
    setDiscountError(null);
    try {
      // For mock data, we'll just simulate success or failure
      if (discountCodeInput.toLowerCase() === "mockdiscount") {
        const newDiscountedAmount = parseFloat(cart.totalAmount.amount) * 0.9; // 10% discount
        setCart({
          ...cart,
          totalAmount: {
            amount: newDiscountedAmount.toFixed(2),
            currencyCode: cart.totalAmount.currencyCode,
          },
          totalDiscountAmount: {
            amount: (parseFloat(cart.totalAmount.amount) * 0.1).toFixed(2),
            currencyCode: cart.totalAmount.currencyCode,
          },
          discountCodes: [{ code: discountCodeInput, applicable: true }],
        });
        toast.success(`Discount code "${discountCodeInput}" applied!`);
        setDiscountCodeInput("");
      } else {
        setDiscountError("Invalid discount code.");
        toast.error("Invalid discount code.");
      }
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  // Mock removeDiscountCode function
  const removeDiscountCode = async (codeToRemove: string) => {
    setIsApplyingDiscount(true);
    setDiscountError(null);
    try {
      setCart({
        ...cart,
        totalAmount: cart.subtotalAmount, // Revert to subtotal
        totalDiscountAmount: null,
        discountCodes: cart.discountCodes.filter(
          (d) => d.code !== codeToRemove
        ),
      });
      toast.success(`Discount code "${codeToRemove}" removed.`);
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const contextValue: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateCartItem,
    getCart,
    discountCodeInput,
    setDiscountCodeInput,
    applyDiscountCode,
    removeDiscountCode,
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
