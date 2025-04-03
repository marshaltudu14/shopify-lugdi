"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@apollo/client";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import LugdiUtils from "@/utils/LugdiUtils";
import SortSelect from "@/app/components/SortSelect";
import { GET_COLLECTION_PRODUCTS } from "@/lib/queries/collection";
import { getSortConfig, SortOption } from "@/lib/SortConfig";
import { Frown, Loader2, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"; // Import Sheet components
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"; // Re-add Collapsible imports
import {
  AnimatedSection,
  buttonHoverVariants,
  itemVariants,
} from "@/app/components/FramerMotion";
import ProductCard from "@/app/components/ProductCard";
import ProductFilters, {
  AvailableFilters,
  ActiveFilters,
} from "@/app/components/ProductFilters"; // Import the filter component and types
import { CollectionData } from "@/lib/types/collection";
// Removed unused import: import { ProductRecommendation } from "@/lib/types/product";

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
    setSortOption(value);
    const sortConfig = getSortConfig(value);
    refetch({
      ...variables,
      sortKey: sortConfig.sortKey,
      reverse: sortConfig.reverse,
      after: null,
    });
  };

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
  const allProducts = useMemo(
    () =>
      resolvedData?.collection?.products?.edges?.map((edge) => edge.node) || [],
    [resolvedData]
  );

  // Calculate available filters from all products
  const availableFilters = useMemo<AvailableFilters>(() => {
    const filters: AvailableFilters = {};
    allProducts.forEach((product) => {
      product.options?.forEach((option) => {
        if (!filters[option.name]) {
          filters[option.name] = new Set<string>();
        }
        option.values.forEach((value) => {
          filters[option.name].add(value);
        });
      });
    });
    return filters;
  }, [allProducts]);

  // Filter products based on active filters
  const filteredProducts = useMemo(() => {
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
          if (!productOption) return false; // Product doesn't have this filter option

          // Check if *any* variant of the product matches *one* of the selected values for this option
          return product.variants.edges.some((variantEdge) => {
            const variantOption = variantEdge.node.selectedOptions.find(
              (opt) => opt.name === optionName
            );
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
          {/* Filter Trigger Button (Desktop) and Mobile Filters */}
          {hasAnyFetchedProducts &&
            Object.keys(availableFilters).length > 0 && (
              <div className="md:col-span-4 flex justify-end md:justify-start mb-4 md:mb-0">
                {/* Desktop: Sheet Trigger */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="hidden md:inline-flex">
                      <SlidersHorizontal className="mr-2 h-4 w-4" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-[300px] sm:w-[400px] overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="py-4">
                      <ProductFilters
                        availableFilters={availableFilters}
                        activeFilters={activeFilters}
                        onFilterChange={handleFilterChange}
                        onClearFilters={handleClearFilters}
                      />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Mobile: Stacked Filters */}
                <div className="block md:hidden w-full">
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start mb-2"
                      >
                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                        Filters (
                        {Object.values(activeFilters).reduce(
                          (count, values) => count + values.length,
                          0
                        )}
                        )
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <ProductFilters
                        availableFilters={availableFilters}
                        activeFilters={activeFilters}
                        onFilterChange={handleFilterChange}
                        onClearFilters={handleClearFilters}
                      />
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </div>
            )}

          {/* Products Grid / No Products Message */}
          <div className="md:col-span-4">
            {" "}
            {/* Always full width now */}
            <div className="flex items-center justify-end mb-4">
              {hasProducts && ( // Only show sort if there are products *after* filtering
                <SortSelect
                  value={sortOption}
                  onValueChange={handleSortChange}
                />
              )}
            </div>
            {hasProducts ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 md:gap-4">
                {filteredProducts.map((product) => (
                  <div key={product.id}>
                    <ProductCard product={product} />{" "}
                    {/* Removed incorrect cast */}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-10">
                <AnimatedSection delay={0.2}>
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
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
                      className="text-slate-700 dark:text-slate-300 md:text-lg mt-4"
                    >
                      {hasAnyFetchedProducts
                        ? "No products match your current filters. Try adjusting or clearing them."
                        : "Looks like we don't have products here yet. Try exploring other categories or check back later."}
                    </motion.p>
                    {hasAnyFetchedProducts && ( // Show clear filters button only if filters caused no products
                      <motion.div
                        variants={buttonHoverVariants}
                        whileHover="hover"
                        whileTap="tap"
                        className="mt-6"
                      >
                        <Button
                          onClick={handleClearFilters}
                          className="px-4 py-2 cursor-pointer"
                        >
                          Clear Filters
                        </Button>
                      </motion.div>
                    )}
                    {!hasAnyFetchedProducts && ( // Show back home only if no products were ever fetched
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
                    )}
                  </div>
                </AnimatedSection>
              </div>
            )}
            {/* Infinite Scroll Sentinel */}
            {resolvedData?.collection?.products?.pageInfo?.hasNextPage && (
              <div
                ref={sentinelRef}
                className="flex items-center justify-center mt-8"
              >
                <Loader2 className="animate-spin" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
