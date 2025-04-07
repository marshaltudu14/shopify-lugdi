import { MetadataRoute } from "next";
import { countries } from "@/lib/countries"; // Import countries

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lugdi.store";
  const lastModified = new Date(); // Use a consistent date for generated entries

  // Base URL entry
  const baseEntry: MetadataRoute.Sitemap[0] = {
    url: baseUrl,
    lastModified: lastModified,
    changeFrequency: "daily",
    priority: 1,
  };

  // Define standard policy slugs
  const policySlugs = [
    "privacy-policy",
    "refund-policy",
    "shipping-policy",
    "terms-of-service",
  ];

  // Generate policy page entries for each active country
  const policyEntries: MetadataRoute.Sitemap = countries
    .filter((country) => country.active) // Only include active countries
    .flatMap((country) =>
      policySlugs.map((slug) => ({
        url: `${baseUrl}/${country.slug}/policies/${slug}`,
        lastModified: lastModified, // Use consistent date, actual policy update date isn't easily available here
        changeFrequency: "monthly", // Policies usually don't change often
        priority: 0.5, // Lower priority than base or main pages
      }))
    );

  // Entry for the Shopify sitemap index (still useful for products, collections etc.)
  const shopifySitemapEntry: MetadataRoute.Sitemap[0] = {
    url: "https://shop.lugdi.store/sitemap.xml", // Point to Shopify's sitemap
    lastModified: lastModified,
  };

  // Combine all entries
  return [baseEntry, ...policyEntries, shopifySitemapEntry];
}
