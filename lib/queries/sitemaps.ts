import { gql } from "@apollo/client";

export const GET_ALL_COLLECTIONS = gql`
  query getAllCollections($first: Int!, $after: String, $country: CountryCode!)
  @inContext(country: $country) {
    collections(first: $first, after: $after) {
      edges {
        cursor
        node {
          id
          handle
          updatedAt
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_ALL_PRODUCTS = gql`
  query getAllProducts($first: Int!, $after: String, $country: CountryCode!)
  @inContext(country: $country) {
    products(first: $first, after: $after) {
      edges {
        cursor
        node {
          id
          handle
          updatedAt
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
