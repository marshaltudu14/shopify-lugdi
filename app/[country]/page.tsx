import { banners, countries, Country, Banner } from "@/lib/countries";
import React from "react";
import CountryPageClient from "./CountryPageClient";
import { CollectionData } from "@/lib/types/collection";
import { initializeApollo } from "@/lib/apollo/apollo-client";
import { GET_COLLECTION_PRODUCTS } from "@/lib/queries/collection";
import { ProductsData } from "@/lib/types/products";
import { GET_PRODUCTS } from "@/lib/queries/products";
import { Metadata } from "next";

// Define params type
interface CountryHomePageParams {
  params: { country: string };
}

// Homepage Metadata
export async function generateMetadata({
  params,
}: CountryHomePageParams): Promise<Metadata> {
  const { country } = await params;
  const currentCountry = countries.find((c) => c.slug === country && c.active);
  const countryName = currentCountry?.name || "Global";

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lugdi.store";
  const canonicalUrl = `${siteUrl}/${country}`;

  const title = `Lugdi ${countryName}: Shop Graphic Tees, Streetwear & Fashion Online`;
  const description = `Explore Lugdi in ${countryName}. Discover unique graphic t-shirts, modern streetwear, and fashion accessories inspired by culture and art. Shop the latest arrivals.`;

  return {
    title: title,
    description: description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: title,
      description: description,
      url: canonicalUrl,
    },
  };
}

export default async function CountryHomePage({
  params,
}: CountryHomePageParams) {
  const { country: countrySlug } = await params;

  const isoCountryCode = countrySlug ? countrySlug.toUpperCase() : "IN";

  let menFeaturedProducts: CollectionData | null;
  let womenFeaturedProducts: CollectionData | null;
  let newArrivals: ProductsData | null;

  try {
    const client = initializeApollo();

    const { data: menData } = await client.query<CollectionData>({
      query: GET_COLLECTION_PRODUCTS,
      variables: {
        handle: "mens-collection",
        first: 12,
        sortKey: "BEST_SELLING",
        reverse: false,
        country: isoCountryCode,
      },
    });

    const { data: womenData } = await client.query<CollectionData>({
      query: GET_COLLECTION_PRODUCTS,
      variables: {
        handle: "womens-collection",
        first: 12,
        sortKey: "BEST_SELLING",
        reverse: false,
        country: isoCountryCode,
      },
    });

    const { data: newArrivalsData } = await client.query<ProductsData>({
      query: GET_PRODUCTS,
      variables: {
        first: 12,
        sortKey: "CREATED_AT",
        reverse: true,
        country: isoCountryCode,
      },
    });

    menFeaturedProducts = menData;
    womenFeaturedProducts = womenData;
    newArrivals = newArrivalsData;
  } catch (error) {
    menFeaturedProducts = null;
    womenFeaturedProducts = null;
    newArrivals = null;
    console.error("Error fetching collection:", error);
  }

  const country: Country | null =
    countries.find((c) => c.slug === countrySlug) || null;
  const bannerData: Banner[] = banners[countrySlug] || [];

  return (
    <CountryPageClient
      country={country}
      banners={bannerData}
      menFeaturedProducts={menFeaturedProducts}
      womenFeaturedProducts={womenFeaturedProducts}
      newArrivalsProducts={newArrivals}
    />
  );
}
