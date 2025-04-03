"use client";

import { useState, useMemo, useEffect, useRef } from "react"; // Removed useCallback
import { useQuery } from "@apollo/client";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import LugdiUtils from "@/utils/LugdiUtils";
import SortSelect from "@/app/components/SortSelect";
import { GET_COLLECTION_PRODUCTS } from "@/lib/queries/collection";
import { getSortConfig, SortOption } from "@/lib/SortConfig";
import { Frown, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  AnimatedSection,
  buttonHoverVariants,
  itemVariants,
} from "@/app/components/FramerMotion";
import { CollectionData, CollectionProductNode } from "@/lib/types/collection"; // Added CollectionProductNode for type safety
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
      } // Added missing closing brace
    }); // Added missing closing parenthesis
    // Removed adding active filters back to params
    // Use router.replace to avoid adding to history stack for filter changes
    const currentQuery = params.toString();
    if (currentQuery !== searchParams.toString()) { // Only replace if params actually changed
       router.replace(`?${currentQuery}`, { scroll: false });
    }
  }, [searchParams, router]); // Removed activeFilters dependency

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

  // Removed filter calculation and state logic

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

  // Use allProducts length for conditional rendering checks
  const hasProducts = allProducts.length > 0;
  // Removed unused hasAnyFetchedProducts variable

  return (
    <div className="min-h-screen px-2 py-2 md:px-3 md:py-3 lg:px-5 lg:py-5">
      <div className="space-y-4">
        <div className="text-center my-5 md:my-7 lg:my-10">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            {resolvedData?.collection?.title || "Collection"}
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
                hasNextPage={resolvedData?.collection?.products?.pageInfo?.hasNextPage ?? false}
                sentinelRef={sentinelRef}
                isLoadingMore={loading}
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
