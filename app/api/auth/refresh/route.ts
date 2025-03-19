// src/app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from "next/server";
import { refreshToken } from "@/middleware";

export async function GET(request: NextRequest) {
  const refreshToken = request.cookies.get(
    "lugdi_shopify_refresh_token"
  )?.value;
  if (!refreshToken)
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });

  const refreshedTokens = await refreshToken(refreshToken);
  if (!refreshedTokens)
    return NextResponse.json({ error: "Refresh failed" }, { status: 401 });

  const newExpiresAt = Date.now() + refreshedTokens.expires_in * 1000;
  const response = NextResponse.json({ success: true });
  response.cookies.set(
    "lugdi_shopify_access_token",
    refreshedTokens.access_token,
    {
      httpOnly: true,
      secure: true,
      expires: new Date(newExpiresAt),
    }
  );
  response.cookies.set(
    "lugdi_shopify_refresh_token",
    refreshedTokens.refresh_token,
    {
      httpOnly: true,
      secure: true,
    }
  );
  response.cookies.set("lugdi_shopify_expires_at", newExpiresAt.toString(), {
    httpOnly: true,
    secure: true,
  });
  return response;
}
