import { Metadata } from "next";
import { initializeApollo } from "@/lib/apollo/apollo-client";
import { GET_COLLECTION_PRODUCTS } from "@/lib/queries/collection";
import LugdiUtils from "@/utils/LugdiUtils";
import { cookies } from "next/headers";
import React from "react";
import ClientCollctionPage from "./ClientCollectionPage";
import { convertSlugToTitle } from "@/utils/SlugToTitle";
import { CollectionData, CollectionProductEdge } from "@/lib/types/collection";

// Collection Page Metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ collectionSlug: string }>;
}): Promise<Metadata> {
  const { collectionSlug } = await params;
  const client = initializeApollo();

  const cookieStore = await cookies();
  const countrySlug = cookieStore.get(LugdiUtils.location_cookieName)?.value;
  const isoCountryCode = countrySlug ? countrySlug.toUpperCase() : "IN";

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

    const collection = data.collectionByHandle;

    const seoTitle =
      collection?.seo.title ||
      `Buy ${collection?.title} Fashion Apparels & Accessories Online`;
    const seoDescription =
      collection?.seo.description ||
      `Discover a wide selection of ${collection?.title} fashion apparels & accessories. Enjoy new arrivals, exclusive deals, and premium quality.`;
    const seoImage = collection?.image?.originalSrc || "";

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
    };
  } catch (error) {
    console.error("Error fetching SEO metadata:", error);
    return {
      title: `Buy ${convertSlugToTitle(
        collectionSlug
      )} Fashion Apparels & Accessories Online`,
      description: `Discover a wide selection of ${convertSlugToTitle(
        collectionSlug
      )} fashion apparels & accessories. Enjoy new arrivals, exclusive deals, and premium quality.`,
    };
  }
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ collectionSlug: string }>;
}) {
  const { collectionSlug } = await params;

  const cookieStore = await cookies();
  const countrySlug = cookieStore.get(LugdiUtils.location_cookieName)?.value;
  const countryName = cookieStore.get(
    LugdiUtils.location_name_country_cookie
  )?.value;
  const isoCountryCode = countrySlug ? countrySlug.toUpperCase() : "IN";

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
  const collection = initialData?.collectionByHandle;
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: collection?.title || convertSlugToTitle(collectionSlug),
    description:
      collection?.seo.description ||
      `Discover a wide selection of ${
        collection?.title || convertSlugToTitle(collectionSlug)
      } fashion apparels & accessories.`,
    image: collection?.image?.originalSrc || "",
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/collections/${collectionSlug}`,
    itemListElement: (collection?.products.edges || []).map(
      (edge: CollectionProductEdge, index: number) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          name: edge.node.title,
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/product/${edge.node.handle}`,
          image: edge.node.images.edges[0]?.node.originalSrc || "",
          offers: {
            "@type": "Offer",
            price: edge.node.variants.edges[0]?.node.price.amount,
            priceCurrency: edge.node.variants.edges[0]?.node.price.currencyCode,
            availability: edge.node.variants.edges[0]?.node.availableForSale
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            ...(edge.node.variants.edges[0]?.node.compareAtPrice && {
              compareAtPrice: {
                "@type": "Offer",
                price: edge.node.variants.edges[0].node.compareAtPrice.amount,
                priceCurrency:
                  edge.node.variants.edges[0].node.compareAtPrice.currencyCode,
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
      <ClientCollctionPage
        initialData={initialData}
        collectionSlug={collectionSlug}
        isoCountryCode={isoCountryCode}
        countryName={countryName}
      />
    </>
  );
}
