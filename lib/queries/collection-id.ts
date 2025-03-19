import { gql } from "@apollo/client";

export const GET_COLLECTION_ID_BY_HANDLE = gql`
  query getCollectionIdByHandle($query: String!) {
    collections(first: 1, query: $query) {
      edges {
        node {
          id
          title
        }
      }
    }
  }
`;
