import { ImageNode, Price } from "./type";

export interface ProductsNode {
  id: string;
  title: string;
  handle: string;
  availableForSale: boolean;
  priceRange: {
    minVariantPrice: Price;
  };
  compareAtPriceRange: {
    minVariantPrice: Price;
  };
  featuredImage: ImageNode;
  totalInventory: number;
  // Add variants field to match BasicProductFragment and CollectionProductNode
  variants: {
    edges: {
      node: {
        id: string;
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
