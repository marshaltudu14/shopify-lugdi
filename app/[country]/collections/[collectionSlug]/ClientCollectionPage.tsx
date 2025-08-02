"use client";

import { useState, useMemo, useRef } from "react";
import SortSelect from "@/app/components/SortSelect";
import { getSortConfig, SortOption } from "@/lib/SortConfig";
import { Loader2 } from "lucide-react";
import { CollectionProductNode, CollectionNode } from "@/lib/types/collection";
import ProductGrid from "@/app/components/collection/ProductGrid";


interface ClientCollectionPageProps {
  collectionSlug: string;
  initialData: CollectionNode;
  isoCountryCode: string;
}

export default function ClientCollectionPage({
  initialData,
}: ClientCollectionPageProps) {
  const [isSorting, setIsSorting] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("relevance");
  const sentinelRef = useRef(null);

  const collectionData = initialData;

  const handleSortChange = (value: SortOption) => {
    setIsSorting(true); // Start sorting loader
    setSortOption(value);
    // Simulate network delay for sorting
    setTimeout(() => {
      setIsSorting(false);
    }, 500);
  };

  const allProducts = useMemo<CollectionProductNode[]>(() => {
    if (!collectionData || !collectionData.products || !collectionData.products.edges) return [];

    const products = collectionData.products.edges.map((edge) => edge.node);

    const sortConfig = getSortConfig(sortOption);

    // Apply sorting
    products.sort((a: CollectionProductNode, b: CollectionProductNode) => {
      if (sortConfig.sortKey === "PRICE") {
        const priceA = parseFloat(a.priceRange.minVariantPrice.amount);
        const priceB = parseFloat(b.priceRange.minVariantPrice.amount);
        return sortConfig.reverse ? priceB - priceA : priceA - priceB;
      } else if (sortConfig.sortKey === "CREATED") {
        // Assuming products have a 'createdAt' or similar field for 'CREATED' sort
        // For mock data, we can just reverse the order if 'reverse' is true
        return sortConfig.reverse ? -1 : 1; // Simple reverse for mock data
      }
      return 0;
    });

    return products;
  }, [collectionData, sortOption]);

  if (!collectionData)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  const hasProducts = allProducts.length > 0;

  return (
    <div className="min-h-screen px-2 py-2 md:px-3 md:py-3 lg:px-5 lg:py-5">
      <div className="space-y-4">
        <div className="text-center my-5 md:my-7 lg:my-10">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            {collectionData?.title || "Collection"}
          </h1>
        </div>

        {/* Removed outer grid, products now take full width */}
        <div className="space-y-4">
          {/* Products Grid / No Products Message Container */}
          <div> {/* Removed md:col-span-4 */}
            {/* Sort Select */}
            <div className="flex items-center justify-end mb-4">
              {hasProducts && ( // Only show sort if there are products
                <SortSelect
                  value={sortOption}
                  onValueChange={handleSortChange}
                />
              )}
            </div>

            {/* Render ProductGrid Component or Sorting Loader */}
            {isSorting ? (
              <div className="flex items-center justify-center py-10 min-h-[300px]">
                <Loader2 className="animate-spin h-8 w-8" />
              </div>
            ) : (
              <ProductGrid
                products={allProducts} // Use allProducts directly
                hasNextPage={false}
                sentinelRef={sentinelRef}
                isLoadingMore={false}
                // Removed hasAnyFetchedProducts prop
                // Removed onClearFilters prop - will address in ProductGrid component later if needed
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
