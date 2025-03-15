import { Image, Price, ProductVariant, SEO } from "./type";

export interface ProductOption {
  id: string;
  name: string;
  values: string[];
}

export interface PriceRange {
  maxVariantPrice: Price;
  minVariantPrice: Price;
}

export interface ProductVariantEdge {
  node: ProductVariant;
}

export interface ProductImageEdge {
  node: Image;
}

export interface ProductByHandle {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  availableForSale: boolean;
  seo: SEO;
  options: ProductOption[];
  priceRange: PriceRange;
  variants: {
    edges: ProductVariantEdge[];
  };
  featuredImage: Image | null;
  images: {
    edges: ProductImageEdge[];
  };
  tags: string[];
  updatedAt: string;
}

export interface GetSingleProductResponse {
  productByHandle: ProductByHandle;
}
