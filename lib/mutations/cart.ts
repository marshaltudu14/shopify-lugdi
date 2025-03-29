import { gql } from "@apollo/client";
import { MoneyFragment, ImageFragment } from "../fragments";

export const CART_FRAGMENT = gql`
  fragment CartDetails on Cart {
    id
    checkoutUrl
    cost {
      subtotalAmount {
        ...MoneyFragment
      }
      totalAmount {
        ...MoneyFragment
      }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          cost {
            amountPerQuantity {
              ...MoneyFragment
            }
            compareAtAmountPerQuantity {
              ...MoneyFragment
            }
            totalAmount {
              ...MoneyFragment
            }
          }
          merchandise {
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
              image {
                ...ImageFragment
              }
              selectedOptions {
                name
                value
              }
              product {
                handle
                title
              }
            }
          }
        }
      }
    }
    totalQuantity
  }
  ${MoneyFragment}
  ${ImageFragment}
`;

export const CREATE_CART = gql`
  mutation CreateCart($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        ...CartDetails
      }
    }
  }
  ${CART_FRAGMENT}
`;

export const ADD_TO_CART = gql`
  mutation AddToCart($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartDetails
      }
    }
  }
  ${CART_FRAGMENT}
`;

export const REMOVE_FROM_CART = gql`
  mutation RemoveFromCart($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartDetails
      }
    }
  }
  ${CART_FRAGMENT}
`;

export const UPDATE_CART_ITEMS = gql`
  mutation UpdateCartItems($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartDetails
      }
    }
  }
  ${CART_FRAGMENT}
`;

export const GET_CART = gql`
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      ...CartDetails
    }
  }
  ${CART_FRAGMENT}
`;
