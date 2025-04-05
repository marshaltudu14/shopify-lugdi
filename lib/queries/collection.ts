import { gql } from "@apollo/client";
import { BasicProductFragment, ImageFragment } from "../fragments";

export const GET_COLLECTION_PRODUCTS = gql`
  query getCollectionProducts(
    $handle: String!
    $first: Int!
    $sortKey: ProductCollectionSortKeys!
    $reverse: Boolean
    $after: String
    $country: CountryCode!
  ) @inContext(country: $country) {
    collection(handle: $handle) {
      id
      title
      description # Added collection description

      image {
        ...ImageFragment
      }

      seo {
        title
        description
      }

      products(
        first: $first
        sortKey: $sortKey
        reverse: $reverse
        after: $after
      ) {
        edges {
          cursor
          node {
            ...BasicProductFragment
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
  ${BasicProductFragment}
  ${ImageFragment}
`;
