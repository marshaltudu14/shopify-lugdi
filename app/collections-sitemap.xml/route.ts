import { initializeApollo } from "@/lib/apollo/apollo-client";
import { GET_ALL_COLLECTIONS } from "@/lib/queries/sitemaps";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import LugdiUtils from "@/utils/LugdiUtils";

// Google recommends a maximum of 50,000 URLs per sitemap
const MAX_URLS_PER_SITEMAP = 50000;
const COLLECTIONS_PER_PAGE = 250; // Shopify's limit for pagination

// Define TypeScript interfaces for Shopify data
interface CollectionNode {
  handle: string;
  updatedAt: string;
}

interface CollectionEdge {
  node: CollectionNode;
}

interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

interface CollectionsData {
  collections: {
    edges: CollectionEdge[];
    pageInfo: PageInfo;
  };
}

export async function GET() {
  const client = initializeApollo();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lugdi.store";

  // Get country from cookies
  const cookieStore = await cookies();
  const countrySlug = cookieStore.get(LugdiUtils.location_cookieName)?.value;
  const isoCountryCode = countrySlug ? countrySlug.toUpperCase() : "IN";

  // First, determine how many collections we have in total to calculate pagination
  let totalCollections = 0;
  let totalPages = 1;
  let hasNextPage = true;
  let endCursor: string | null = null;

  try {
    // Count total collections to determine pagination
    while (hasNextPage) {
      const { data } = await client.query<CollectionsData>({
        query: GET_ALL_COLLECTIONS,
        variables: {
          first: COLLECTIONS_PER_PAGE,
          after: endCursor,
          country: isoCountryCode,
        },
      });

      totalCollections += data.collections.edges.length;
      hasNextPage = data.collections.pageInfo.hasNextPage;
      endCursor = data.collections.pageInfo.endCursor;

      // Break early if we've determined we need multiple pages
      if (totalCollections > MAX_URLS_PER_SITEMAP) {
        break;
      }
    }

    // Calculate total pages needed
    totalPages = Math.ceil(totalCollections / MAX_URLS_PER_SITEMAP);

    // If we have multiple pages, return a sitemap index
    if (totalPages > 1) {
      const currentDate = new Date().toISOString();
      const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${Array.from({ length: totalPages }, (_, i) => i + 1)
    .map(
      (page) => `
  <sitemap>
    <loc>${baseUrl}/collections-sitemap-${page}</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>`
    )
    .join("")}
</sitemapindex>`;

      return new NextResponse(sitemapIndex, {
        headers: {
          "Content-Type": "application/xml",
        },
      });
    }

    // If we only have one page, fetch all collections and return a regular sitemap
    hasNextPage = true;
    endCursor = null;
    let allCollections: CollectionNode[] = [];

    while (hasNextPage) {
      const { data } = await client.query<CollectionsData>({
        query: GET_ALL_COLLECTIONS,
        variables: {
          first: COLLECTIONS_PER_PAGE,
          after: endCursor,
          country: isoCountryCode,
        },
      });

      const collections = data.collections.edges.map((edge) => ({
        handle: edge.node.handle,
        updatedAt: edge.node.updatedAt,
      }));

      allCollections = [...allCollections, ...collections];

      hasNextPage = data.collections.pageInfo.hasNextPage;
      endCursor = data.collections.pageInfo.endCursor;
    }

    // Generate the sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allCollections
    .map(
      (collection) => `
  <url>
    <loc>${baseUrl}/${countrySlug?.toLowerCase() || ""}/collections/${
        collection.handle
      }</loc>
    <lastmod>${new Date(collection.updatedAt).toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join("")}
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  } catch (error) {
    console.error("Error generating collections sitemap:", error);
    return new NextResponse("Error generating sitemap", { status: 500 });
  }
}
