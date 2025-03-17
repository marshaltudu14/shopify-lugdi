import { NextRequest, NextResponse } from "next/server";
import {
  generateCodeChallenge,
  generateCodeVerifier,
} from "../[...nextauth]/route";

export async function GET(req: NextRequest) {
  const verifier = await generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  const state = Math.random().toString(36).substring(2);

  const authUrl = new URL(
    `https://shopify.com/authentication/${process.env.SHOPIFY_SHOP_ID}/oauth/authorize`
  );
  authUrl.searchParams.append(
    "scope",
    "openid email customer-account-api:full"
  );
  authUrl.searchParams.append(
    "client_id",
    process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID
  );
  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append(
    "redirect_uri",
    `${process.env.NEXTAUTH_URL}/api/auth/callback/shopify`
  );
  authUrl.searchParams.append("state", state);
  authUrl.searchParams.append("code_challenge", challenge);
  authUrl.searchParams.append("code_challenge_method", "S256");
  authUrl.searchParams.append("prompt", "none");

  return NextResponse.redirect(authUrl, {
    headers: {
      "Set-Cookie": `verifier=${verifier}; Path=/; HttpOnly; SameSite=Lax`,
    },
  });
}
