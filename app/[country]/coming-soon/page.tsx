import { Metadata } from "next";
import { notFound } from "next/navigation";
import { countries } from "@/lib/countries";
import ComingSoonClient from "./ComingSoonClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ countrySlug: string }>;
}): Promise<Metadata> {
  const { countrySlug } = await params;
  const country = countries.find(
    (c) => c.slug.toLowerCase() === countrySlug.toLowerCase()
  );

  if (!country) {
    return {
      title: "Country Not Found",
    };
  }

  return {
    title: `Dropping Soon in ${country.name}`,
    description: `Get ready, ${country.name}! We’re bringing the freshest designs and boldest fashion vibes your way—style crafted for everyone, with a next-level edge.`,
    openGraph: {
      title: `Dropping Soon in ${country.name}`,
      description: `The next wave of fashion is coming to ${country.name}. Discover designs that speak to all, blending innovation and top-tier style.`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Dropping Soon in ${country.name}`,
      description: `Style for everyone, redefined. Stay tuned for our next-gen fashion drop in ${country.name}!`,
    },
  };
}

export default async function CountryPage({
  params,
}: {
  params: Promise<{ countrySlug: string }>;
}) {
  const { countrySlug } = await params;
  const country = countries.find(
    (c) => c.slug.toLowerCase() === countrySlug.toLowerCase()
  );

  if (!country) {
    notFound();
  }

  return <ComingSoonClient country={country} />;
}
