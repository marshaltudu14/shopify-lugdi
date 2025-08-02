import React from "react";
import SearchPageClient from "./SearchPageClient";
import { cookies } from "next/headers";
import LugdiUtils from "@/utils/LugdiUtils";
import { Metadata } from "next";
import { ProductsData } from "@/lib/types/products";
import mockProductsData from "@/lib/mock-data/products.json";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ searchQuery: string; country: string }>;
}): Promise<Metadata> {
  const { searchQuery } = await params;
  const decodedQuery = decodeURIComponent(searchQuery || "");

  const seoTitle = `Search results for "${decodedQuery}"`;
  const seoDescription = `Find products matching "${decodedQuery}" in our store. Browse a wide selection of items with best deals and fast shipping.`;

  return {
    title: seoTitle,
    description: seoDescription,
  };
}
export default async function SearchPage({
  params,
}: {
  params: Promise<{ searchQuery: string; country: string }>;
}) {
  const { searchQuery } = await params;
  const decodedQuery = decodeURIComponent(searchQuery || "");

  const cookieStore = await cookies();
  const countrySlug = cookieStore.get(LugdiUtils.location_cookieName)?.value;
  const isoCountryCode = countrySlug ? countrySlug.toUpperCase() : "IN";

  // Use mock data for search - filter products based on search query
  const filteredProducts = mockProductsData.filter(product =>
    product.title.toLowerCase().includes(decodedQuery.toLowerCase()) ||
    product.handle.toLowerCase().includes(decodedQuery.toLowerCase())
  );

  // Convert basic products to full ProductsNode structure
  const productsWithFullData = filteredProducts.map(product => ({
    ...product,
    description: `High-quality ${product.title.toLowerCase()} with excellent craftsmanship.`,
    seo: {
      title: product.title,
      description: `Shop ${product.title.toLowerCase()} at great prices.`
    },
    options: [],
    variants: {
      edges: []
    }
  }));

  const searchProducts: ProductsData = {
    products: {
      edges: productsWithFullData.map((p, i) => ({ cursor: String(i + 1), node: p })),
      pageInfo: {
        hasNextPage: false,
        endCursor: String(productsWithFullData.length),
      },
    },
  };

  if (filteredProducts.length === 0) {
    // Still return the component but with empty results instead of 404
    // return notFound();
  }

  return (
    <SearchPageClient
      searchProducts={searchProducts}
      initialQuery={decodedQuery}
      isoCountryCode={isoCountryCode}
    />
  );
}
