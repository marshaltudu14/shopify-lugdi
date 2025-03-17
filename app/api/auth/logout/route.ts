import { NextResponse } from "next/server";

export async function POST(req) {
  const { idToken } = await req.json();
  const logoutUrl = new URL(
    `https://shopify.com/authentication/${process.env.SHOPIFY_SHOP_ID}/logout`
  );
  logoutUrl.searchParams.append("id_token_hint", idToken);
  logoutUrl.searchParams.append(
    "post_logout_redirect_uri",
    `${process.env.NEXTAUTH_URL}/account`
  );

  return NextResponse.redirect(logoutUrl, 302);
}
