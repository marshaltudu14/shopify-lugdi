// Defines the shape of the Wishlist context data and functions

export interface WishlistContextType {
  wishlistedVariantIds: string[]; // Array of Shopify variant GIDs (e.g., "gid://shopify/ProductVariant/12345")
  addToWishlist: (variantId: string) => void;
  removeFromWishlist: (variantId: string) => void;
  isItemInWishlist: (variantId: string) => boolean;
  clearWishlist: () => void; // Added for potential future use
}
