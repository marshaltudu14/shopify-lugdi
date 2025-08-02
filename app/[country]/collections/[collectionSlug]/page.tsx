import { Metadata } from "next";
import React from "react";
import { convertSlugToTitle } from "@/utils/SlugToTitle";
import { CollectionData, CollectionProductEdge } from "@/lib/types/collection";
import ClientCollectionPage from "./ClientCollectionPage";
import { notFound } from "next/navigation";
import LugdiUtils from "@/utils/LugdiUtils";
import getCollectionProducts from "@/lib/mock-data/getCollectionProducts.json";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string; collectionSlug: string }>;
}): Promise<Metadata> {
  const { collectionSlug, country } = await params;

  const isoCountryCode = country ? country.toUpperCase() : "IN";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lugdi.store";
  const canonicalUrl = `${siteUrl}/${country}/collections/${collectionSlug}`;

  const collection = (getCollectionProducts as any[]).find(c => c.handle === collectionSlug);

  if (!collection) return notFound();

  const seoTitle =
    collection?.seo?.title ||
    `Buy ${collection?.title} Fashion Apparels & Accessories Online`;
  // Implement description fallback: SEO -> Collection Description -> Default
  const seoDescription =
    collection?.seo?.description ??
    collection?.description ??
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
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ collectionSlug: string; country: string }>;
}) {
  const { collectionSlug, country } = await params;
  const isoCountryCode = country ? country.toUpperCase() : "IN";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lugdi.store";

  const initialData = (getCollectionProducts as any[]).find(c => c.handle === collectionSlug);

  if (!initialData) {
    return notFound();
  }

  const collection = initialData;
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
    itemListElement: collection.products.edges.map(
      (edge: CollectionProductEdge, index: number) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          name: edge.node.title,
          url: `${siteUrl}/${country}/products/${edge.node.handle}`,
          image: edge.node.featuredImage?.url || "",
          description: edge.node.description || edge.node.seo?.description || `Buy ${edge.node.title} at Lugdi.`,
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
            hasMerchantReturnPolicy: {
              "@type": "MerchantReturnPolicy",
              name: "Refund Policy",
              url: "https://shop.lugdi.store/policies/refund-policy",
              returnPolicyCategory: "RefundPolicy"
            },
            shippingDetails: {
              "@type": "OfferShippingDetails",
              shippingDestination: {
                "@type": "DefinedRegion",
                addressCountry: isoCountryCode
              },
              shippingRate: {
                "@type": "MonetaryAmount",
                value: 0,
                currency: edge.node.priceRange.minVariantPrice.currencyCode
              },
              deliveryTime: {
                "@type": "ShippingDeliveryTime",
                businessDays: {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday"
                  ]
                },
                handlingTime: {
                  "@type": "QuantitativeValue",
                  minValue: 1,
                  maxValue: 2,
                  unitCode: "d"
                },
                transitTime: {
                  "@type": "QuantitativeValue",
                  minValue: 2,
                  maxValue: 7,
                  unitCode: "d"
                }
              },
              shippingPolicy: "https://shop.lugdi.store/policies/shipping-policy"
            }
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
