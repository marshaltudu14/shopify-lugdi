import { banners, countries, Country, Banner } from "@/lib/countries";
import React from "react";
import CountryPageClient from "./CountryPageClient";
import { Metadata } from "next";
import menuData from "@/lib/mock-data/menu.json";
import { CollectionNode } from "@/lib/types/collection";
import { getMockCollectionProducts } from "@/lib/utils/mockDataParser";

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

  const menCollectionsMenu = { menu: { items: menuData.menu.items.filter((item) => item.resource && item.resource.__typename === 'Collection' && item.resource.handle === 'men-collections') } };
  const womenCollectionsMenu = { menu: { items: menuData.menu.items.filter((item) => item.resource && item.resource.__typename === 'Collection' && item.resource.handle === 'women-collections') } };

  const newArrivalsCollectionData = getMockCollectionProducts().find((collection: CollectionNode) => collection.handle === 'new-arrivals');
  const mensCollectionData = getMockCollectionProducts().find((collection: CollectionNode) => collection.handle === 'mens-collection');
  const womensCollectionData = getMockCollectionProducts().find((collection: CollectionNode) => collection.handle === 'womens-collection');
  const bestSellingCollectionData = getMockCollectionProducts().find((collection: CollectionNode) => collection.handle === 'best-sellers');
  const storiesOfUsCollectionData = getMockCollectionProducts().find((collection: CollectionNode) => collection.handle === 'stories-of-us');

  const newArrivalsProducts = newArrivalsCollectionData?.products?.edges?.map((edge) => edge.node) || [];
  const mensProducts = mensCollectionData?.products?.edges?.map((edge) => edge.node) || [];
  const womensProducts = womensCollectionData?.products?.edges?.map((edge) => edge.node) || [];
  const bestSellingProducts = bestSellingCollectionData?.products?.edges?.map((edge) => edge.node) || [];
  const storiesOfUsProducts = storiesOfUsCollectionData?.products?.edges?.map((edge) => edge.node) || [];

  const country: Country | null =
    countries.find((c) => c.slug === countrySlug) || null;

  const finalBanners: Banner[] = banners[countrySlug] || [];

  return (
    <CountryPageClient
      country={country}
      banners={finalBanners}
      menCollectionsMenu={menCollectionsMenu}
      womenCollectionsMenu={womenCollectionsMenu}
      newArrivalsProducts={newArrivalsProducts}
      mensProducts={mensProducts}
      womensProducts={womensProducts}
      bestSellingProducts={bestSellingProducts}
      storiesOfUsProducts={storiesOfUsProducts}
    />
  );
}