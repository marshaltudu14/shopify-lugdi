import { fetchShopifySitemapResources } from "@/lib/shopifySitemapFetcher";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { country: string } }) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lugdi.store";
  const country = params.country;

  const items = await fetchShopifySitemapResources(country, "METAOBJECT");

  const urlEntries = items
    .map(
      (item) => `
    <url>
      <loc>${baseUrl}/${country}/metaobjects/${item.handle}</loc>
      <lastmod>${item.updatedAt}</lastmod>
    </url>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urlEntries}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
