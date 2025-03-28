"use client";

import { GET_PRODUCTS } from "@/lib/queries/products";
import { getSortConfig, SortOption } from "@/lib/SortConfig";
import { ProductsData } from "@/lib/types/products";
import LugdiUtils from "@/utils/LugdiUtils";
import { useQuery } from "@apollo/client";
import { useParams } from "next/navigation";
import { useState, useMemo, useEffect, useRef } from "react";
import SortSelect from "@/app/components/SortSelect";
import { Frown, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  AnimatedSection,
  buttonHoverVariants,
  itemVariants,
} from "@/app/components/FramerMotion";
import ProductCard from "@/app/components/ProductCard";
import Link from "next/link";

interface QueryVariables {
  first: number;
  sortKey: "RELEVANCE" | "BEST_SELLING" | "CREATED" | "PRICE";
  reverse?: boolean;
  after?: string | null;
  country: string;
  query: string;
}

interface SearchPageProps {
  searchProducts: ProductsData | null;
  initialQuery: string;
  isoCountryCode: string;
}

export default function SearchPageClient({
  searchProducts,
  initialQuery,
  isoCountryCode: serverCountryCode,
}: SearchPageProps) {
  const params = useParams();
  const [sortOption, setSortOption] = useState<SortOption>("relevance");
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [countryCode, setCountryCode] = useState(
    serverCountryCode.toUpperCase()
  );
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Update search query when params change
  useEffect(() => {
    if (params?.searchQuery) {
      const query = Array.isArray(params.searchQuery)
        ? params.searchQuery[0]
        : params.searchQuery;
      const decodedQuery = decodeURIComponent(query || "");
      if (decodedQuery !== searchQuery) {
        setSearchQuery(decodedQuery);
      }
    }
  }, [params?.searchQuery, searchQuery]);

  // Update country code when params change
  useEffect(() => {
    const currentParamCountry = params?.country;

    // Handle case where country param might be string or string array
    const normalizedParamCountry = Array.isArray(currentParamCountry)
      ? currentParamCountry[0]
      : currentParamCountry;

    if (
      normalizedParamCountry &&
      normalizedParamCountry.toLowerCase() !== countryCode.toLowerCase()
    ) {
      // Convert to uppercase when setting the country code
      setCountryCode(normalizedParamCountry.toUpperCase());
    }
  }, [params?.country, countryCode]);

  const variables = useMemo<QueryVariables>(() => {
    const sortConfig = getSortConfig(sortOption);
    return {
      first: LugdiUtils.product_quantity,
      sortKey: sortConfig.sortKey,
      reverse: sortConfig.reverse,
      after: null,
      country: countryCode,
      query: searchQuery,
    };
  }, [searchQuery, sortOption, countryCode]);

  const { data, fetchMore, loading, error, refetch } = useQuery<
    ProductsData,
    QueryVariables
  >(GET_PRODUCTS, {
    variables,
    fetchPolicy: "cache-and-network",
    skip: !searchQuery || !countryCode,
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
          data?.products?.pageInfo?.hasNextPage &&
          !loading
        ) {
          fetchMore({
            variables: {
              ...variables,
              after: data?.products?.pageInfo?.endCursor,
            },
            updateQuery: (prev, { fetchMoreResult }) => {
              if (!fetchMoreResult?.products) return prev;
              return {
                ...prev,
                products: {
                  ...prev.products!,
                  edges: [
                    ...prev.products!.edges,
                    ...fetchMoreResult.products.edges,
                  ],
                  pageInfo: fetchMoreResult.products.pageInfo,
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

  const resolvedData = data || searchProducts;

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

  if (!resolvedData?.products)
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
              Looks like we don&apos;t have products matching your search. Try
              different keywords or check back later.
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

  const products = resolvedData.products?.edges?.map((edge) => edge.node) || [];

  return (
    <div className="min-h-screen px-2 py-2 md:px-3 md:py-3 lg:px-5 lg:py-5">
      <div className="space-y-2">
        <div className="text-center my-5 md:my-7 lg:my-10">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Search Results for &quot;{searchQuery}&quot;
          </h1>
        </div>

        <div className="flex items-center justify-end">
          {products.length > 0 && (
            <SortSelect value={sortOption} onValueChange={handleSortChange} />
          )}
        </div>

        <div>
          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 md:gap-4">
              {products.map((product) => (
                <div key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center">
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
                    className="text-slate-700 dark:text-slate-300 md:text-lg"
                  >
                    We couldn&apos;t find any products matching &quot;
                    {searchQuery}&quot;. Try different keywords or check back
                    later.
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
          )}
        </div>
      </div>
      {resolvedData?.products?.pageInfo?.hasNextPage && (
        <div ref={sentinelRef} className="flex items-center justify-center">
          <Loader2 className="animate-spin" />
        </div>
      )}
    </div>
  );
}
