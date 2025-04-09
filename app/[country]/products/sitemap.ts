import type { MetadataRoute } from "next";
import { fetchShopifySitemapResources } from "@/lib/shopifySitemapFetcher";

const CHUNK_SIZE = 5000; // Shopify limit is 50,000, but safer to use smaller chunks

export async function generateSitemaps() {
  const country = process.env.COUNTRY_SLUG ?? "[country]";
  const allItems = await fetchShopifySitemapResources(country, "PRODUCT");
  const total = allItems.length;
  const chunks = Math.ceil(total / CHUNK_SIZE);

  return Array.from({ length: chunks }, (_, i) => ({ id: i }));
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const country = process.env.COUNTRY_SLUG ?? "[country]";
  const allItems = await fetchShopifySitemapResources(country, "PRODUCT");

  const start = id * CHUNK_SIZE;
  const end = start + CHUNK_SIZE;
  const items = allItems.slice(start, end);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lugdi.store";

  return items.map((item) => ({
    url: `${baseUrl}/${country}/products/${item.handle}`,
    lastModified: new Date(item.updatedAt),
  }));
}
