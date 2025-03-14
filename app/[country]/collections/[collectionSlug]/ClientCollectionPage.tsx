"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useQuery, gql } from "@apollo/client";
import Link from "next/link"; // Import Next.js Link
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCookie } from "@/utils/CookieUtils";
import LugdiUtils from "@/utils/LugdiUtils";
import { countries, Country } from "@/lib/countries"; // Adjust path

// Define TypeScript interfaces
interface Price {
  amount: string;
  currencyCode: string;
}

interface ImageNode {
  originalSrc: string;
  altText: string | null;
}

interface ProductVariant {
  id: string;
  availableForSale: boolean;
  quantityAvailable: number;
  price: Price;
  compareAtPrice?: Price | null;
}

interface ProductNode {
  id: string;
  title: string;
  handle: string;
  images: {
    edges: { node: ImageNode }[];
  };
  variants: {
    edges: { node: ProductVariant }[];
  };
}

interface ProductEdge {
  node: ProductNode;
  cursor: string;
}

interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

interface Products {
  edges: ProductEdge[];
  pageInfo: PageInfo;
}

interface Collection {
  id: string;
  title: string;
  products: Products;
}

interface CollectionData {
  collectionByHandle: Collection | null;
}

// GraphQL query
const GET_COLLECTION_PRODUCTS = gql`
  query getCollectionProducts(
    $handle: String!
    $first: Int!
    $sortKey: ProductCollectionSortKeys!
    $reverse: Boolean
    $after: String
    $country: CountryCode!
  ) @inContext(country: $country) {
    collectionByHandle(handle: $handle) {
      id
      title
      seo {
        title
        description
      }
      products(
        first: $first
        sortKey: $sortKey
        reverse: $reverse
        after: $after
      ) {
        edges {
          node {
            id
            title
            handle
            images(first: 1) {
              edges {
                node {
                  originalSrc
                  altText
                }
              }
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  availableForSale
                  quantityAvailable
                  price {
                    amount
                    currencyCode
                  }
                  compareAtPrice {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
          cursor
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

// Sort options
type SortOption =
  | "relevance"
  | "trending"
  | "new-arrivals"
  | "price-low-to-high"
  | "price-high-to-low";

interface SortConfig {
  sortKey: "RELEVANCE" | "BEST_SELLING" | "CREATED" | "PRICE";
  reverse: boolean;
}

const sortMap: Record<SortOption, SortConfig> = {
  relevance: { sortKey: "RELEVANCE", reverse: false },
  trending: { sortKey: "BEST_SELLING", reverse: false },
  "new-arrivals": { sortKey: "CREATED", reverse: true },
  "price-low-to-high": { sortKey: "PRICE", reverse: false },
  "price-high-to-low": { sortKey: "PRICE", reverse: true },
};

// Query variables type
interface QueryVariables {
  handle: string;
  first: number;
  sortKey: SortConfig["sortKey"];
  reverse: boolean;
  after: string | null;
  country: string;
}

export default function CollectionPage() {
  const params = useParams();
  const collectionSlug = params?.collectionSlug as string | undefined;

  // Get country slug from cookie
  const countrySlug = getCookie(LugdiUtils.location_cookieName); // e.g., "in", "au"
  const countryName = getCookie(LugdiUtils.location_name_country_cookie);

  // Map slug to ISO country code and find country
  const country: Country | undefined = countries.find(
    (c) => c.slug === countrySlug
  );
  const isoCountryCode = countrySlug ? countrySlug.toUpperCase() : "US"; // e.g., "IN", "AU"

  // State for sort option
  const [sortOption, setSortOption] = useState<SortOption>("relevance");
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Logging
  useEffect(() => {
    console.log("CollectionPage mounted with:", {
      collectionSlug,
      countrySlug,
      isoCountryCode,
      countryName,
    });
  }, [collectionSlug, countrySlug, isoCountryCode, countryName]);

  // Query variables
  const variables = useMemo<QueryVariables>(() => {
    const vars = {
      handle: collectionSlug || "",
      first: 20,
      sortKey: sortMap[sortOption].sortKey,
      reverse: sortMap[sortOption].reverse,
      after: null,
      country: isoCountryCode,
    };
    console.log("Query variables computed:", vars);
    return vars;
  }, [collectionSlug, sortOption, isoCountryCode]);

  // Fetch products
  const { data, fetchMore, loading, error } = useQuery<
    CollectionData,
    QueryVariables
  >(GET_COLLECTION_PRODUCTS, {
    variables,
    skip: !collectionSlug || !countrySlug,
    onCompleted: (data) => {
      console.log("Data fetched for country:", isoCountryCode, {
        collectionTitle: data.collectionByHandle?.title,
        productCount: data.collectionByHandle?.products.edges.length,
        hasNextPage: data.collectionByHandle?.products.pageInfo.hasNextPage,
      });
    },
    onError: (err) => {
      console.error("Query error:", err.message);
    },
  });

  const handleSortChange = (value: SortOption) => {
    console.log("Sort option changed to:", value);
    setSortOption(value);
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
          console.log("Infinite scroll triggered, fetching more products...", {
            currentProductCount: data.collectionByHandle!.products.edges.length,
            endCursor: data.collectionByHandle!.products.pageInfo.endCursor,
          });
          fetchMore({
            variables: {
              ...variables,
              after: data.collectionByHandle!.products.pageInfo.endCursor,
            },
            updateQuery: (prev, { fetchMoreResult }) => {
              if (!fetchMoreResult || !fetchMoreResult.collectionByHandle)
                return prev;
              const newProductCount =
                fetchMoreResult.collectionByHandle.products.edges.length;
              console.log("Fetched more products:", {
                newProductCount,
                totalProducts:
                  prev.collectionByHandle!.products.edges.length +
                  newProductCount,
              });
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
    if (currentSentinel) {
      observer.observe(currentSentinel);
      console.log("Intersection Observer set up");
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
        console.log("Intersection Observer cleaned up");
      }
    };
  }, [data, loading, fetchMore, variables]);

  // Loading and error states
  if (!collectionSlug || !countrySlug) {
    console.log("Missing collectionSlug or countrySlug:", {
      collectionSlug,
      countrySlug,
    });
    return <div>Loading...</div>;
  }

  if (loading && !data) {
    console.log("Initial data loading for country:", isoCountryCode);
    return <div>Loading...</div>;
  }

  if (error) {
    console.log("Rendering error state");
    return <div>Error: {error.message}</div>;
  }

  const products: ProductNode[] =
    data?.collectionByHandle?.products.edges.map((edge) => edge.node) || [];

  // Currency formatter based on country and Shopify currency code
  const formatCurrency = (amount: string, currencyCode: string) => {
    return new Intl.NumberFormat(isoCountryCode, {
      style: "currency",
      currency: currencyCode,
    }).format(parseFloat(amount));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        {data?.collectionByHandle?.title ?? "Collection"} -{" "}
        {countryName || "Unknown Country"}
      </h1>
      <div className="mb-6">
        <Select value={sortOption} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Relevance</SelectItem>
            <SelectItem value="trending">Trending</SelectItem>
            <SelectItem value="new-arrivals">New Arrivals</SelectItem>
            <SelectItem value="price-low-to-high">
              Price: Low to High
            </SelectItem>
            <SelectItem value="price-high-to-low">
              Price: High to Low
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const variant = product.variants.edges[0]?.node;
          if (!variant) return null;

          const price = variant.price;
          const compareAtPrice = variant.compareAtPrice || {
            amount: "0",
            currencyCode: price.currencyCode,
          };
          const isDiscounted =
            parseFloat(compareAtPrice.amount) > parseFloat(price.amount);
          const isOutOfStock = !variant.availableForSale;
          const lowStockThreshold = 5;

          return (
            <Link
              href={`/products/${product.handle}`}
              key={product.id}
              className="block"
            >
              <div className="border rounded-lg p-4 shadow-sm relative hover:shadow-md transition-shadow">
                {isOutOfStock && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded">
                    Out of Stock
                  </span>
                )}
                <img
                  src={
                    product.images.edges[0]?.node.originalSrc ||
                    "/placeholder.png"
                  }
                  alt={product.title}
                  className="w-full h-48 object-cover mb-2"
                />
                <h3 className="text-lg font-semibold">{product.title}</h3>
                <div className="text-gray-600">
                  <span>
                    {formatCurrency(price.amount, price.currencyCode)}
                  </span>
                  {isDiscounted && (
                    <span className="ml-2 text-gray-400 line-through">
                      {formatCurrency(
                        compareAtPrice.amount,
                        compareAtPrice.currencyCode
                      )}
                    </span>
                  )}
                </div>
                {!isOutOfStock &&
                  variant.quantityAvailable <= lowStockThreshold && (
                    <p className="text-red-600 mt-1">
                      Hurry, only {variant.quantityAvailable} left!
                    </p>
                  )}
              </div>
            </Link>
          );
        })}
      </div>
      {data?.collectionByHandle?.products.pageInfo.hasNextPage && (
        <div ref={sentinelRef} className="text-center py-4">
          Loading more...
        </div>
      )}
    </div>
  );
}
