import { Metadata } from "next";
import { initializeApollo } from "@/lib/apollo/apollo-client";
import { GET_COLLECTION_PRODUCTS } from "@/lib/queries/collection";
import LugdiUtils from "@/utils/LugdiUtils";
import { cookies } from "next/headers";
import React from "react";
import ClientCollctionPage from "./ClientCollectionPage";

function convertSlugToTitle(slug: string): string {
  return slug
    .replace(/[-_]/g, " ") // Replace hyphens or underscores with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize each word
}

// Collection Page Metadata
export async function generateMetadata({
  params,
}: {
  params: { collectionSlug: string };
}): Promise<Metadata> {
  const { collectionSlug } = await params;
  const client = initializeApollo();

  const cookieStore = await cookies();
  const countrySlug = cookieStore.get(LugdiUtils.location_cookieName)?.value;
  const isoCountryCode = countrySlug ? countrySlug.toUpperCase() : "IN";

  try {
    const { data } = await client.query({
      query: GET_COLLECTION_PRODUCTS,
      variables: {
        handle: collectionSlug,
        first: 1, // Minimal fetch for metadata
        sortKey: "RELEVANCE",
        reverse: false,
        country: isoCountryCode,
      },
    });

    const collection = data?.collectionByHandle;

    const seoTitle =
      collection?.seo?.title ||
      `Buy ${convertSlugToTitle(
        collectionSlug
      )} Fashion Apparels & Accessories Online`;
    const seoDescription =
      collection?.seo?.description ||
      `Discover a wide selection of ${convertSlugToTitle(
        collectionSlug
      )} fashion apparels & accessories. Enjoy new arrivals, exclusive deals, and premium quality.`;
    const seoImage = collection?.image?.originalSrc || "";

    return {
      title: seoTitle,
      description: seoDescription,
      openGraph: {
        title: seoTitle,
        description: seoDescription,
        images: [
          {
            url: seoImage,
            alt: collection?.image?.altText || seoTitle,
          },
        ],
      },
    };
  } catch (error) {
    console.error("Error fetching SEO metadata:", error);
    return {
      title: `Buy ${convertSlugToTitle(
        collectionSlug
      )} Fashion Apparels & Accessories Online`,
      description: `Discover a wide selection of ${convertSlugToTitle(
        collectionSlug
      )} fashion apparels & accessories. Enjoy new arrivals, exclusive deals, and premium quality.`,
    };
  }
}

export default async function CollectionPage({
  params,
}: {
  params: { collectionSlug: string };
}) {
  const { collectionSlug } = await params;

  const cookieStore = await cookies();
  const countrySlug = cookieStore.get(LugdiUtils.location_cookieName)?.value;
  const countryName = cookieStore.get(
    LugdiUtils.location_name_country_cookie
  )?.value;
  const isoCountryCode = countrySlug ? countrySlug.toUpperCase() : "IN";

  let initialData;
  try {
    const client = initializeApollo();
    const { data } = await client.query({
      query: GET_COLLECTION_PRODUCTS,
      variables: {
        handle: collectionSlug,
        first: LugdiUtils.product_quantity || 20,
        sortKey: "RELEVANCE",
        reverse: false,
        country: isoCountryCode,
      },
    });

    initialData = data;
  } catch (error) {
    console.error("Error fetching collection:", error);
    initialData = null;
  }

  return (
    <ClientCollctionPage
      initialData={initialData}
      collectionSlug={collectionSlug}
      isoCountryCode={isoCountryCode}
      countryName={countryName}
    />
  );
}
