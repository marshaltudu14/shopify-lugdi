import React from "react";
import SearchPageClient from "./SearchPageClient";
import { cookies } from "next/headers";
import LugdiUtils from "@/utils/LugdiUtils";
import { Metadata } from "next";
import { initializeApollo } from "@/lib/apollo/apollo-client";
import { ProductsData } from "@/lib/types/products";
import { GET_PRODUCTS } from "@/lib/queries/products";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ searchQuery: string }>;
}): Promise<Metadata> {
  const { searchQuery } = await params;
  const decodedQuery = decodeURIComponent(searchQuery || "");

  const seoTitle = `Search results for "${decodedQuery}"`;
  const seoDescription = `Find products matching "${decodedQuery}" in our store. Browse a wide selection of items with best deals and fast shipping.`;

  return {
    title: seoTitle,
    description: seoDescription,
  };
}
export default async function SearchPage({
  params,
}: {
  params: { searchQuery: string };
}) {
  const { searchQuery } = params;
  const decodedQuery = decodeURIComponent(searchQuery || "");

  const cookieStore = await cookies();
  const countrySlug = cookieStore.get(LugdiUtils.location_cookieName)?.value;
  const isoCountryCode = countrySlug ? countrySlug.toUpperCase() : "IN";

  const client = initializeApollo();

  let searchProducts: ProductsData | null = null;

  try {
    const { data } = await client.query<ProductsData>({
      query: GET_PRODUCTS,
      variables: {
        first: LugdiUtils.product_quantity || 20,
        sortKey: "RELEVANCE",
        query: decodedQuery,
        reverse: false,
        country: isoCountryCode,
      },
    });

    if (!data?.products) return notFound();

    searchProducts = data;
  } catch (error) {
    console.error("error fetching products data", error);
  }

  return (
    <SearchPageClient
      searchProducts={searchProducts}
      initialQuery={decodedQuery}
      isoCountryCode={isoCountryCode}
    />
  );
}
