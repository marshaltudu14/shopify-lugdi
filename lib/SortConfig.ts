// Define SortOption type
export type SortOption =
  | "relevance"
  | "best-selling"
  | "new-arrivals"
  | "price-low-to-high"
  | "price-high-to-low";

// Define SortConfig interface
export interface SortConfig {
  sortKey: "RELEVANCE" | "BEST_SELLING" | "CREATED" | "PRICE";
  reverse: boolean;
}

// Sort options mapping
export const sortMap: Record<SortOption, SortConfig> = {
  relevance: { sortKey: "RELEVANCE", reverse: false },
  "best-selling": { sortKey: "BEST_SELLING", reverse: false },
  "new-arrivals": { sortKey: "CREATED", reverse: true },
  "price-low-to-high": { sortKey: "PRICE", reverse: false },
  "price-high-to-low": { sortKey: "PRICE", reverse: true },
};

// Utility function to get sort config
export function getSortConfig(sortOption: SortOption): SortConfig {
  return sortMap[sortOption];
}
