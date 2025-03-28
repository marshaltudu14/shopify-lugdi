import { initializeApollo } from "@/lib/apollo/apollo-client";
import { GET_ALL_PRODUCTS } from "@/lib/queries/sitemaps";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import LugdiUtils from "@/utils/LugdiUtils";

// Google recommends a maximum of 50,000 URLs per sitemap
const MAX_URLS_PER_SITEMAP = 50000;
const PRODUCTS_PER_PAGE = 250; // Shopify's limit for pagination

// Define TypeScript interfaces for Shopify data
interface ProductNode {
  handle: string;
  updatedAt: string;
}

interface ProductEdge {
  node: ProductNode;
}

interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

interface ProductsData {
  products: {
    edges: ProductEdge[];
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

  // First, determine how many products we have in total to calculate pagination
  let totalProducts = 0;
  let totalPages = 1;
  let hasNextPage = true;
  let endCursor: string | null = null;

  try {
    // Count total products to determine pagination
    while (hasNextPage) {
      const { data } = await client.query<ProductsData>({
        query: GET_ALL_PRODUCTS,
        variables: {
          first: PRODUCTS_PER_PAGE,
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

    // Calculate total pages needed
    totalPages = Math.ceil(totalProducts / MAX_URLS_PER_SITEMAP);

    // If we have multiple pages, return a sitemap index
    if (totalPages > 1) {
      const currentDate = new Date().toISOString();
      const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${Array.from({ length: totalPages }, (_, i) => i + 1)
    .map(
      (page) => `
  <sitemap>
    <loc>${baseUrl}/products-sitemap-${page}</loc>
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

    // If we only have one page, fetch all products and return a regular sitemap
    hasNextPage = true;
    endCursor = null;
    let allProducts: ProductNode[] = [];

    while (hasNextPage) {
      const { data } = await client.query<ProductsData>({
        query: GET_ALL_PRODUCTS,
        variables: {
          first: PRODUCTS_PER_PAGE,
          after: endCursor,
          country: isoCountryCode,
        },
      });

      const products = data.products.edges.map((edge) => ({
        handle: edge.node.handle,
        updatedAt: edge.node.updatedAt,
      }));

      allProducts = [...allProducts, ...products];

      hasNextPage = data.products.pageInfo.hasNextPage;
      endCursor = data.products.pageInfo.endCursor;
    }

    // Generate the sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allProducts
    .map(
      (product) => `
  <url>
    <loc>${baseUrl}/${countrySlug?.toLowerCase() || ""}/product/${
        product.handle
      }</loc>
    <lastmod>${new Date(product.updatedAt).toISOString()}</lastmod>
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
    console.error("Error generating products sitemap:", error);
    return new NextResponse("Error generating sitemap", { status: 500 });
  }
}
