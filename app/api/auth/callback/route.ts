import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import LugdiUtils from "@/utils/LugdiUtils";

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
  const storedState = cookieStore.get(LugdiUtils.auth.stateCookie)?.value;
  const verifier = cookieStore.get(LugdiUtils.auth.codeVerifierCookie)?.value;

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

  cookieStore.set(LugdiUtils.auth.accessTokenCookie, access_token, {
    httpOnly: true,
    secure: true,
    expires: new Date(expiresAt),
  });
  cookieStore.set(LugdiUtils.auth.refreshTokenCookie, refresh_token, {
    httpOnly: true,
    secure: true,
  });
  cookieStore.set(LugdiUtils.auth.idTokenCookie, id_token, {
    httpOnly: true,
    secure: true,
  });
  cookieStore.set(LugdiUtils.auth.expiresAtCookie, expiresAt.toString(), {
    httpOnly: true,
    secure: true,
  });

  // Clear temporary cookies
  cookieStore.delete(LugdiUtils.auth.codeVerifierCookie);
  cookieStore.delete(LugdiUtils.auth.stateCookie);

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/account`);
}
