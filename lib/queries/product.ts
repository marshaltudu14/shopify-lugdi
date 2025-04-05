import { gql } from "@apollo/client";
import { MoneyFragment, ImageFragment } from "../fragments";

export const GET_SINGLE_PRODUCT = gql`
  query getSingleProduct($handle: String!, $country: CountryCode!)
  @inContext(country: $country) {
    product(handle: $handle) {
      id
      title
      availableForSale
      description
      descriptionHtml
      handle
      productType # Added productType
      totalInventory
      tags
      featuredImage { # Added featuredImage
        ...ImageFragment
      }
      images(first: 20) {
        edges {
          cursor
          node {
            ...ImageFragment
          }
        }
      }
      options {
        id
        name
        optionValues {
          id
          name
          swatch {
            color
            image {
              alt
              id
              mediaContentType
              previewImage {
                altText
                url
              }
            }
          }
        }
      }
      variants(first: 250) {
        edges {
          cursor
          node {
            id
            title
            availableForSale
            quantityAvailable
            taxable
            currentlyNotInStock
            selectedOptions {
              name
              value
            }
            image {
              ...ImageFragment
            }
            price {
              ...MoneyFragment
            }
            compareAtPrice {
              ...MoneyFragment
            }
          }
        }
      }
      seo {
        title
        description
      }
    }
  }
  ${ImageFragment}
  ${MoneyFragment}
`;

export const GET_SINGLE_PRODUCT_RECOMMENDATION = gql`
  query getSingleProductRecommendation(
    $productHandle: String!
    $country: CountryCode!
  ) @inContext(country: $country) {
    productRecommendations(productHandle: $productHandle) {
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
  }
  ${ImageFragment}
  ${MoneyFragment}
`;
