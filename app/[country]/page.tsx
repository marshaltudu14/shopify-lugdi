import { banners, countries, Country, Banner } from "@/lib/countries";
import React from "react";
import CountryPageClient from "./CountryPageClient";
import { initializeApollo } from "@/lib/apollo/apollo-client";
import { ProductsData } from "@/lib/types/products";
import { GET_PRODUCTS } from "@/lib/queries/products";
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
}: {
  params: Promise<{ country: string }>;
}) {
  const { country: countrySlug } = await params;

  const isoCountryCode = countrySlug ? countrySlug.toUpperCase() : "IN";

  // Update variable declarations for menu data
  let menCollectionsMenu: GetCollectionsByMenuResponse | null = null;
  let womenCollectionsMenu: GetCollectionsByMenuResponse | null = null;
  let newArrivals: ProductsData | null = null;

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

    // Fetch new arrivals (unchanged)
    const { data: newArrivalsData } = await client.query<ProductsData>({
      query: GET_PRODUCTS,
      variables: {
        first: 12,
        sortKey: "CREATED_AT",
        reverse: true,
        country: isoCountryCode,
      },
    });

    // Assign fetched menu data
    menCollectionsMenu = menMenuData;
    womenCollectionsMenu = womenMenuData;
    newArrivals = newArrivalsData;
  } catch (error) {
    // Update catch block assignments
    menCollectionsMenu = null;
    womenCollectionsMenu = null;
    newArrivals = null;
    console.error("Error fetching homepage data:", error); // Updated error message
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
      newArrivalsProducts={newArrivals}
    />
  );
}
