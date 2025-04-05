import { initializeApollo } from "@/lib/apollo/apollo-client";
import { GET_SINGLE_PRODUCT } from "@/lib/queries/product";
import { GET_PRODUCTS } from "@/lib/queries/products"; // Import GET_PRODUCTS
import { Metadata } from "next";
import { convertSlugToTitle } from "@/utils/SlugToTitle";
import { notFound } from "next/navigation";
import { countries } from "@/lib/countries";
import { GetSingleProductResponse } from "@/lib/types/product";
import { ProductsData } from "@/lib/types/products"; // Use ProductsData instead
import ClientProductPage from "./ClientProductPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string; productSlug: string }>;
}): Promise<Metadata> {
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
    // Implement description fallback
    const seoDescription =
      productData?.seo?.description ??
      productData?.description ??
      `Check out ${productData?.title} and other fashion items at Lugdi.`;
    // Prioritize featuredImage, then first valid image from images array
    const seoImage =
      productData?.featuredImage?.url ??
      productData?.images?.edges?.find((edge) => edge?.node?.url)?.node?.url ??
      "";

    return {
      title: seoTitle,
      description: seoDescription,
      openGraph: {
        title: seoTitle,
        description: seoDescription,
        images: seoImage
          ? [
              {
                url: seoImage,
                // Use alt text from featuredImage if available, otherwise fallback
                alt:
                  productData?.featuredImage?.altText ||
                  productData?.images?.edges?.find((edge) => edge?.node?.url)
                    ?.node?.altText ||
                  seoTitle,
              },
            ]
          : [], // Return empty array if no image found
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

export default async function ProductPage({
  params,
}: {
  params: Promise<{ country: string; productSlug: string }>;
}) {
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

  let productData: GetSingleProductResponse | null = null;
  let relatedProductsData: ProductsData | null = null; // Use ProductsData type

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
    productData = productDataRes;

    // Fetch related products by type if productType exists
    const productType = productData?.product?.productType;
    const currentProductHandle = productData?.product?.handle; // Use handle to exclude current product

    if (productType && currentProductHandle) {
      try {
        const { data: relatedProductsRes } =
          await client.query<ProductsData>({ // Use ProductsData type
            query: GET_PRODUCTS,
            variables: {
              first: 13, // Fetch 13 initially to account for potential self-inclusion
              query: `product_type:'${productType}'`, // Remove handle filter from query
              sortKey: "RELEVANCE", // Sort by relevance
              reverse: false,
              country: isoCountryCode,
            },
          });

        // Filter out the current product from the results manually
        if (relatedProductsRes?.products?.edges && currentProductHandle) {
          const filteredEdges = relatedProductsRes.products.edges.filter(
            (edge) => edge.node.handle !== currentProductHandle
          );
          // Take the first 12 after filtering
          relatedProductsData = {
            ...relatedProductsRes,
            products: {
              ...relatedProductsRes.products,
              edges: filteredEdges.slice(0, 12),
            },
          };
        } else {
          relatedProductsData = relatedProductsRes; // Assign original if filtering wasn't possible
        }
      } catch (relatedError) {
        console.error("Error fetching related products:", relatedError);
        // Continue without related products if this fetch fails
        relatedProductsData = null;
      }
    }
  } catch (error) {
    console.error("Error fetching main product data:", error);
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
    // Update JSON-LD based on relatedProductsData
    isRelatedTo:
      relatedProductsData?.products?.edges?.map((edge) => ({
        "@type": "Product",
        name: edge.node.title,
        url: `${siteUrl}/${countrySlugParam}/products/${edge.node.handle}`,
        image: edge.node.featuredImage?.url,
        offers: {
          "@type": "Offer",
          price: Number(edge.node.priceRange.minVariantPrice.amount),
          priceCurrency: edge.node.priceRange.minVariantPrice.currencyCode,
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
        relatedProductsData={relatedProductsData} // Pass relatedProductsData instead
      />
    </>
  );
}
