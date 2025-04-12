import { ImageNode, Price, SEO } from "./type";

export interface ProductsNode {
  id: string;
  title: string;
  handle: string;
  availableForSale: boolean;
  description: string;
  seo: SEO;
  priceRange: {
    minVariantPrice: Price;
  };
  compareAtPriceRange: {
    minVariantPrice: Price;
  };
  featuredImage: ImageNode;
  totalInventory: number;
  options: {
    id: string;
    name: string;
    values: string[];
  }[];
  variants: {
    edges: {
      node: {
        id: string;
        availableForSale: boolean;
        selectedOptions: {
          name: string;
          value: string;
        }[];
      };
    }[];
  };
}

export interface ProductsEdge {
  cursor: string;
  node: ProductsNode;
}

export interface ProductsPageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface ProductsData {
  products: {
    edges: ProductsEdge[];
    pageInfo: ProductsPageInfo;
  };
}

export interface ProductsVariables {
  first: number;
  after: string;
  query?: string;
  sortKey: string;
  reverse: boolean;
  country: string;
}
