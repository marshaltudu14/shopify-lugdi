import { gql } from "@apollo/client";

export const GET_CART_VARIANTS = gql`
  query getCartVariants($ids: [ID!]!, $country: CountryCode!)
  @inContext(country: $country) {
    nodes(ids: $ids) {
      ... on ProductVariant {
        id
        title
        availableForSale
        quantityAvailable
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
        selectedOptions {
          name
          value
        }
        image {
          url
          altText
        }
        product {
          id
          title
          handle
        }
      }
    }
  }
`;
