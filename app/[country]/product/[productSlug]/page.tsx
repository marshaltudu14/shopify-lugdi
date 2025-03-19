import { initializeApollo } from "@/lib/apollo/apollo-client";
import {
  GET_SINGLE_PRODUCT,
  GET_SINGLE_PRODUCT_RECOMMENDATION,
} from "@/lib/queries/product";
import LugdiUtils from "@/utils/LugdiUtils";
import { cookies } from "next/headers";
import { Metadata } from "next";
import { convertSlugToTitle } from "@/utils/SlugToTitle";
import { notFound } from "next/navigation";
import {
  GetSingleProductRecommendationResponse,
  GetSingleProductResponse,
} from "@/lib/types/product";
import ClientProductPage from "./ClientProductPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ productSlug: string }>;
}): Promise<Metadata> {
  const { productSlug } = await params;
  const client = initializeApollo();

  const cookieStore = await cookies();
  const countrySlug = cookieStore.get(LugdiUtils.location_cookieName)?.value;
  const isoCountryCode = countrySlug ? countrySlug.toUpperCase() : "IN";

  try {
    const { data } = await client.query<GetSingleProductResponse>({
      query: GET_SINGLE_PRODUCT,
      variables: { handle: productSlug, country: isoCountryCode },
    });

    if (!data?.product) return notFound();

    const productData = data.product;

    const seoTitle =
      productData?.seo?.title || `Buy ${productData?.title} Online`;
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
    };
  } catch (error) {
    console.error("Error fetching product SEO data:", error);
    return { title: `Buy ${convertSlugToTitle(productSlug)} Online` };
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ productSlug: string }>;
}) {
  const { productSlug } = await params;

  const cookieStore = await cookies();
  const countrySlug = cookieStore.get(LugdiUtils.location_cookieName)?.value;
  const countryName = cookieStore.get(
    LugdiUtils.location_name_country_cookie
  )?.value;
  const isoCountryCode = countrySlug ? countrySlug.toUpperCase() : "IN";

  let productData: GetSingleProductResponse | null;
  let productRecommendation: GetSingleProductRecommendationResponse | null;

  try {
    const client = initializeApollo();

    // Fetch Single Product Data
    const { data: productDataRes } =
      await client.query<GetSingleProductResponse>({
        query: GET_SINGLE_PRODUCT,
        variables: {
          handle: productSlug,
          country: isoCountryCode,
        },
      });

    if (!productDataRes?.product) return notFound();

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

    console.log("Product", productDataRes);
    console.log("Reccomend", productRecommendationRes);
  } catch (error) {
    console.error("Error fetching product data:", error);
    return notFound();
  }

  //Prepare JSON-LD for the product
  const product = productData?.product;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    productID: product?.id,
    sku:
      product?.options[0]?.optionValues[0]?.firstSelectableVariant?.barcode ||
      "",
    name: product?.title,
    description: product?.seo?.description || product?.description || "",
    image: product?.images?.edges.map((edge) => edge.node.url) || [],
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/product/${productSlug}`,
    brand: {
      "@type": "Brand",
      name:
        product?.tags
          ?.find((tag) => tag.toLowerCase().includes("brand"))
          ?.replace("brand:", "") || `Lugdi ${countryName}`,
    },
    offers: {
      "@type": "AggregateOffer",
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/product/${productSlug}`,
      priceCurrency:
        product?.options[0]?.optionValues[0]?.firstSelectableVariant?.price
          ?.currencyCode || "INR",
      lowPrice: Math.min(
        ...(product?.options.flatMap((option) =>
          option.optionValues.map((ov) =>
            parseFloat(ov.firstSelectableVariant.price.amount)
          )
        ) || [0])
      ).toFixed(2),
      highPrice: Math.max(
        ...(product?.options.flatMap((option) =>
          option.optionValues.map((ov) =>
            parseFloat(ov.firstSelectableVariant.price.amount)
          )
        ) || [0])
      ).toFixed(2),
      itemCondition: "https://schema.org/NewCondition",
      availability: product?.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      offerCount:
        product?.options.reduce(
          (count, option) => count + option.optionValues.length,
          0
        ) || 0,
      offers: product?.options.map((option) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Product",
          name: `${product?.title} - ${option.name}`,
          sku: option.optionValues[0]?.firstSelectableVariant?.barcode || "",
          additionalProperty: option.optionValues.map((value) => ({
            "@type": "PropertyValue",
            name: option.name,
            value: value.name,
          })),
        },
        price: option.optionValues[0]?.firstSelectableVariant?.price?.amount,
        priceCurrency:
          option.optionValues[0]?.firstSelectableVariant?.price?.currencyCode ||
          "INR",
        availability: option.optionValues[0]?.firstSelectableVariant
          ?.availableForSale
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      })),
      seller: {
        "@type": "Organization",
        name: `Lugdi ${countryName}`,
      },
    },
    isRelatedTo:
      productRecommendation?.productRecommendations?.map((rec) => ({
        "@type": "Product",
        name: rec.title,
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/product/${rec.handle}`,
        image: rec.featuredImage?.url,
        offers: {
          "@type": "Offer",
          price: rec.priceRange.minVariantPrice.amount,
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
      {/* <ClientProductPage
        productData={productData}
        recommendationsData={productRecommendation}
      /> */}
    </>
  );
}
