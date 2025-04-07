import { ImageNode } from "../types/type"; // Import ImageNode from the correct shared types file

// Basic menu item structure
export interface MenuItem {
  title: string;
  url: string;
  resource?: {
    // Make resource optional as not all menu items link to a resource
    __typename?: string; // Type identifier
    id?: string; // Optional ID (Added for Page resources)
    title?: string; // Optional title (might differ from menu item title)
    handle?: string; // Optional handle
    image?: ImageNode | null; // Optional image, using the ImageNode type
  } | null;
}

// Specific type for menu items expected to link to collections
export interface MenuItemWithCollection extends MenuItem {
  resource: {
    __typename: "Collection"; // Ensure it's a collection
    id: string;
    title: string;
    handle: string;
    image: ImageNode | null; // Image can be null, use ImageNode type
  } | null; // The resource itself can be null if the menu item doesn't link properly
}

// Structure for a menu
export interface Menu {
  items: MenuItem[]; // Can contain basic menu items
}

// Structure for a menu specifically containing collection links
export interface MenuWithCollectionItems {
  items: MenuItemWithCollection[];
}
