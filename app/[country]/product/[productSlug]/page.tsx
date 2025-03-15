import { initializeApollo } from "@/lib/apollo/apollo-client";
import { GET_SINGLE_PRODUCT } from "@/lib/queries/product";
import LugdiUtils from "@/utils/LugdiUtils";
import { cookies } from "next/headers";
import ClientProductPage from "./ClientProductPage";
import { Metadata } from "next";
import { convertSlugToTitle } from "@/utils/SlugToTitle";
import { notFound } from "next/navigation";

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
    const { data } = await client.query({
      query: GET_SINGLE_PRODUCT,
      variables: {
        handle: productSlug,
        country: isoCountryCode,
      },
    });

    if (!data) return notFound();

    const productData = data?.productByHandle;

    const seoTitle =
      productData?.seo?.title || `Buy ${productData?.title} Online`;
    const seoDescription = productData?.seo?.description;
    const seoImage = productData?.featuredImage?.originalSrc || "";

    return {
      title: seoTitle,
      description: seoDescription,
      openGraph: {
        title: seoTitle,
        description: seoDescription,
        images: [
          {
            url: seoImage,
            alt: productData?.featuredImage?.altText || seoTitle,
          },
        ],
      },
    };
  } catch (error) {
    console.error("Error fetching product SEO data:", error);
    return {
      title: `Buy ${convertSlugToTitle(productSlug)} Online`,
    };
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

  const isoCountryCode = countrySlug ? countrySlug.toUpperCase() : "IN";

  let productData;

  try {
    const client = initializeApollo();
    const { data } = await client.query({
      query: GET_SINGLE_PRODUCT,
      variables: {
        handle: productSlug,
        country: isoCountryCode,
      },
    });

    if (!data) return notFound();

    productData = data;
  } catch (error) {
    console.error("Error fetching product data:", error);
    productData = null;
  }

  // Prepare JSON-LD for the product
  const product = productData?.productByHandle;
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product?.title || convertSlugToTitle(productSlug),
    description: product?.seo?.description || product?.description || "",
    image: product?.featuredImage?.originalSrc || "",
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/product/${productSlug}`,
    offers: product
      ? {
          "@type": "AggregateOffer",
          availability: product.availableForSale
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          priceCurrency: product.priceRange.minVariantPrice.currencyCode,
          highPrice: product.priceRange.maxVariantPrice.amount,
          lowPrice: product.priceRange.minVariantPrice.amount,
        }
      : null,
  };

  return (
    <>
      {productJsonLd.offers && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productJsonLd),
          }}
        />
      )}
      <ClientProductPage product={productData} />
    </>
  );
}
