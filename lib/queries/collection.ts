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
    collection(handle: $handle) {
      id
      title

      image {
        url
        altText
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
            id
            title
            handle
            availableForSale
            totalInventory
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            compareAtPriceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            featuredImage {
              url
              altText
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;
