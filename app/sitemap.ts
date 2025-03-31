import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lugdi.store";

  // Base URL entry
  const baseEntry: MetadataRoute.Sitemap[0] = {
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1,
  };

  // Entry for the Shopify sitemap index
  const shopifySitemapEntry: MetadataRoute.Sitemap[0] = {
    url: "https://shop.lugdi.store/sitemap.xml", // Point to Shopify's sitemap
    lastModified: new Date(), // Use current date, Shopify manages its own lastModified dates internally
  };

  // Combine all entries
  return [baseEntry, shopifySitemapEntry];
}
