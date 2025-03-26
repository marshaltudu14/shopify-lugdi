import { NextResponse } from "next/server";
import {
  generateCodeVerifier,
  generateCodeChallenge,
  generateState,
  generateNonce,
} from "@/lib/auth-utils";
import LugdiUtils from "@/utils/LugdiUtils";

export async function GET() {
  const shopId = process.env.SHOPIFY_SHOP_ID!;
  const clientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID!;
  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`;

  const verifier = await generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  const state = await generateState();
  const nonce = await generateNonce();

  const authorizationUrl = new URL(
    `https://shopify.com/authentication/${shopId}/oauth/authorize`
  );
  authorizationUrl.searchParams.append(
    "scope",
    "openid email customer-account-api:full"
  );
  authorizationUrl.searchParams.append("client_id", clientId);
  authorizationUrl.searchParams.append("response_type", "code");
  authorizationUrl.searchParams.append("redirect_uri", redirectUri);
  authorizationUrl.searchParams.append("state", state);
  authorizationUrl.searchParams.append("nonce", nonce);
  authorizationUrl.searchParams.append("code_challenge", challenge);
  authorizationUrl.searchParams.append("code_challenge_method", "S256");

  const response = NextResponse.redirect(authorizationUrl.toString());
  response.cookies.set(LugdiUtils.auth.codeVerifierCookie, verifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
  response.cookies.set(LugdiUtils.auth.stateCookie, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
