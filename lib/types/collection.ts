import { Image, ProductVariant, SEO } from "./type";

export interface CollectionProductNode {
  id: string;
  title: string;
  handle: string;
  images: {
    edges: {
      node: Image;
    }[];
  };
  variants: {
    edges: {
      node: ProductVariant;
    }[];
  };
}

export interface CollectionProductEdge {
  node: CollectionProductNode;
  cursor: string;
}

export interface CollectionPageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface CollectionNode {
  id: string;
  title: string;
  seo: SEO;
  image: Image;
  products: {
    edges: CollectionProductEdge[];
    pageInfo: CollectionPageInfo;
  };
}

export interface CollectionData {
  collectionByHandle: CollectionNode | null;
}

export interface CollectionVariables {
  handle: string;
  first: number;
  sortKey: string;
  reverse?: boolean;
  after?: string;
  country: string;
}
