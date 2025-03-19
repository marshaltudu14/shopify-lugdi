import { gql } from "@apollo/client";

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
      totalInventory
      tags
      images(first: 20) {
        edges {
          cursor
          node {
            url
            altText
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
              url
              altText
            }
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
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
        url
        altText
      }

      compareAtPriceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }

      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
    }
  }
`;
