import { gql } from "@apollo/client";
import { MoneyFragment, ImageFragment } from "../fragments";

export const GET_CART_VARIANTS = gql`
  query getCartVariants($ids: [ID!]!, $country: CountryCode!)
  @inContext(country: $country) {
    nodes(ids: $ids) {
      ... on ProductVariant {
        id
        title
        availableForSale
        quantityAvailable
        price {
          ...MoneyFragment
        }
        compareAtPrice {
          ...MoneyFragment
        }
        selectedOptions {
          name
          value
        }
        image {
          ...ImageFragment
        }
        product {
          id
          title
          handle
        }
      }
    }
  }
  ${MoneyFragment}
  ${ImageFragment}
`;

// Query to fetch the entire cart object by ID
export const GET_CART = gql`
  query getCart($cartId: ID!, $country: CountryCode!)
  @inContext(country: $country) {
    cart(id: $cartId) {
      id
      checkoutUrl
      cost {
        subtotalAmount {
          ...MoneyFragment
        }
        totalAmount {
          ...MoneyFragment
        }
        totalTaxAmount {
          ...MoneyFragment
        }
        totalDutyAmount {
          ...MoneyFragment
        }
      }
      lines(first: 100) {
        edges {
          node {
            id
            quantity
            cost {
              totalAmount {
                ...MoneyFragment
              }
              compareAtAmountPerQuantity {
                ...MoneyFragment
              }
            }
            merchandise {
              ... on ProductVariant {
                id
                title
                availableForSale
                selectedOptions {
                  name
                  value
                }
                image {
                  ...ImageFragment
                }
                product {
                  id
                  title
                  handle
                }
                price {
                  ...MoneyFragment
                }
                compareAtPrice {
                  ...MoneyFragment
                }
              }
            }
          }
        }
      }
      # Fetch applied discount codes
      discountCodes {
        applicable # Indicates if the code is valid for the cart
        code
      }
      # buyerIdentity { # Optional: Include if needed later
      #   countryCode
      #   email
      #   phone
      # }
    }
  }
  ${MoneyFragment}
  ${ImageFragment}
`;
