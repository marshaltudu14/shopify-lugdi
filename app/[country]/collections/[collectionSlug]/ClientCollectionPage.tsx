"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@apollo/client";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import LugdiUtils from "@/utils/LugdiUtils";
import SortSelect from "@/app/components/SortSelect";
import { GET_COLLECTION_PRODUCTS } from "@/lib/queries/collection";
import { getSortConfig, SortOption } from "@/lib/SortConfig";
import { Frown, Loader2 } from "lucide-react"; // Removed SlidersHorizontal
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
// Removed Sheet and Collapsible imports as they are now in CollectionFilters
import {
  AnimatedSection,
  buttonHoverVariants,
  itemVariants,
} from "@/app/components/FramerMotion";
// Removed ProductCard import as it's now in ProductGrid
// Removed unused ProductFilters import
import {
  AvailableFilters,
  ActiveFilters,
} from "@/app/components/ProductFilters"; // Keep type imports if needed
import { CollectionData, CollectionProductNode } from "@/lib/types/collection"; // Added CollectionProductNode for type safety
import CollectionFilters from "@/app/components/collection/CollectionFilters"; // Import new component
import ProductGrid from "@/app/components/collection/ProductGrid"; // Import new component

interface QueryVariables {
  handle: string;
  first: number;
  sortKey: "RELEVANCE" | "BEST_SELLING" | "CREATED" | "PRICE";
  reverse?: boolean;
  after?: string | null;
  country: string;
}

interface ClientCollectionPageProps {
  initialData: CollectionData | null;
  collectionSlug: string;
  isoCountryCode: string;
}

