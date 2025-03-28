import { initializeApollo } from "@/lib/apollo/apollo-client";
import { GET_ALL_COLLECTIONS, GET_ALL_PRODUCTS } from "@/lib/queries/sitemaps";
import { NextResponse } from "next/server";

// Google recommends a maximum of 50,000 URLs per sitemap
const MAX_URLS_PER_SITEMAP = 50000;
const ITEMS_PER_PAGE = 250; // Shopify's limit for pagination

// Define TypeScript interfaces for Shopify data
interface CollectionNode {
  handle: string;
  updatedAt: string;
}

interface ProductNode {
  handle: string;
  updatedAt: string;
}

interface Edge<T> {
  node: T;
}

interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

interface CollectionsData {
  collections: {
    edges: Edge<CollectionNode>[];
    pageInfo: PageInfo;
  };
}

interface ProductsData {
  products: {
    edges: Edge<ProductNode>[];
    pageInfo: PageInfo;
  };
}

export async function GET() {
  const client = initializeApollo();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lugdi.store";
  const currentDate = new Date().toISOString();
  const isoCountryCode = "IN"; // Default to India

  // Initialize sitemap entries with the main sitemap
  const sitemapEntries = [
    {
      loc: `${baseUrl}/sitemap.xml`,
      lastmod: currentDate,
    },
  ];

  try {
    // Count collections to determine pagination
    let totalCollections = 0;
    let hasNextPage = true;
    let endCursor: string | null = null;

    while (hasNextPage) {
      const { data } = await client.query({
        query: GET_ALL_COLLECTIONS,
        variables: {
          first: ITEMS_PER_PAGE,
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

    // Calculate collection pages needed
    const collectionPages = Math.ceil(totalCollections / MAX_URLS_PER_SITEMAP);

    // Add collection sitemap entries
    if (collectionPages > 1) {
      // Add paginated collection sitemaps
      for (let i = 1; i <= collectionPages; i++) {
        sitemapEntries.push({
          loc: `${baseUrl}/collections-sitemap-${i}`,
          lastmod: currentDate,
        });
      }
    } else {
      // Add single collection sitemap
      sitemapEntries.push({
        loc: `${baseUrl}/collections-sitemap.xml`,
        lastmod: currentDate,
      });
    }

    // Count products to determine pagination
    let totalProducts = 0;
    hasNextPage = true;
    endCursor = null;

    while (hasNextPage) {
      const { data } = await client.query({
        query: GET_ALL_PRODUCTS,
        variables: {
          first: ITEMS_PER_PAGE,
          after: endCursor,
          country: isoCountryCode,
        },
      });

      totalProducts += data.products.edges.length;
      hasNextPage = data.products.pageInfo.hasNextPage;
      endCursor = data.products.pageInfo.endCursor;

      // Break early if we've determined we need multiple pages
      if (totalProducts > MAX_URLS_PER_SITEMAP) {
        break;
      }
    }

    // Calculate product pages needed
    const productPages = Math.ceil(totalProducts / MAX_URLS_PER_SITEMAP);

    // Add product sitemap entries
    if (productPages > 1) {
      // Add paginated product sitemaps
      for (let i = 1; i <= productPages; i++) {
        sitemapEntries.push({
          loc: `${baseUrl}/products-sitemap-${i}`,
          lastmod: currentDate,
        });
      }
    } else {
      // Add single product sitemap
      sitemapEntries.push({
        loc: `${baseUrl}/products-sitemap.xml`,
        lastmod: currentDate,
      });
    }
  } catch (error) {
    console.error("Error generating sitemap index:", error);

    // Fallback to static sitemap entries if there's an error
    sitemapEntries.push(
      {
        loc: `${baseUrl}/collections-sitemap.xml`,
        lastmod: currentDate,
      },
      {
        loc: `${baseUrl}/products-sitemap.xml`,
        lastmod: currentDate,
      }
    );
  }

  // Generate the sitemap index XML
  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemapEntries
    .map(
      (entry) => `
  <sitemap>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
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
