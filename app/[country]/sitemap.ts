import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lugdi.store";
  const now = new Date();
  const countrySlug = process.env.COUNTRY_SLUG ?? "in"; // Default to 'in' for now

  const resourceTypes = ["collections", "products", "blogs", "articles", "pages", "metaobjects"];

  const entries: MetadataRoute.Sitemap = resourceTypes.map((type) => ({
    url: `${baseUrl}/${countrySlug}/${type}/sitemap.xml`,
    lastModified: now,
  }));

  const policySlugs = [
    "privacy-policy",
    "refund-policy",
    "shipping-policy",
    "terms-of-service",
  ];

  policySlugs.forEach((slug) => {
    entries.push({
      url: `${baseUrl}/${countrySlug}/policies/${slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    });
  });

  return entries;
}
