import type { MetadataRoute } from "next";
import { fetchShopifySitemapResources } from "@/lib/shopifySitemapFetcher";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const country = "in";
  const items = await fetchShopifySitemapResources(country, "PAGE");

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lugdi.store";

  return items.map((item) => ({
    url: `${baseUrl}/${country}/pages/${item.handle}`,
    lastModified: new Date(item.updatedAt),
  }));
}
