import { gql } from "@apollo/client";

export const MoneyFragment = gql`
  fragment MoneyFragment on MoneyV2 {
    amount
    currencyCode
  }
`;

export const ImageFragment = gql`
  fragment ImageFragment on Image {
    url
    altText
  }
`;

// Fragment for basic product details used in cards/listings
export const BasicProductFragment = gql`
  fragment BasicProductFragment on Product {
    id
    title
    handle
    availableForSale
    totalInventory
    featuredImage {
      ...ImageFragment
    }
    compareAtPriceRange {
      minVariantPrice {
        ...MoneyFragment
      }
    }
    priceRange {
      minVariantPrice {
        ...MoneyFragment
      }
    }
  }
  ${ImageFragment}
  ${MoneyFragment}
`;
