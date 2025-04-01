import React from "react";
import ClientWishlistPage from "./ClientWishlistPage";
import { Metadata } from "next";
import { countries } from "@/lib/countries";

// Generate metadata dynamically based on the country context
export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country } = await params;
  const currentCountry = countries.find((c) => c.slug === country && c.active);
  const countryName = currentCountry?.name || "Global";
  const siteTitle = `Wishlist`;

  return {
    title: siteTitle,
    description: `Your saved items on Lugdi ${countryName}. Revisit your favorite fashion pieces.`,
    // Add other relevant metadata if needed, e.g., openGraph
    robots: {
      index: false, // Generally don't want wishlists indexed
      follow: true,
    },
  };
}

export default async function WishlistPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  // This server component simply renders the client component
  // The client component will handle fetching and displaying wishlist items
  const { country } = await params;
  return <ClientWishlistPage countryCode={country.toUpperCase()} />;
}
