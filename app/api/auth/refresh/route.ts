import { NextRequest, NextResponse } from "next/server";
import { refreshToken } from "@/middleware";
import LugdiUtils from "@/utils/LugdiUtils";

export async function GET(request: NextRequest) {
  const refreshTokenValue = request.cookies.get(
    LugdiUtils.auth.refreshTokenCookie
  )?.value;
  if (!refreshTokenValue) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  const refreshedTokens = await refreshToken(refreshTokenValue);
  if (!refreshedTokens) {
    return NextResponse.json({ error: "Refresh failed" }, { status: 401 });
  }

  const newExpiresAt = Date.now() + refreshedTokens.expires_in * 1000;
  const response = NextResponse.json({ success: true });
  response.cookies.set(
    LugdiUtils.auth.accessTokenCookie,
    refreshedTokens.access_token,
    {
      httpOnly: true,
      secure: true,
      expires: new Date(newExpiresAt),
    }
  );
  response.cookies.set(
    LugdiUtils.auth.refreshTokenCookie,
    refreshedTokens.refresh_token,
    {
      httpOnly: true,
      secure: true,
    }
  );
  response.cookies.set(
    LugdiUtils.auth.expiresAtCookie,
    newExpiresAt.toString(),
    {
      httpOnly: true,
      secure: true,
    }
  );
  return response;
}
