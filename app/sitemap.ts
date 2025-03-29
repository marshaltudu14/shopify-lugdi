import { MetadataRoute } from "next";
import { countries } from "@/lib/countries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lugdi.store";

  // Base URL entry
  const baseEntry: MetadataRoute.Sitemap[0] = {
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1,
  };

  // Generate entries for active countries
  const countryEntries: MetadataRoute.Sitemap = countries
    .filter((country) => country.active) // Filter for active countries
    .map((country) => ({
      url: `${baseUrl}/${country.slug.toLowerCase()}`,
      lastModified: new Date(),
      changeFrequency: "daily", // Or 'weekly'/'monthly' depending on how often country pages change
      priority: 0.9, // Slightly lower priority than the homepage
    }));

  // Entry for the Shopify sitemap index
  const shopifySitemapEntry: MetadataRoute.Sitemap[0] = {
    url: "https://shop.lugdi.store/sitemap.xml", // Point to Shopify's sitemap
    lastModified: new Date(), // Use current date, Shopify manages its own lastModified dates internally
  };

  // Combine all entries
  return [baseEntry, ...countryEntries, shopifySitemapEntry];
}
