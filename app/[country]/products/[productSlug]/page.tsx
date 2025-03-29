import { initializeApollo } from "@/lib/apollo/apollo-client";
import {
  GET_SINGLE_PRODUCT,
  GET_SINGLE_PRODUCT_RECOMMENDATION,
} from "@/lib/queries/product";
import { Metadata } from "next";
import { convertSlugToTitle } from "@/utils/SlugToTitle";
import { notFound } from "next/navigation";
import { countries } from "@/lib/countries";
import {
  GetSingleProductRecommendationResponse,
  GetSingleProductResponse,
} from "@/lib/types/product";
import ClientProductPage from "./ClientProductPage";

// Define params type for clarity
interface ProductPageParams {
  params: { country: string; productSlug: string };
}

export async function generateMetadata({
  params,
}: ProductPageParams): Promise<Metadata> {
  const { productSlug, country } = await params;
  const client = initializeApollo();

  const isoCountryCode = country ? country.toUpperCase() : "IN";

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lugdi.store";
  const canonicalUrl = `${siteUrl}/${country}/products/${productSlug}`;

  try {
    const { data } = await client.query<GetSingleProductResponse>({
      query: GET_SINGLE_PRODUCT,
      variables: { handle: productSlug, country: isoCountryCode },
    });

    const productData = data.product;

    const seoTitle = productData?.seo?.title || productData?.title;
    const seoDescription = productData?.seo?.description;
    const seoImage = productData?.images?.edges[0]?.node?.url || "";

    return {
      title: seoTitle,
      description: seoDescription,
      openGraph: {
        title: seoTitle,
        description: seoDescription,
        images: [
          {
            url: seoImage,
            alt: productData?.images?.edges[0]?.node?.altText || seoTitle,
          },
        ],
      },
      alternates: {
        canonical: canonicalUrl,
      },
    };
  } catch (error) {
    console.error("Error fetching product SEO data:", error);
    const defaultTitle = `Buy ${convertSlugToTitle(productSlug)} Online`;
    return {
      title: defaultTitle,
      description: `Shop for ${convertSlugToTitle(
        productSlug
      )} and other fashion items at Lugdi.`,
      openGraph: {
        title: defaultTitle,
        description: `Shop for ${convertSlugToTitle(
          productSlug
        )} and other fashion items at Lugdi.`,
      },
      alternates: {
        canonical: canonicalUrl,
      },
    };
  }
}

export default async function ProductPage({ params }: ProductPageParams) {
  const { productSlug, country: countrySlugParam } = await params;

  // Derive country info from params
  const currentCountry = countries.find(
    (c) => c.slug === countrySlugParam && c.active
  );
  const countryName = currentCountry?.name;
  const isoCountryCode = countrySlugParam
    ? countrySlugParam.toUpperCase()
    : "IN";

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lugdi.store";

  let productData: GetSingleProductResponse | null;
  let productRecommendation: GetSingleProductRecommendationResponse | null;

  try {
    const client = initializeApollo();

    const { data: productDataRes } =
      await client.query<GetSingleProductResponse>({
        query: GET_SINGLE_PRODUCT,
        variables: {
          handle: productSlug,
          country: isoCountryCode,
        },
      });

    const { data: productRecommendationRes } =
      await client.query<GetSingleProductRecommendationResponse>({
        query: GET_SINGLE_PRODUCT_RECOMMENDATION,
        variables: {
          productHandle: productSlug,
          country: isoCountryCode,
        },
      });

    productData = productDataRes;
    productRecommendation = productRecommendationRes;
  } catch (error) {
    console.error("Error fetching product data:", error);
    return notFound();
  }

  const product = productData?.product;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    productID: product?.id,
    name: product?.title,
    description: product?.seo?.description || product?.description || "",
    image: product?.images?.edges.map((edge) => edge.node.url) || [],
    url: `${siteUrl}/${countrySlugParam}/products/${productSlug}`,
    brand: {
      "@type": "Brand",
      name:
        product?.tags
          ?.find((tag) => tag.toLowerCase().includes("brand"))
          ?.replace("brand:", "") || `Lugdi ${countryName || "Global"}`,
    },
    offers: {
      "@type": "AggregateOffer",
      url: `${siteUrl}/${countrySlugParam}/products/${productSlug}`,
      priceCurrency:
        product?.variants.edges[0]?.node.price.currencyCode ||
        currentCountry?.currencyCode ||
        "INR",
      lowPrice: Math.min(
        ...(product?.variants.edges.map((edge) =>
          Number(edge.node.price.amount)
        ) || [0])
      ).toFixed(2),
      highPrice: Math.max(
        ...(product?.variants.edges.map((edge) =>
          Number(edge.node.price.amount)
        ) || [0])
      ).toFixed(2),
      itemCondition: "https://schema.org/NewCondition",
      availability: product?.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      offerCount: product?.variants.edges.length || 0,
      offers: product?.variants.edges.map((edge) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Product",
          name: `${product?.title} - ${edge.node.title}`,
          additionalProperty: edge.node.selectedOptions.map((option) => ({
            "@type": "PropertyValue",
            name: option.name,
            value: option.value,
          })),
        },
        price: Number(edge.node.price.amount),
        priceCurrency:
          edge.node.price.currencyCode || currentCountry?.currencyCode || "INR",
        availability: edge.node.availableForSale
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      })),
      seller: {
        "@type": "Organization",
        name: `Lugdi ${countryName || "Global"}`,
      },
    },
    isRelatedTo:
      productRecommendation?.productRecommendations?.map((rec) => ({
        "@type": "Product",
        name: rec.title,
        url: `${siteUrl}/${countrySlugParam}/products/${rec.handle}`,
        image: rec.featuredImage?.url,
        offers: {
          "@type": "Offer",
          price: Number(rec.priceRange.minVariantPrice.amount),
          priceCurrency: rec.priceRange.minVariantPrice.currencyCode,
        },
      })) || [],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ClientProductPage
        productData={productData}
        recommendationsData={productRecommendation}
      />
    </>
  );
}
