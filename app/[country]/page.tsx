import { banners, countries, Country, Banner } from "@/lib/countries";
import React from "react";
import CountryPageClient from "./CountryPageClient";
import { initializeApollo } from "@/lib/apollo/apollo-client";
// Remove ProductsData and GET_PRODUCTS imports if no longer needed elsewhere after verification
// import { ProductsData } from "@/lib/types/products";
// import { GET_PRODUCTS } from "@/lib/queries/products";
import { GET_COLLECTION_PRODUCTS } from "@/lib/queries/collection"; // Import collection products query
import { CollectionData, CollectionProductNode } from "@/lib/types/collection"; // Use correct type CollectionData and Node
import { Metadata } from "next";
import {
  GET_COLLECTIONS_BY_MENU,
  GetCollectionsByMenuResponse,
} from "@/lib/queries/menu"; // Import new query and type
// Removed getActiveTheme import

// Homepage Metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country } = await params;
  const currentCountry = countries.find((c) => c.slug === country && c.active);
  const countryName = currentCountry?.name || "Global";

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lugdi.store";
  const canonicalUrl = `${siteUrl}/${country}`;

  const title = `Lugdi ${countryName}: Shop Graphic Tees, Streetwear & Fashion Online`;
  const description = `Explore Lugdi in ${countryName}. Discover unique graphic t-shirts, modern streetwear, and fashion accessories inspired by culture and art. Shop the latest arrivals.`;

  return {
    title: {
      absolute: title // Use absolute to explicitly ignore layout template
    },
    description: description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: title, // OG title can remain the simple string
      description: description,
      url: canonicalUrl,
    },
  };
}

export default async function CountryHomePage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country: countrySlug } = await params;

  const isoCountryCode = countrySlug ? countrySlug.toUpperCase() : "IN";

  // Update variable declarations for menu data and product data
  let menCollectionsMenu: GetCollectionsByMenuResponse | null = null;
  let womenCollectionsMenu: GetCollectionsByMenuResponse | null = null;
  let newArrivalsProducts: CollectionProductNode[] = [];
  let mensProducts: CollectionProductNode[] = [];
  let womensProducts: CollectionProductNode[] = [];
  let bestSellingProducts: CollectionProductNode[] = []; // Add for best-sellers
  let storiesOfUsProducts: CollectionProductNode[] = []; // Add for stories-of-us

  try {
    const client = initializeApollo();

    // Fetch men's collections menu
    const { data: menMenuData } =
      await client.query<GetCollectionsByMenuResponse>({
        query: GET_COLLECTIONS_BY_MENU,
        variables: { handle: "men-collections" },
      });

    // Fetch women's collections menu
    const { data: womenMenuData } =
      await client.query<GetCollectionsByMenuResponse>({
        query: GET_COLLECTIONS_BY_MENU,
        variables: { handle: "women-collections" },
      });

      // Fetch New Arrivals using GET_COLLECTION_PRODUCTS
      const { data: newArrivalsCollectionData } = await client.query<CollectionData>({
        query: GET_COLLECTION_PRODUCTS,
        variables: {
          handle: "new-arrivals", // Use the new-arrivals handle
          first: 12,
          sortKey: "CREATED", // Use valid sort key for New Arrivals
          reverse: true, // Keep reverse true for newest first
          country: isoCountryCode,
        },
        fetchPolicy: "network-only", // Consider if needed
      });

      // Fetch Men's Collection Products using GET_COLLECTION_PRODUCTS
      const { data: mensCollectionData } = await client.query<CollectionData>({ // Use correct type CollectionData
        query: GET_COLLECTION_PRODUCTS, // Use the correct query
        variables: {
          handle: "mens-collection", // Pass handle
          first: 12, // Fetch 12 products
          sortKey: "BEST_SELLING", // Use BEST_SELLING for Men's
          reverse: false, // Best selling usually doesn't need reverse
          country: isoCountryCode,
        },
        fetchPolicy: "network-only",
      }); // Add missing closing parenthesis

      // Fetch Women's Collection Products using GET_COLLECTION_PRODUCTS
      const { data: womensCollectionData } = await client.query<CollectionData>({ // Use correct type CollectionData
        query: GET_COLLECTION_PRODUCTS, // Use the correct query
        variables: {
          handle: "womens-collection", // Pass handle
          first: 12, // Fetch 12 products
          sortKey: "BEST_SELLING", // Use BEST_SELLING for Women's
          reverse: false, // Best selling usually doesn't need reverse
          country: isoCountryCode,
        },
        fetchPolicy: "network-only",
      });

      // Fetch Best Selling Products using GET_COLLECTION_PRODUCTS
      const { data: bestSellingCollectionData } = await client.query<CollectionData>({
        query: GET_COLLECTION_PRODUCTS,
        variables: {
          handle: "best-sellers", // Corrected handle
          first: 12,
          sortKey: "BEST_SELLING",
          reverse: false,
          country: isoCountryCode,
        },
        fetchPolicy: "network-only",
      });

      // Fetch Stories of Us Products using GET_COLLECTION_PRODUCTS
      const { data: storiesOfUsCollectionData } = await client.query<CollectionData>({
        query: GET_COLLECTION_PRODUCTS,
        variables: {
          handle: "stories-of-us", // Assumed handle
          first: 12,
          sortKey: "CREATED", // Or BEST_SELLING, RELEVANCE etc. - Assuming CREATED for now
          reverse: true,
          country: isoCountryCode,
        },
        fetchPolicy: "network-only",
      });

      // Assign fetched menu data and extracted product data
      menCollectionsMenu = menMenuData;
      womenCollectionsMenu = womenMenuData;
      // Extract product nodes directly for all sections
      newArrivalsProducts = newArrivalsCollectionData?.collection?.products?.edges?.map(edge => edge.node) || [];
      mensProducts = mensCollectionData?.collection?.products?.edges?.map(edge => edge.node) || [];
      womensProducts = womensCollectionData?.collection?.products?.edges?.map(edge => edge.node) || [];
      bestSellingProducts = bestSellingCollectionData?.collection?.products?.edges?.map(edge => edge.node) || [];
      storiesOfUsProducts = storiesOfUsCollectionData?.collection?.products?.edges?.map(edge => edge.node) || [];

    } catch (error) {
      // Update catch block assignments
      menCollectionsMenu = null;
      womenCollectionsMenu = null;
      newArrivalsProducts = [];
      mensProducts = [];
      womensProducts = [];
      bestSellingProducts = []; // Nullify on error
      storiesOfUsProducts = []; // Nullify on error
      console.error("Error fetching homepage data:", error);
  }

  const country: Country | null =
    countries.find((c) => c.slug === countrySlug) || null;

  // Removed activeTheme logic
  // const activeTheme = getActiveTheme(countrySlug);
  // Always use default country banners now
  const finalBanners: Banner[] = banners[countrySlug] || [];
  // Removed theme banner override logic

  return (
    // Update props passed to client component
    // Update props passed to client component
    <CountryPageClient
      country={country}
      banners={finalBanners} // Pass potentially themed banners
      // themeClass prop removed, client gets it from context
      menCollectionsMenu={menCollectionsMenu}
      womenCollectionsMenu={womenCollectionsMenu}
      newArrivalsProducts={newArrivalsProducts}
      mensProducts={mensProducts}
      womensProducts={womensProducts}
      bestSellingProducts={bestSellingProducts} // Pass best sellers
      storiesOfUsProducts={storiesOfUsProducts} // Pass stories of us
    />
  );
}
