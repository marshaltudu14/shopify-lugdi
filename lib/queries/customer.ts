import { gql } from "@apollo/client";

export const FETCH_CUSTOMER_ORDER_DATA = gql`
  query getCustomerData(
    $first: Int
    $after: String
    $sortKey: OrderSortKeys
    $reverse: Boolean
    $query: String
    $lineItemsFirst: Int
    $lineItemsAfter: String
    $fulfillmentsFirst: Int
    $fulfillmentsAfter: String
    $fulfillmentLineItemsFirst: Int
    $fulfillmentLineItemsAfter: String
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
            lineItems(first: $lineItemsFirst, after: $lineItemsAfter) {
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
            fulfillments(first: $fulfillmentsFirst, after: $fulfillmentsAfter) {
              edges {
                cursor
                node {
                  id
                  estimatedDeliveryAt
                  latestShipmentStatus
                  status
                  fulfillmentLineItems(
                    first: $fulfillmentLineItemsFirst
                    after: $fulfillmentLineItemsAfter
                  ) {
                    edges {
                      cursor
                      node {
                        id
                        lineItem {
                          id
                          image {
                            url
                            altText
                          }
                          name
                          price {
                            amount
                            currencyCode
                          }
                          quantity
                          totalPrice {
                            amount
                            currencyCode
                          }
                          variantOptions {
                            name
                            value
                          }
                        }
                        quantity
                      }
                    }
                    pageInfo {
                      hasNextPage
                      hasPreviousPage
                      startCursor
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
                hasPreviousPage
                startCursor
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
