import type { MetadataRoute } from "next";
import { countries } from "@/lib/countries";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lugdi.store";
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    // Add base URL entry
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  // Add links to active country sitemaps
  countries
    .filter((c) => c.active)
    .forEach((country) => {
      entries.push({
        url: `${baseUrl}/${country.slug}/sitemap.xml`,
        lastModified: now,
      });
    });

  return entries;
}
