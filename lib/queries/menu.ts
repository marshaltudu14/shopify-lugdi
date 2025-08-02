import { gql } from "@apollo/client";
import { Menu, MenuItemWithCollection } from "../types/menu";
import { ImageFragment } from "../fragments"; // Correct import name
import mockMenuData from "../mock-data/menu.json"; // Import mock data

export const GET_MENU = gql`
  query GetMenu($handle: String!) {
    menu(handle: $handle) {
      items {
        title
        url
        resource {
          __typename # To check resource type
          ... on Page {
            id     # Fetch ID
            handle # Keep handle just in case, but prioritize ID
          }
          # Add other relevant resource types if needed (e.g., Collection, Product)
        }
      }
    }
  }
`;

// New query to fetch collections linked within a menu
export const GET_COLLECTIONS_BY_MENU = gql`
  ${ImageFragment}
  # Use correct fragment name
  # Include image fragment fields
  query GetCollectionsByMenu($handle: String!) {
    menu(handle: $handle) {
      items {
        title
        url
        resource {
          ... on Collection {
            id
            title
            handle
            image {
              ...ImageFragment
            }
          }
        }
      }
    }
  }
`;

export type GetMenuResponse = {
  menu: Menu;
};

// Type for the new query response
export type GetCollectionsByMenuResponse = {
  menu: {
    items: MenuItemWithCollection[];
  };
};

// Mock function to simulate Apollo Client query
export const initializeApollo = () => {
  return {
    query: async ({ query, variables }: { query: any; variables: any }) => {
      if (query === GET_MENU) {
        return { data: { menu: mockMenuData } };
      }
      // Add other mock data responses as needed
      return { data: {} };
    },
  };
};
