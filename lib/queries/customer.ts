import { gql } from "@apollo/client";

export const FETCH_CUSTOMER_DATA = gql`
  query getCustomerData(
    $first: Int!
    $after: String!
    $sortKey: OrderSortKeys!
    $reverse: Boolean
    $query: String!
  ) {
    customer {
      id
      displaName
      emailAddress
      imageUrl
      orders(first: $first, after: $after) {
        edges {
          cursor
          node {
            cancelledAt
            cancelReason
            createdAt
            currencyCode
            financialStatus
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
  }
`;
