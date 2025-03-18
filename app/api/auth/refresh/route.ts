import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../[...nextauth]/route";
import { getServerSession } from "next-auth/next";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.refreshToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: process.env.SHOPIFY_CLIENT_ID!,
      refresh_token: session.refreshToken,
    });

    const response = await fetch(
      `https://shopify.com/authentication/${process.env.SHOPIFY_SHOP_ID}/oauth/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      }
    );

    const tokens = await response.json();
    return NextResponse.json(tokens);
  } catch (error) {
    return NextResponse.json({ error: "Refresh failed" }, { status: 500 });
  }
}
