import { gql } from "@apollo/client";
import { MoneyFragment, ImageFragment } from "../fragments";

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
          ...MoneyFragment
        }
        compareAtPrice {
          ...MoneyFragment
        }
        selectedOptions {
          name
          value
        }
        image {
          ...ImageFragment
        }
        product {
          id
          title
          handle
        }
      }
    }
  }
  ${MoneyFragment}
  ${ImageFragment}
`;
