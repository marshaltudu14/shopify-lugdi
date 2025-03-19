import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const shopId = process.env.SHOPIFY_SHOP_ID!;
  const clientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID!;
  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`;

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/signin?error=missing_params`
    );
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get("lugdi_shopify_state")?.value;
  const verifier = cookieStore.get("lugdi_shopify_code_verifier")?.value;

  if (!storedState || storedState !== state || !verifier) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/signin?error=state_mismatch`
    );
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    redirect_uri: redirectUri,
    code,
    code_verifier: verifier,
  });

  const response = await fetch(
    `https://shopify.com/authentication/${shopId}/oauth/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    }
  );

  if (!response.ok) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/signin?error=token_fetch_failed`
    );
  }

  const { access_token, refresh_token, expires_in, id_token } =
    await response.json();
  const expiresAt = Date.now() + expires_in * 1000;

  cookieStore.set("lugdi_shopify_access_token", access_token, {
    httpOnly: true,
    secure: true,
    expires: new Date(expiresAt),
  });
  cookieStore.set("lugdi_shopify_refresh_token", refresh_token, {
    httpOnly: true,
    secure: true,
  });
  cookieStore.set("lugdi_shopify_id_token", id_token, {
    httpOnly: true,
    secure: true,
  });
  cookieStore.set("lugdi_shopify_expires_at", expiresAt.toString(), {
    httpOnly: true,
    secure: true,
  });

  // Clear temporary cookies
  cookieStore.delete("lugdi_shopify_code_verifier");
  cookieStore.delete("lugdi_shopify_state");

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/account`);
}
