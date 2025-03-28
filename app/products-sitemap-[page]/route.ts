import { initializeApollo } from "@/lib/apollo/apollo-client";
import { GET_ALL_PRODUCTS } from "@/lib/queries/sitemaps";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import LugdiUtils from "@/utils/LugdiUtils";

// Shopify's limit for pagination
const PRODUCTS_PER_PAGE = 250;

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

  let products: ProductNode[] = [];
  let hasNextPage = true;
  let endCursor: string | null = null;
  let currentPage = 1;

  // Fetch products with pagination until we reach the desired page
  while (hasNextPage) {
    try {
      const { data } = await client.query<ProductsData>({
        query: GET_ALL_PRODUCTS,
        variables: {
          first: PRODUCTS_PER_PAGE,
          after: endCursor,
          country: isoCountryCode,
        },
      });

      // If we're on the page we want, store the products
      if (currentPage === pageNumber) {
        products = data.products.edges.map((edge) => ({
          handle: edge.node.handle,
          updatedAt: edge.node.updatedAt,
        }));
        break;
      }

      // Otherwise, continue pagination
      hasNextPage = data.products.pageInfo.hasNextPage;
      endCursor = data.products.pageInfo.endCursor;
      currentPage++;

      // If there are no more pages, break
      if (!hasNextPage) {
        return new NextResponse("Page not found", { status: 404 });
      }
    } catch (error) {
      console.error(
        `Error fetching products for sitemap page ${pageNumber}:`,
        error
      );
      return new NextResponse("Error generating sitemap", { status: 500 });
    }
  }

  // If no products were found for this page
  if (products.length === 0) {
    return new NextResponse("Page not found", { status: 404 });
  }

  // Generate the sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${products
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
}
