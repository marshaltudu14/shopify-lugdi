import { gql } from "@apollo/client";

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
`;