export default function ClientCollectionPage({
  initialData,
  collectionSlug,
  isoCountryCode: serverCountryCode, // Renamed for clarity
}: ClientCollectionPageProps) {
  const params = useParams();
  const [sortOption, setSortOption] = useState<SortOption>("relevance");
  const [isSorting, setIsSorting] = useState(false); // State for sort-specific loading
  const [countryCode, setCountryCode] = useState(
    serverCountryCode.toUpperCase()
  );
  const sentinelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for active filters
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(() => {
    const initialFilters: ActiveFilters = {};
    searchParams.forEach((value, key) => {
      if (key !== "sort") {
        // Assuming 'sort' might be another param
        initialFilters[key] = value.split(",");
      }
    });
    return initialFilters;
  });

  // Update country code when params change
  useEffect(() => {
    const currentParamCountry = params?.country;

    // Handle case where country param might be string or string array
    const normalizedParamCountry = Array.isArray(currentParamCountry)
      ? currentParamCountry[0] // Take first element if it's an array
      : currentParamCountry;

    if (
      normalizedParamCountry &&
      normalizedParamCountry.toLowerCase() !== countryCode.toLowerCase()
    ) {
      // Convert to uppercase when setting the country code
      setCountryCode(normalizedParamCountry.toUpperCase());
    }
  }, [params?.country, countryCode]);

  // Update URL when activeFilters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    // Remove old filter params
    searchParams.forEach((_, key) => {
      if (key !== "sort") {
        // Keep other params like sort
        params.delete(key);
      }
    });
    // Add current active filters
    Object.entries(activeFilters).forEach(([key, values]) => {
      if (values.length > 0) {
        params.set(key, values.join(","));
      }
    });
    // Use router.replace to avoid adding to history stack for filter changes
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [activeFilters, searchParams, router]);

  const variables = useMemo<QueryVariables>(() => {
    const sortConfig = getSortConfig(sortOption);
    return {
      handle: collectionSlug,
      first: LugdiUtils.product_quantity,
      sortKey: sortConfig.sortKey,
      reverse: sortConfig.reverse,
      after: null,
      country: countryCode,
    };
  }, [collectionSlug, sortOption, countryCode]);

  const { data, fetchMore, loading, error, refetch } = useQuery<
    CollectionData,
    QueryVariables
  >(GET_COLLECTION_PRODUCTS, {
    variables,
    fetchPolicy: "cache-and-network",
    skip: !collectionSlug || !countryCode,
    notifyOnNetworkStatusChange: true,
  });

  const handleSortChange = (value: SortOption) => {
    setIsSorting(true); // Start sorting loader
    setSortOption(value);
    const sortConfig = getSortConfig(value);
    // Ensure refetch happens after state update
    refetch({
      ...variables,
      sortKey: sortConfig.sortKey,
      reverse: sortConfig.reverse,
      after: null, // Reset pagination on sort
    });
    // No need to manually set isSorting to false here, useEffect will handle it
  };

  // Effect to turn off sorting loader when loading finishes after a sort action
  useEffect(() => {
    if (isSorting && !loading) {
      setIsSorting(false);
    }
    // Only run when isSorting or loading changes
  }, [isSorting, loading]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (
          entry.isIntersecting &&
          data?.collection?.products?.pageInfo?.hasNextPage &&
          !loading
        ) {
          fetchMore({
            variables: {
              ...variables,
              after: data?.collection?.products?.pageInfo?.endCursor,
            },
            updateQuery: (prev, { fetchMoreResult }) => {
              if (!fetchMoreResult?.collection) return prev;
              return {
                ...prev,
                collection: {
                  ...prev.collection!,
                  products: {
                    ...prev.collection!.products,
                    edges: [
                      ...prev.collection!.products.edges,
                      ...fetchMoreResult.collection.products.edges,
                    ],
                    pageInfo: fetchMoreResult.collection.products.pageInfo,
                  },
                },
              };
            },
          });
        }
      },
      { threshold: 0.1 }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) observer.observe(currentSentinel);

    return () => {
      if (currentSentinel) observer.unobserve(currentSentinel);
    };
  }, [data, loading, fetchMore, variables]);

  const resolvedData = data || initialData;
  const allProducts = useMemo<CollectionProductNode[]>( // Add explicit type
    () =>
      resolvedData?.collection?.products?.edges?.map((edge) => edge.node) || [],
    [resolvedData]
  );

  // Calculate available filters from all products
  const availableFilters = useMemo<AvailableFilters>(() => {
    const filters: AvailableFilters = {};
    // Ensure product.options exists before iterating
    allProducts.forEach((product) => {
      product.options?.forEach((option) => {
        // Ensure option.name exists and is valid before using as key
        if (option.name && !filters[option.name]) {
          filters[option.name] = new Set<string>();
        }
        option.values.forEach((value) => {
          // Ensure filters[option.name] exists before adding
          if (filters[option.name]) {
             filters[option.name].add(value);
          }
        });
      });
    });
    return filters;
  }, [allProducts]);

  // Filter products based on active filters
  const filteredProducts = useMemo<CollectionProductNode[]>(() => { // Add explicit type
    if (Object.values(activeFilters).every((v) => v.length === 0)) {
      return allProducts; // No filters active, return all
    }

    return allProducts.filter((product) => {
      // Check if product matches ALL active filter categories (e.g., Color AND Size)
      return Object.entries(activeFilters).every(
        ([optionName, selectedValues]) => {
          if (selectedValues.length === 0) return true; // Skip if no values selected for this option

          // Check if the product has this option defined
          const productOption = product.options?.find(
            (opt) => opt.name === optionName
          );
          // If the product doesn't even have the option category, it can't match
          if (!productOption) return false;

          // Check if *any* variant of the product matches *one* of the selected values for this option
          // Ensure variants and edges exist
          return product.variants?.edges?.some((variantEdge) => {
            // Ensure node and selectedOptions exist
            const variantOption = variantEdge?.node?.selectedOptions?.find(
              (opt) => opt.name === optionName
            );
            // Ensure variantOption exists and its value is in the selectedValues
            return (
              variantOption && selectedValues.includes(variantOption.value)
            );
          });
        }
      );
    });
  }, [allProducts, activeFilters]);

  // Handlers for filter changes
  const handleFilterChange = useCallback(
    (optionName: string, value: string, checked: boolean) => {
      setActiveFilters((prevFilters) => {
        const currentValues = prevFilters[optionName] || [];
        let newValues: string[];
        if (checked) {
          newValues = [...currentValues, value];
        } else {
          newValues = currentValues.filter((v) => v !== value);
        }
        // Return new object to trigger state update
        return { ...prevFilters, [optionName]: newValues };
      });
    },
    []
  );

  const handleClearFilters = useCallback(() => {
    setActiveFilters({});
  }, []);

  if (loading && !resolvedData)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-3">
        <h1 className="text-3xl text-center">Error Occurred</h1>
        <p className="text-center">{error.message}</p>
      </div>
    );
  }

  if (!resolvedData?.collection)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AnimatedSection delay={0.2}>
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center space-y-5">
            <motion.div
              variants={itemVariants}
              className="flex flex-col items-center justify-center gap-4 max-w-2xl mx-auto"
            >
              <Frown className="w-12 h-12" />
              <h2 className="text-3xl md:text-4xl font-extrabold">
                No Products Found
              </h2>
            </motion.div>
            <motion.p
              variants={itemVariants}
              className="text-slate-700 dark:text-slate-300 md:text-lg"
            >
              Looks like we don't have products here yet. Try exploring other
              categories or check back later for updates.
            </motion.p>
            <Link href="/">
              <motion.div
                variants={buttonHoverVariants}
                whileHover="hover"
                whileTap="tap"
                className="mt-6"
              >
                <Button className="px-4 py-2 cursor-pointer">
                  Back to Home
                </Button>
              </motion.div>
            </Link>
          </div>
        </AnimatedSection>
      </div>
    );

  // Use filteredProducts length for conditional rendering checks
  const hasProducts = filteredProducts.length > 0;
  const hasAnyFetchedProducts = allProducts.length > 0; // Check if any products were fetched initially

  return (
    <div className="min-h-screen px-2 py-2 md:px-3 md:py-3 lg:px-5 lg:py-5">
      <div className="space-y-4">
        <div className="text-center my-5 md:my-7 lg:my-10">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            {resolvedData?.collection?.title || "Collection"}
          </h1>
          {/* Optional: Display active filters */}
          {/* <p className="text-sm text-muted-foreground">Active Filters: {JSON.stringify(activeFilters)}</p> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8">
          {/* Render CollectionFilters Component */}
          <CollectionFilters
            availableFilters={availableFilters}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />

          {/* Products Grid / No Products Message Container */}
          <div className="md:col-span-4">
            {/* Sort Select */}
            <div className="flex items-center justify-end mb-4">
              {hasProducts && ( // Only show sort if there are products *after* filtering
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
                products={filteredProducts}
                hasNextPage={resolvedData?.collection?.products?.pageInfo?.hasNextPage ?? false} // Corrected syntax
                sentinelRef={sentinelRef}
                isLoadingMore={loading} // Pass the loading state from useQuery
                hasAnyFetchedProducts={hasAnyFetchedProducts}
                onClearFilters={handleClearFilters} // Moved prop inside the component tag
              />
            )} {/* Added missing closing parenthesis for the ternary operator */}
          </div>
        </div>
      </div>
    </div>
  );
}
