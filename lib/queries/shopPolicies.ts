import { gql } from "@apollo/client";

// Query to fetch all standard shop policies
export const GET_SHOP_POLICIES = gql`
  query GetShopPolicies {
    shop {
      privacyPolicy {
        title
        body
      }
      refundPolicy {
        title
        body
      }
      shippingPolicy {
        title
        body
      }
      termsOfService {
        title
        body
      }
    }
  }
`;

// Interface for a single policy object
export interface ShopPolicyData {
  title: string;
  body: string; // Contains HTML content
}

// Type for the response structure
export type GetShopPoliciesResponse = {
  shop: {
    privacyPolicy: ShopPolicyData | null;
    refundPolicy: ShopPolicyData | null;
    shippingPolicy: ShopPolicyData | null;
    termsOfService: ShopPolicyData | null;
  };
};
