import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch (error) {
    console.error("API: Failed to parse request body:", error);
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  function ensureStartWith(stringToCheck: string, startsWith: string) {
    return stringToCheck.startsWith(startsWith)
      ? stringToCheck
      : `${startsWith}${stringToCheck}`;
  }

  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
    ? ensureStartWith(process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN, "https://")
    : "";

  const endpoint = `${domain}${process.env.NEXT_PUBLIC_SHOPIFY_GRAPHQL_ENDPOINT}`;
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

  if (!token) {
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
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("API: Shopify GraphQL error:", data);
    return NextResponse.json(data, { status: response.status });
  }

  return NextResponse.json(data);
}
