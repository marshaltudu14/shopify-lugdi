import { gql } from "@apollo/client";
import { BasicProductFragment } from "../fragments";

export const GET_PRODUCTS = gql`
  query getProducts(
    $first: Int!
    $query: String
    $sortKey: ProductSortKeys!
    $reverse: Boolean
    $after: String
    $country: CountryCode!
  ) @inContext(country: $country) {
    products(
      first: $first
      query: $query
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
  ${BasicProductFragment}
`;
