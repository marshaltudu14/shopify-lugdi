import React from "react";
import SearchPageClient from "./SearchPageClient";
import { Metadata } from "next";
import { initializeApollo } from "@/lib/apollo/apollo-client";
import { cookies } from "next/headers";
import LugdiUtils from "@/utils/LugdiUtils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ searchQuery: string }>;
}): Promise<Metadata> {
  const { searchQuery } = await params;
  const client = initializeApollo();

  const cookieStore = await cookies();
  const countrySlug = cookieStore.get(LugdiUtils.location_cookieName)?.value;
  const isoCountryCode = countrySlug ? countrySlug.toUpperCase() : "IN";
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
