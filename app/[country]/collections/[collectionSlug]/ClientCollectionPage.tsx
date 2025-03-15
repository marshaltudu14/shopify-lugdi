"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery } from "@apollo/client";
import Link from "next/link";
import LugdiUtils from "@/utils/LugdiUtils";
import SortSelect from "@/app/components/SortSelect"; // Adjust path as needed
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
import ProductCard from "@/app/components/ProductCard";
import { CollectionData } from "@/lib/types/collection";

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
  countryName?: string;
}

export default function ClientCollectionPage({
  initialData,
  collectionSlug,
  isoCountryCode,
  countryName,
}: ClientCollectionPageProps) {
  const [sortOption, setSortOption] = useState<SortOption>("relevance");

  const sentinelRef = useRef<HTMLDivElement>(null);

  // Query variables
  const variables = useMemo<QueryVariables>(() => {
    const sortConfig = getSortConfig(sortOption);
    return {
      handle: collectionSlug,
      first: LugdiUtils.product_quantity,
      sortKey: sortConfig.sortKey,
      reverse: sortConfig.reverse,
      after: null,
      country: isoCountryCode,
    };
  }, [collectionSlug, sortOption, isoCountryCode]);

  // Use initial data if available, otherwise fetch on client
  const { data, fetchMore, loading, error, refetch } = useQuery<
    CollectionData,
    QueryVariables
  >(GET_COLLECTION_PRODUCTS, {
    variables,
    fetchPolicy: "cache-and-network",
    skip: !collectionSlug || !isoCountryCode,
    notifyOnNetworkStatusChange: true,
  });

  // Handle sort change
  const handleSortChange = (value: SortOption) => {
    setSortOption(value);
    const sortConfig = getSortConfig(value);
    refetch({
      ...variables,
      sortKey: sortConfig.sortKey,
      reverse: sortConfig.reverse,
      after: null, // Reset pagination on sort
    });
  };

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (
          entry.isIntersecting &&
          data?.collectionByHandle?.products.pageInfo.hasNextPage &&
          !loading
        ) {
          fetchMore({
            variables: {
              ...variables,
              after: data.collectionByHandle!.products.pageInfo.endCursor,
            },
            updateQuery: (prev, { fetchMoreResult }) => {
              if (!fetchMoreResult || !fetchMoreResult.collectionByHandle)
                return prev;
              return {
                ...prev,
                collectionByHandle: {
                  ...prev.collectionByHandle!,
                  products: {
                    ...prev.collectionByHandle!.products,
                    edges: [
                      ...prev.collectionByHandle!.products.edges,
                      ...fetchMoreResult.collectionByHandle.products.edges,
                    ],
                    pageInfo:
                      fetchMoreResult.collectionByHandle.products.pageInfo,
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

  if (loading && !data)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-3">
        <h1 className="text-3xl text-center">Error Occured</h1>

        <p className="text-center">{error.message}</p>
      </div>
    );
  }

  if (!data?.collectionByHandle)
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
              Looks like we don&apos;t have products here yet. Try exploring
              other categories or check back later for updates.
            </motion.p>

            <Link href="/">
              <motion.div
                variants={buttonHoverVariants}
                whileHover="hover"
                whileTap="tap"
                className="mt-6"
              >
                <Button className="px-4 py-2">Back to Home</Button>
              </motion.div>
            </Link>
          </div>
        </AnimatedSection>
      </div>
    );

  const products = data.collectionByHandle.products.edges.map(
    (edge) => edge.node
  );

  return (
    <div className="min-h-screen px-2 py-2 md:px-3 md:py-3 lg:px-5 lg:py-5">
      <div className="space-y-2">
        <div className="text-center my-5 md:my-7 lg:my-10">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            {data?.collectionByHandle?.title || "Collection"}
          </h1>
        </div>

        <div className="flex items-center justify-end">
          {products.length > 0 && (
            <SortSelect value={sortOption} onValueChange={handleSortChange} />
          )}
        </div>

        <div>
          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-5 md:gap-4">
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
                    Looks like we don’t have products here yet. Try exploring
                    other categories or check back later for updates.
                  </motion.p>

                  <Link href="/">
                    <motion.div
                      variants={buttonHoverVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className="mt-6"
                    >
                      <Button className="px-4 py-2">Back to Home</Button>
                    </motion.div>
                  </Link>
                </div>
              </AnimatedSection>
            </div>
          )}
        </div>
      </div>
      {data.collectionByHandle.products.pageInfo.hasNextPage && (
        <div ref={sentinelRef} className="flex items-center justify-center">
          <Loader2 className="animate-spin" />
        </div>
      )}
    </div>
  );
}
