import { NextRequest, NextResponse } from "next/server";
import LugdiUtils from "@/utils/LugdiUtils";

export async function GET(request: NextRequest) {
  const shopId = process.env.SHOPIFY_SHOP_ID!;
  const idToken = request.cookies.get(LugdiUtils.auth.idTokenCookie)?.value;

  const logoutUrl = new URL(
    `https://shopify.com/authentication/${shopId}/logout`
  );
  logoutUrl.searchParams.append("id_token_hint", idToken || "");
  logoutUrl.searchParams.append(
    "post_logout_redirect_uri",
    `${process.env.NEXT_PUBLIC_SITE_URL}`
  );

  const response = NextResponse.redirect(logoutUrl.toString());
  response.cookies.delete(LugdiUtils.auth.accessTokenCookie);
  response.cookies.delete(LugdiUtils.auth.refreshTokenCookie);
  response.cookies.delete(LugdiUtils.auth.idTokenCookie);
  response.cookies.delete(LugdiUtils.auth.expiresAtCookie);

  return response;
}
