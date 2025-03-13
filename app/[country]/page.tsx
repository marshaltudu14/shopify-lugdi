import { banners, countries, Country, Banner } from "@/lib/countries";
import React from "react";
import CountryPageClient from "./CountryPageClient";

interface CountryHomePageProps {
  params: {
    country: string;
  };
}

export default async function CountryHomePage({
  params,
}: CountryHomePageProps) {
  const { country: countrySlug } = params;

  const country: Country | null =
    countries.find((c) => c.slug === countrySlug) || null;
  const bannerData: Banner[] = banners[countrySlug] || [];

  return <CountryPageClient country={country} banners={bannerData} />;
}
