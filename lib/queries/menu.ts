import { gql } from "@apollo/client";
import { Menu } from "../types/menu";

export const GET_MENU = gql`
  query GetMenu($handle: String!) {
    menu(handle: $handle) {
      items {
        title
        url
      }
    }
  }
`;

export type GetMenuResponse = {
  menu: Menu;
};
