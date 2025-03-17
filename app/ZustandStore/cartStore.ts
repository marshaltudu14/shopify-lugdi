import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
  productId: string;
  variantId: string;
  title: string;
  variantTitle: string;
  price: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity: number) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item, quantity) =>
        set((state) => {
          const existingItem = state.items.find(
            (cartItem) => cartItem.variantId === item.variantId
          );
          if (existingItem) {
            return {
              items: state.items.map((cartItem) =>
                cartItem.variantId === item.variantId
                  ? { ...cartItem, quantity: cartItem.quantity + quantity }
                  : cartItem
              ),
            };
          }
          return {
            items: [...state.items, { ...item, quantity }],
          };
        }),
      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.variantId === variantId
              ? { ...item, quantity: Math.max(quantity, 1) }
              : item
          ),
        })),
      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((item) => item.variantId !== variantId),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "lugdi-cart-storage",
    }
  )
);
