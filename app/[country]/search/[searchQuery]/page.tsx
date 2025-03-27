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

  const client = initializeApollo();

  const cookieStore = await cookies();
  const countrySlug = cookieStore.get(LugdiUtils.location_cookieName)?.value;
  const isoCountryCode = countrySlug ? countrySlug.toUpperCase() : "IN";

  try {
    const { data } = await client.query<ProductsData>({
      query: GET_PRODUCTS,
      variables: {
        first: 1,
        sortKey: "RELEVANCE",
        query: decodedQuery,
        reverse: false,
        country: isoCountryCode,
      },
    });

    if (!data?.products) return notFound();

    const products = data.products;

    const seoTitle: 
  } catch (error) {
    console.error("error fetching products data", error);
    return {
      title: "No Products Found",
    };
  }
}
export default async function SearchPage({
  params,
}: {
  params: Promise<{ searchQuery: string }>;
}) {
  const { searchQuery } = await params;
  const decodedQuery = decodeURIComponent(searchQuery || "");

  const cookieStore = await cookies();
  const countrySlug = cookieStore.get(LugdiUtils.location_cookieName)?.value;
  const isoCountryCode = countrySlug ? countrySlug.toUpperCase() : "IN";

  return <SearchPageClient />;
}
