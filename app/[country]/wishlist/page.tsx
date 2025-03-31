import React from "react";
import ClientWishlistPage from "./ClientWishlistPage";
import { Metadata } from "next";
import { countries } from "@/lib/countries";

interface WishlistPageParams {
  params: { country: string };
}

// Generate metadata dynamically based on the country context
export async function generateMetadata({
  params,
}: WishlistPageParams): Promise<Metadata> {
  const { country } = params;
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

export default function WishlistPage({ params }: WishlistPageParams) {
  // This server component simply renders the client component
  // The client component will handle fetching and displaying wishlist items
  return <ClientWishlistPage countryCode={params.country.toUpperCase()} />;
}
