export interface ImageNode {
  originalSrc: string;
  altText: string | null;
}

export interface SEO {
  title: string;
  description: string;
}

export interface Price {
  amount: string;
  currencyCode: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable: number;
  selectedOptions: {
    name: string;
    value: string;
  }[];
  price: Price;
  compareAtPrice: Price | null;
}
