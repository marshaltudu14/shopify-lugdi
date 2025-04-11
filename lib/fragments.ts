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
    description
    seo {
      title
      description
    }
    options {
      id
      name
      values
    }
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
    # Fetch details for variants to enable filtering
    variants(first: 10) {
      # Fetch up to 10 variants for filtering options
      edges {
        node {
          id
          availableForSale
          selectedOptions {
            name
            value
          }
        }
      }
    }
  }
  ${ImageFragment}
  ${MoneyFragment}
`;
