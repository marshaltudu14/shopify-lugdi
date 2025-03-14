import { initializeApollo } from "@/lib/apollo/apollo-client";
import { GET_COLLECTION_PRODUCTS } from "@/lib/queries/collection";
import LugdiUtils from "@/utils/LugdiUtils";
import { cookies } from "next/headers";
import React from "react";

type CollectionPageProps = {
  params: {
    collectionSlug: string;
  };
};

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { collectionSlug } = params;

  // Get country Name & Slug from cookies
  const cookieStore = await cookies();
  const countrySlug = cookieStore.get(LugdiUtils.location_cookieName)?.value;
  const isoCountryCode = countrySlug ? countrySlug.toUpperCase() : "IN";

  try {
    const client = initializeApollo();
    const { data } = await client.query({
      query: GET_COLLECTION_PRODUCTS,
      variables: {
        handle: collectionSlug,
        first: 10, // Number of products to fetch
        sortKey: "BEST_SELLING", // Sort key (e.g., PRICE, RELEVANCE, BEST_SELLING)
        reverse: false,
        country: isoCountryCode,
      },
    });

    console.log("Collection Data:", data);
  } catch (error) {
    console.error("Error fetching collection:", error);
  }

  return <h1>{collectionSlug}</h1>;
}
