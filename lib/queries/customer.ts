import { gql } from "@apollo/client";

export const FETCH_CUSTOMER_ORDER_DATA = gql`
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
            financialStatus
            processedAt
            totalPrice {
              amount
              currencyCode
            }
            lineItems(first: 5, after: null) {
              edges {
                cursor
                node {
                  id
                  name
                  quantity
                  image {
                    url
                    altText
                  }
                  price {
                    amount
                    currencyCode
                  }
                  totalDiscount {
                    amount
                    currencyCode
                  }
                  totalPrice {
                    amount
                    currencyCode
                  }
                  variantOptions {
                    name
                    value
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
            fulfillments(first: 5, after: null) {
              edges {
                cursor
                node {
                  id
                  estimatedDeliveryAt
                  latestShipmentStatus
                  status
                  fulfillmentLineItems(first: 5) {
                    edges {
                      cursor
                      node {
                        id
                        lineItem {
                          id
                          name
                          quantity
                        }
                        quantity
                      }
                    }
                    pageInfo {
                      hasNextPage
                      endCursor
                    }
                  }
                  trackingInformation {
                    company
                    number
                    url
                  }
                  updatedAt
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
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
