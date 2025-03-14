export interface CollectionProductImage {
  originalSrc: string;
  altText: string | null;
}

export interface CollectionProductVariantPrice {
  amount: string;
  currencyCode: string;
}

export interface CollectionProductVariant {
  id: string;
  availableForSale: boolean;
  quantityAvailable: number;
  price: CollectionProductVariantPrice;
  compareAtPrice: CollectionProductVariantPrice | null;
}

export interface CollectionProductNode {
  id: string;
  title: string;
  handle: string;
  images: {
    edges: {
      node: CollectionProductImage;
    }[];
  };
  variants: {
    edges: {
      node: CollectionProductVariant;
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

export interface CollectionSEO {
  title: string;
  description: string;
}

export interface CollectionNode {
  id: string;
  title: string;
  seo: CollectionSEO;
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
