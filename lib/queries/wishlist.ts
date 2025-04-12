import { gql } from "@apollo/client";
import { ImageFragment, MoneyFragment } from "../fragments";

// Query to fetch details for multiple product variants based on their IDs
export const GET_WISHLIST_ITEMS_DETAILS = gql`
  query getWishlistItemsDetails($ids: [ID!]!, $country: CountryCode!)
  @inContext(country: $country) {
    nodes(ids: $ids) {
      ... on ProductVariant {
        id
        title # Variant title (e.g., "Large / Black")
        availableForSale
        quantityAvailable
        image {
          ...ImageFragment
        }
        price {
          ...MoneyFragment
        }
        compareAtPrice {
          ...MoneyFragment
        }
        product {
          id
          title # Product title
          handle
          description
          seo {
            title
            description
          }
          featuredImage {
            ...ImageFragment
          }
        }
      }
    }
  }
  ${ImageFragment}
  ${MoneyFragment}
`;
