import { notFound } from "next/navigation";
import { Metadata } from "next";
import { initializeApollo } from "@/lib/apollo/apollo-client";
import {
  GET_SHOP_POLICIES, // Import the new query
  GetShopPoliciesResponse, // Import the response type
  ShopPolicyData, // Import the policy data type
} from "@/lib/queries/shopPolicies"; // Adjust path
import ClientPolicyPage from "./ClientPolicyPage"; // Use relative path without extension

// Correct type for params based on product page example
interface PolicyPageProps {
  params: Promise<{
    country: string;
    policySlug: string;
  }>;
}

// Helper function to map slug to policy key
const getPolicyKeyFromSlug = (
  slug: string
): keyof GetShopPoliciesResponse["shop"] | null => {
  switch (slug) {
    case "privacy-policy":
      return "privacyPolicy";
    case "refund-policy":
      return "refundPolicy";
    case "shipping-policy":
      return "shippingPolicy";
    case "terms-of-service":
      return "termsOfService";
    default:
      return null; // Handle unknown slugs
  }
};

// Generate metadata for the page (SEO)
export async function generateMetadata({
  params,
}: PolicyPageProps): Promise<Metadata> {
  const { policySlug } = await params; // Await params here
  const policyKey = getPolicyKeyFromSlug(policySlug);

  if (!policyKey) {
    return { title: "Policy Not Found" };
  }

  const client = initializeApollo();
  try {
    // Fetch all policies (Storefront API doesn't allow fetching just one by type)
    const { data } = await client.query<GetShopPoliciesResponse>({
      query: GET_SHOP_POLICIES,
      // No variables needed
    });

    const policyData = data?.shop?.[policyKey];

    // Check if the specific policy exists
    if (!policyData) {
      return {
        title: "Policy Not Found",
      };
    }

    // Use the fetched policy data for metadata
    return {
      title: policyData.title, // Shop policies don't have separate SEO fields
      description: policyData.body.substring(0, 160), // Generate a summary for description
      // Add other metadata fields as needed
    };
  } catch (error) {
    console.error(
      `Error fetching metadata for policy ${policySlug}:`,
      error
    );
    return {
      title: "Error",
      description: "Could not load policy information.",
    };
  }
}

// The main server component for the policy page
export default async function PolicyPage({ params }: PolicyPageProps) {
  const { policySlug } = await params; // Await params here
  const policyKey = getPolicyKeyFromSlug(policySlug);

  if (!policyKey) {
    notFound(); // If slug doesn't match a known policy, 404
  }

  const client = initializeApollo();
  let policyDataForRender: ShopPolicyData | null = null;

  try {
    // Fetch all policies
    const { data } = await client.query<GetShopPoliciesResponse>({
      query: GET_SHOP_POLICIES,
      // context: { fetchOptions: { next: { revalidate: 3600 } } } // Example: Revalidate every hour
    });
    // Select the specific policy based on the key derived from the slug
    policyDataForRender = data?.shop?.[policyKey] ?? null;
  } catch (error) {
    console.error(`Error fetching shop policies for ${policySlug}:`, error);
    // Optionally, render an error component or message here
    // For now, we'll let it fall through to the notFound() check below
  }

  // If the specific policy data is null after fetch/catch, show 404
  if (!policyDataForRender) {
    notFound();
  }

  // Pass the specific policy data to the client component for rendering
  return <ClientPolicyPage policy={policyDataForRender} />;
}
