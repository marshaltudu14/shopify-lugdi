import { gql } from "@apollo/client";

export const FETCH_CUSTOMER_DATA = gql`
  query getCustomerData(
    $first: Int
    $after: String
    $sortKey: OrderSortKeys
    $reverse: Boolean
    $query: String
  ) {
    customer {
      id
      displayName
      emailAddress {
        emailAddress
        marketingState
      }
      orders(
        first: $first
        after: $after
        sortKey: $sortKey
        reverse: $reverse
        query: $query
      ) {
        edges {
          cursor
          node {
            id
            name
            createdAt
            cancelledAt
            cancelReason
            currencyCode
            customerLocale
            financialStatus
            processedAt
            totalPrice {
              amount
              currencyCode
            }
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
