import { gql } from "@apollo/client";

export const GET_COLLECTION_PRODUCTS = gql`
  query getCollectionProducts(
    $handle: String!
    $first: Int!
    $sortKey: ProductCollectionSortKeys!
    $reverse: Boolean
    $after: String
    $country: CountryCode!
  ) @inContext(country: $country) {
    collectionByHandle(handle: $handle) {
      id
      title
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
          node {
            id
            title
            handle
            images(first: 1) {
              edges {
                node {
                  originalSrc
                  altText
                }
              }
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  availableForSale
                  quantityAvailable
                  price {
                    amount
                    currencyCode
                  }
                  compareAtPrice {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
          cursor
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;
