import { ImageNode, Price, SEO } from "./type";

// Swatch related types
export interface SwatchImage {
  alt: string | null;
  id: string;
  mediaContentType: string;
  previewImage: {
    altText: string | null;
    url: string;
  };
}

export interface Swatch {
  color: string | null;
  image: SwatchImage | null;
}

// Product Variant related types
export interface SelectedOption {
  name: string;
  value: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable: number;
  taxable: boolean;
  currentlyNotInStock: boolean;
  selectedOptions: SelectedOption[];
  image: ImageNode | null;
  price: Price;
  compareAtPrice: Price | null;
  // Added nested product field as returned by wishlist query
  product: {
    id: string;
    title: string;
    handle: string;
    featuredImage?: ImageNode | null; // Ensure featuredImage is included
  };
}

// Product Option related types
export interface OptionValue {
  id: string;
  name: string;
  swatch: Swatch | null;
}

export interface ProductOption {
  id: string;
  name: string;
  optionValues: OptionValue[];
}

// Price Range for Recommendations
export interface PriceRange {
  minVariantPrice: Price;
}

// Main Product interface for GET_SINGLE_PRODUCT
export interface ProductByHandle {
  id: string;
  title: string;
  availableForSale: boolean;
  description: string;
  descriptionHtml: string;
  handle: string;
  totalInventory: number;
  tags: string[];
  images: {
    edges: {
      cursor: string;
      node: ImageNode;
    }[];
  };
  options: ProductOption[];
  variants: {
    edges: {
      cursor: string;
      node: ProductVariant;
    }[];
  };
  seo: SEO;
}

// Response type for GET_SINGLE_PRODUCT
export interface GetSingleProductResponse {
  product: ProductByHandle;
}

// Product Recommendation interface for SINGLE_PRODUCT_RECOMMENDATION
export interface ProductRecommendation {
  id: string;
  title: string;
  handle: string;
  availableForSale: boolean;
  totalInventory: number;
  featuredImage: ImageNode;
  compareAtPriceRange: PriceRange;
  priceRange: PriceRange;
  options: {
    id: string;
    name: string;
    values: string[];
  }[];
  // Updated variants field for filtering
  variants: {
    edges: {
      node: {
        id: string;
        availableForSale: boolean;
        selectedOptions: SelectedOption[];
      };
    }[];
  };
}

// Response type for SINGLE_PRODUCT_RECOMMENDATION
export interface GetSingleProductRecommendationResponse {
  productRecommendations: ProductRecommendation[];
}
