import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("lugdi_shopify_access_token")?.value;
  const expiresAt = request.cookies.get("lugdi_shopify_expires_at")?.value;

  if (!accessToken || !expiresAt || Date.now() > parseInt(expiresAt)) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true });
}
