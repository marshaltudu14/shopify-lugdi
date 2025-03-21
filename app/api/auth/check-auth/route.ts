import { NextRequest, NextResponse } from "next/server";
import LugdiUtils from "@/utils/LugdiUtils";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get(
    LugdiUtils.auth.accessTokenCookie
  )?.value;
  const expiresAt = request.cookies.get(LugdiUtils.auth.expiresAtCookie)?.value;

  if (!accessToken || !expiresAt || Date.now() > parseInt(expiresAt)) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true });
}
