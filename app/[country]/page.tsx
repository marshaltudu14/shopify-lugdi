import { banners, countries, Country, Banner } from "@/lib/countries";
import React from "react";
import CountryPageClient from "./CountryPageClient";
import { CollectionData, CollectionProductNode } from "@/lib/types/collection";
import { Metadata } from "next";
import getCollectionProducts from "@/lib/mock-data/getCollectionProducts.json";
import menuData from "@/lib/mock-data/menu.json";
import { GetCollectionsByMenuResponse } from "@/lib/queries/menu"; // Keep type for now

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

  const menCollectionsMenu: GetCollectionsByMenuResponse = { menu: { items: menuData.menu.items.filter((item: any) => item.resource?.__typename === 'Collection' && item.resource.handle === 'men-collections') } };
  const womenCollectionsMenu: GetCollectionsByMenuResponse = { menu: { items: menuData.menu.items.filter((item: any) => item.resource?.__typename === 'Collection' && item.resource.handle === 'women-collections') } };

  const newArrivalsCollectionData = (getCollectionProducts as any[]).find((collection: any) => collection.handle === 'new-arrivals');
  const mensCollectionData = (getCollectionProducts as any[]).find((collection: any) => collection.handle === 'mens-collection');
  const womensCollectionData = (getCollectionProducts as any[]).find((collection: any) => collection.handle === 'womens-collection');
  const bestSellingCollectionData = (getCollectionProducts as any[]).find((collection: any) => collection.handle === 'best-sellers');
  const storiesOfUsCollectionData = (getCollectionProducts as any[]).find((collection: any) => collection.handle === 'stories-of-us');

  const newArrivalsProducts = newArrivalsCollectionData?.products?.edges?.map((edge: any) => edge.node) || [];
  const mensProducts = mensCollectionData?.products?.edges?.map((edge: any) => edge.node) || [];
  const womensProducts = womensCollectionData?.products?.edges?.map((edge: any) => edge.node) || [];
  const bestSellingProducts = bestSellingCollectionData?.products?.edges?.map((edge: any) => edge.node) || [];
  const storiesOfUsProducts = storiesOfUsCollectionData?.products?.edges?.map((edge: any) => edge.node) || [];

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
