import { Metadata } from "next";
import { notFound } from "next/navigation";
import { countries } from "@/lib/countries";
import ClientProductPage from "./ClientProductPage";
import detailedProductsData from "@/lib/mock-data/detailedProducts.json";
import mockProductsData from "@/lib/mock-data/products.json";
import { GetSingleProductResponse } from "@/lib/types/product";
import { ProductsData } from "@/lib/types/products";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string; productSlug: string }>;
}): Promise<Metadata> {
  const { productSlug, country } = await params;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lugdi.store";
  const canonicalUrl = `${siteUrl}/${country}/products/${productSlug}`;

  // Find product by handle from detailed products data
  const productData = detailedProductsData.find(p => p.product.handle === productSlug)?.product;

  const seoTitle = productData?.seo?.title || productData?.title;
  const seoDescription =
    productData?.seo?.description ??
    productData?.description ??
    `Check out ${productData?.title} and other fashion items at Lugdi.`;
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
              alt:
                productData?.featuredImage?.altText ||
                productData?.images?.edges?.find((edge) => edge?.node?.url)
                  ?.node?.altText ||
                seoTitle,
            },
          ]
        : [],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
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

  // Find product by handle from detailed products data
  const foundProduct = detailedProductsData.find(p => p.product.handle === productSlug);

  if (!foundProduct) {
    return notFound();
  }

  const productData: GetSingleProductResponse = foundProduct;

  // Convert basic products to full ProductsData structure
  const relatedProductsData: ProductsData = {
    products: {
      edges: mockProductsData.map((p, i) => ({
        cursor: String(i + 1),
        node: {
          ...p,
          description: `High-quality ${p.title.toLowerCase()} with excellent craftsmanship.`,
          seo: {
            title: p.title,
            description: `Shop ${p.title.toLowerCase()} at great prices.`
          },
          options: [],
          variants: {
            edges: []
          }
        }
      })),
      pageInfo: {
        hasNextPage: false,
        endCursor: String(mockProductsData.length),
      },
    },
  };
  const product = productData?.product;

  // Calculate priceValidUntil as 30 days from now in YYYY-MM-DD format
  const priceValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

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
      priceValidUntil,
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
          currency: product?.variants.edges[0]?.node.price.currencyCode || currentCountry?.currencyCode || "INR"
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
      },
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
        priceValidUntil,
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
            currency: edge.node.price.currencyCode || currentCountry?.currencyCode || "INR"
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
