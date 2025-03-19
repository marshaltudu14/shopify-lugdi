import { ImageNode, Price, SEO } from "./type";

export interface CollectionProductNode {
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
}

export interface CollectionProductEdge {
  cursor: string;
  node: CollectionProductNode;
}

export interface CollectionPageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface CollectionNode {
  id: string;
  title: string;
  seo: SEO;
  image: ImageNode;
  products: {
    edges: CollectionProductEdge[];
    pageInfo: CollectionPageInfo;
  };
}

export interface CollectionData {
  collection: CollectionNode | null;
}

export interface CollectionVariables {
  handle: string;
  first: number;
  sortKey: string;
  reverse?: boolean;
  after?: string;
  country: string;
}
