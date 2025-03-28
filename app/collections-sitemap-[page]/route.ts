import { initializeApollo } from "@/lib/apollo/apollo-client";
import { GET_ALL_COLLECTIONS } from "@/lib/queries/sitemaps";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import LugdiUtils from "@/utils/LugdiUtils";

// Shopify's limit for pagination
const COLLECTIONS_PER_PAGE = 250;

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

export async function GET(
  request: NextRequest,
  { params }: { params: { page: string } }
) {
  const pageNumber = parseInt(params.page, 10);

  // Validate page number
  if (isNaN(pageNumber) || pageNumber < 1) {
    return new NextResponse("Invalid page number", { status: 400 });
  }

  const client = initializeApollo();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lugdi.store";

  // Get country from cookies
  const cookieStore = await cookies();
  const countrySlug = cookieStore.get(LugdiUtils.location_cookieName)?.value;
  const isoCountryCode = countrySlug ? countrySlug.toUpperCase() : "IN";

  let collections: CollectionNode[] = [];
  let hasNextPage = true;
  let endCursor: string | null = null;
  let currentPage = 1;

  // Fetch collections with pagination until we reach the desired page
  while (hasNextPage) {
    try {
      const { data } = await client.query<CollectionsData>({
        query: GET_ALL_COLLECTIONS,
        variables: {
          first: COLLECTIONS_PER_PAGE,
          after: endCursor,
          country: isoCountryCode,
        },
      });

      // If we're on the page we want, store the collections
      if (currentPage === pageNumber) {
        collections = data.collections.edges.map((edge) => ({
          handle: edge.node.handle,
          updatedAt: edge.node.updatedAt,
        }));
        break;
      }

      // Otherwise, continue pagination
      hasNextPage = data.collections.pageInfo.hasNextPage;
      endCursor = data.collections.pageInfo.endCursor;
      currentPage++;

      // If there are no more pages, break
      if (!hasNextPage) {
        return new NextResponse("Page not found", { status: 404 });
      }
    } catch (error) {
      console.error(
        `Error fetching collections for sitemap page ${pageNumber}:`,
        error
      );
      return new NextResponse("Error generating sitemap", { status: 500 });
    }
  }

  // If no collections were found for this page
  if (collections.length === 0) {
    return new NextResponse("Page not found", { status: 404 });
  }

  // Generate the sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${collections
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
}
