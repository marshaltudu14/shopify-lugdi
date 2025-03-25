import { FETCH_CUSTOMER_ORDER_DATA } from "@/lib/queries/customer";
import LugdiUtils from "@/utils/LugdiUtils";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(LugdiUtils.auth.accessTokenCookie)?.value;
  const {
    first,
    after,
    before,
    sortKey,
    reverse,
    query,
    lineItemsFirst,
    fulfillmentsFirst,
  } = await request.json();

  if (!accessToken) {
    console.log("No access token found in cookies");
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const shopId = process.env.SHOPIFY_SHOP_ID;
  const shopifyEndpoint = `https://shopify.com/${shopId}/account/customer/api/2025-01/graphql`;

  try {
    const response = await fetch(shopifyEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: accessToken,
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: FETCH_CUSTOMER_ORDER_DATA.loc?.source.body,
        variables: {
          first: first || 5,
          after: after || null,
          before: before || null,
          sortKey: sortKey || "CREATED_AT",
          reverse: reverse || false,
          query: query || null,
          lineItemsFirst: lineItemsFirst || 3,
          fulfillmentsFirst: fulfillmentsFirst || 1,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Shopify API Error:", response.status, errorText);
      return NextResponse.json(
        { error: `HTTP error ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.data?.customer) {
      console.log("No customer data returned");
      return NextResponse.json(
        { error: "No customer data available" },
        { status: 404 }
      );
    }

    return NextResponse.json({ customer: data.data.customer });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Fetch Error:", error);
    return NextResponse.json(
      { error: "Error fetching customer data", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST(
    new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ first: 5 }),
    })
  );
}
