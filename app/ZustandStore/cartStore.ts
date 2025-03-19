import { create } from "zustand";

interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity: number) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addItem: (item, quantity) => {
    set((state) => {
      const existingItem = state.items.find(
        (i) => i.variantId === item.variantId
      );
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        console.log(
          `Updated cart item: Variant ${item.variantId}, Quantity: ${newQuantity}`
        );
        return {
          items: state.items.map((i) =>
            i.variantId === item.variantId ? { ...i, quantity: newQuantity } : i
          ),
        };
      }
      console.log(
        `Added to cart: Variant ${item.variantId}, Quantity: ${quantity}`
      );
      return { items: [...state.items, { ...item, quantity }] };
    });
  },
  updateQuantity: (variantId, quantity) => {
    set((state) => {
      console.log(`Updated quantity for variant ${variantId} to ${quantity}`);
      return {
        items: state.items.map((item) =>
          item.variantId === variantId ? { ...item, quantity } : item
        ),
      };
    });
  },
  removeItem: (variantId) => {
    set((state) => {
      console.log(`Removed item with variant ${variantId} from cart`);
      return {
        items: state.items.filter((item) => item.variantId !== variantId),
      };
    });
  },
  clearCart: () => {
    set(() => {
      console.log("Cart cleared");
      return { items: [] };
    });
  },
}));
