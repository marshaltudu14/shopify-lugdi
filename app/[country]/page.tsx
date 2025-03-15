import { banners, countries, Country, Banner } from "@/lib/countries";
import React from "react";
import CountryPageClient from "./CountryPageClient";

export default async function CountryHomePage({
  params,
}: {
  params: Promise<{ country: string; countrySlug: string }>;
}) {
  const { country: countrySlug } = await params;

  const country: Country | null =
    countries.find((c) => c.slug === countrySlug) || null;
  const bannerData: Banner[] = banners[countrySlug] || [];

  return <CountryPageClient country={country} banners={bannerData} />;
}
