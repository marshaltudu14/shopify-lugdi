import { Metadata } from "next";
import { initializeApollo } from "@/lib/apollo/apollo-client";
import { GET_COLLECTION_PRODUCTS } from "@/lib/queries/collection";
import React from "react";
import { convertSlugToTitle } from "@/utils/SlugToTitle";
import { CollectionData, CollectionProductEdge } from "@/lib/types/collection";
import ClientCollectionPage from "./ClientCollectionPage";
import { notFound } from "next/navigation";
import LugdiUtils from "@/utils/LugdiUtils";

// Define params type
interface CollectionPageParams {
  params: { country: string; collectionSlug: string };
}

// Collection Page Metadata
export async function generateMetadata({
  params,
}: CollectionPageParams): Promise<Metadata> {
  const { collectionSlug, country } = await params;
  const client = initializeApollo();

  const isoCountryCode = country ? country.toUpperCase() : "IN";

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lugdi.store";
  const canonicalUrl = `${siteUrl}/${country}/collections/${collectionSlug}`;

  try {
    const { data } = await client.query<CollectionData>({
      query: GET_COLLECTION_PRODUCTS,
      variables: {
        handle: collectionSlug,
        first: 1,
        sortKey: "RELEVANCE",
        reverse: false,
        country: isoCountryCode,
      },
    });

    if (!data?.collection) return notFound();

    const collection = data.collection;

    const seoTitle =
      collection?.seo?.title ||
      `Buy ${collection?.title} Fashion Apparels & Accessories Online`;
    const seoDescription =
      collection?.seo?.description ||
      `Discover a wide selection of ${collection?.title} fashion apparels & accessories. Enjoy new arrivals, exclusive deals, and premium quality.`;
    const seoImage = collection?.image?.url || "";

    return {
      title: seoTitle,
      description: seoDescription,
      openGraph: {
        title: seoTitle,
        description: seoDescription,
        images: [
          {
            url: seoImage,
            alt: collection?.image?.altText || seoTitle,
          },
        ],
      },
      alternates: {
        canonical: canonicalUrl,
      },
    };
  } catch (error) {
    console.error("Error fetching Collection SEO metadata:", error);
    return {
      title: `Buy ${convertSlugToTitle(
        collectionSlug
      )} Fashion Apparels & Accessories Online`,
      description: `Discover a wide selection of ${convertSlugToTitle(
        collectionSlug
      )} fashion apparels & accessories. Enjoy new arrivals, exclusive deals, and premium quality.`,
      alternates: {
        canonical: canonicalUrl,
      },
    };
  }
}

export default async function CollectionPage({ params }: CollectionPageParams) {
  const { collectionSlug, country } = await params;

  const isoCountryCode = country ? country.toUpperCase() : "IN";

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lugdi.store";

  let initialData: CollectionData | null;
  try {
    const client = initializeApollo();
    const { data } = await client.query<CollectionData>({
      query: GET_COLLECTION_PRODUCTS,
      variables: {
        handle: collectionSlug,
        first: LugdiUtils.product_quantity || 20,
        sortKey: "RELEVANCE",
        reverse: false,
        country: isoCountryCode,
      },
    });
    initialData = data;
  } catch (error) {
    console.error("Error fetching collection:", error);
    initialData = null;
  }

  // Prepare JSON-LD for the collection
  const collection = initialData?.collection;
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: collection?.title || convertSlugToTitle(collectionSlug),
    description:
      collection?.seo?.description ||
      `Discover a wide selection of ${
        collection?.title || convertSlugToTitle(collectionSlug)
      } fashion apparels & accessories.`,
    image: collection?.image?.url || "",
    url: `${siteUrl}/${country}/collections/${collectionSlug}`,
    itemListElement: (collection?.products.edges || []).map(
      (edge: CollectionProductEdge, index: number) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          name: edge.node.title,
          url: `${siteUrl}/${country}/products/${edge.node.handle}`,
          image: edge.node.featuredImage?.url || "",
          offers: {
            "@type": "Offer",
            price: Number(edge.node.priceRange.minVariantPrice.amount),
            priceCurrency: edge.node.priceRange.minVariantPrice.currencyCode,
            availability: edge.node.availableForSale
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            ...(edge.node.compareAtPriceRange.minVariantPrice.amount && {
              compareAtPrice: {
                "@type": "Offer",
                price: Number(
                  edge.node.compareAtPriceRange.minVariantPrice.amount
                ),
                priceCurrency:
                  edge.node.compareAtPriceRange.minVariantPrice.currencyCode,
              },
            }),
          },
        },
      })
    ),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionJsonLd),
        }}
      />
      <ClientCollectionPage
        initialData={initialData}
        collectionSlug={collectionSlug}
        isoCountryCode={isoCountryCode}
      />
    </>
  );
}
