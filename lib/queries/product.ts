import { gql } from "@apollo/client";

export const GET_SINGLE_PRODUCT = gql`
  query getSingleProduct($handle: String!, $country: CountryCode!)
  @inContext(country: $country) {
    productByHandle(handle: $handle) {
      id
      handle
      title
      description
      descriptionHtml
      availableForSale
      seo {
        title
        description
      }
      options {
        id
        name
        values
      }
      priceRange {
        maxVariantPrice {
          amount
          currencyCode
        }
        minVariantPrice {
          amount
          currencyCode
        }
      }
      variants(first: 250) {
        edges {
          node {
            id
            title
            availableForSale
            quantityAvailable
            selectedOptions {
              name
              value
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
      featuredImage {
        originalSrc
        altText
      }
      images(first: 20) {
        edges {
          node {
            originalSrc
            altText
          }
        }
      }
      tags
      updatedAt
    }
  }
`;
