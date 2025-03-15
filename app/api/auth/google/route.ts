// app/api/auth/google/route.ts
import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email) throw new Error("No email in Google response");

    // Check if customer exists, if not create one
    const customerQuery = `
      query {
        customers(first: 1, query: "email:${payload.email}") {
          edges {
            node {
              id
              email
              firstName
              lastName
            }
          }
        }
      }
    `;

    function ensureStartWith(stringToCheck: string, startsWith: string) {
      return stringToCheck.startsWith(startsWith)
        ? stringToCheck
        : `${startsWith}${stringToCheck}`;
    }

    const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
      ? ensureStartWith(
          process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN,
          "https://"
        )
      : "";

    const endpoint = `${domain}${process.env.NEXT_PUBLIC_SHOPIFY_GRAPHQL_ENDPOINT}`;
    const shopifyToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

    if (!shopifyToken) {
      console.error("API: Shopify access token not configured");
      return NextResponse.json(
        { error: "Shopify access token is not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": shopifyToken,
      },
      body: JSON.stringify({ query: customerQuery }),
    });

    const data = await response.json();
    let customer;

    if (data.data.customers.edges.length === 0) {
      // Create new customer
      const createMutation = `
        mutation customerCreate($input: CustomerCreateInput!) {
          customerCreate(input: $input) {
            customer {
              id
              email
              firstName
              lastName
            }
            customerUserErrors {
              code
              field
              message
            }
          }
        }
      `;

      const createResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2023-04/graphql.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token":
              process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
          },
          body: JSON.stringify({
            query: createMutation,
            variables: {
              input: {
                email: payload.email,
                firstName: payload.given_name,
                lastName: payload.family_name,
                password: Math.random().toString(36).slice(-8), // Generate random password
              },
            },
          }),
        }
      );

      const createData = await createResponse.json();
      customer = createData.data.customerCreate.customer;
    } else {
      customer = data.data.customers.edges[0].node;
    }

    return NextResponse.json({ customer });
  } catch (error) {
    console.error("Google auth error:", error);
    return NextResponse.json(
      { error: "Google authentication failed" },
      { status: 401 }
    );
  }
}
