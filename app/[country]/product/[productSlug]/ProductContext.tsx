import { createContext, useContext } from "react";

type ProductContextType = {
  title: ProductState;
  updateOption: (name: string, value: string) => ProductState;
  updateImage: (Index: string) => ProductState;
};
const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function useProduct() {
  const context = useContext(ProductContext);

  if (context === undefined) {
    throw new Error("useProduct must be used within a ProductProvider");
  }

  return context;
}
