// src/app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const shopId = process.env.SHOPIFY_SHOP_ID!;
  const idToken = request.cookies.get("lugdi_shopify_id_token")?.value;
  const cookieStore = request.cookies;

  cookieStore.delete("lugdi_shopify_access_token");
  cookieStore.delete("lugdi_shopify_refresh_token");
  cookieStore.delete("lugdi_shopify_id_token");
  cookieStore.delete("lugdi_shopify_expires_at");

  const logoutUrl = new URL(
    `https://shopify.com/authentication/${shopId}/logout`
  );
  logoutUrl.searchParams.append("id_token_hint", idToken || "");
  logoutUrl.searchParams.append(
    "post_logout_redirect_uri",
    `${process.env.NEXT_PUBLIC_SITE_URL}`
  );

  return NextResponse.redirect(logoutUrl.toString());
}
