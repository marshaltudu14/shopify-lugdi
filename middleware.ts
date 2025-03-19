import { NextResponse, NextRequest } from "next/server";
import { countries, Country } from "./lib/countries";
import LugdiUtils from "./utils/LugdiUtils";

async function refreshToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in: number;
  refresh_token: string;
} | null> {
  const shopId = process.env.SHOPIFY_SHOP_ID!;
  const clientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID!;

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    refresh_token: refreshToken,
  });

  const response = await fetch(
    `https://shopify.com/authentication/${shopId}/oauth/token`,
    {
      method: "POST",
      body,
    }
  );

  if (!response.ok) return null;

  return await response.json();
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  try {
    const cookies = request.cookies;
    const pathName = request.nextUrl.pathname || "";
    const protectedRoutes = ["/account"]; // Define protected routes here
    const isProtectedRoute = protectedRoutes.some((route) =>
      pathName.startsWith(route)
    );

    // Auth Logic (only for protected routes)
    if (isProtectedRoute) {
      let accessToken = cookies.get("lugdi_shopify_access_token")?.value;
      const refreshToken = cookies.get("lugdi_shopify_refresh_token")?.value;
      const expiresAt = cookies.get("lugdi_shopify_expires_at")?.value;

      // No session, redirect to sign-in
      if (!accessToken || !refreshToken || !expiresAt) {
        return NextResponse.redirect(new URL("/signin", request.url));
      }

      // Check if token is expired
      if (Date.now() > parseInt(expiresAt)) {
        const refreshedTokens = await refreshToken(refreshToken);
        if (!refreshedTokens) {
          // Refresh failed, clear cookies and redirect to sign-in
          const response = NextResponse.redirect(
            new URL("/signin", request.url)
          );
          response.cookies.delete("lugdi_shopify_access_token");
          response.cookies.delete("lugdi_shopify_refresh_token");
          response.cookies.delete("lugdi_shopify_id_token");
          response.cookies.delete("lugdi_shopify_expires_at");
          return response;
        }

        // Update cookies with new tokens
        const newExpiresAt = Date.now() + refreshedTokens.expires_in * 1000;
        const response = NextResponse.next();
        response.cookies.set(
          "lugdi_shopify_access_token",
          refreshedTokens.access_token,
          { httpOnly: true, secure: true, expires: new Date(newExpiresAt) }
        );
        response.cookies.set(
          "lugdi_shopify_refresh_token",
          refreshedTokens.refresh_token,
          { httpOnly: true, secure: true }
        );
        response.cookies.set(
          "lugdi_shopify_expires_at",
          newExpiresAt.toString(),
          {
            httpOnly: true,
            secure: true,
          }
        );
        accessToken = refreshedTokens.access_token; // Update for downstream use
        return response;
      }
    }

    // Country Redirection logic goes here
    const cookieCountryCode =
      cookies.get(LugdiUtils.location_cookieName)?.value || null;
    const detectedCountryCode =
      request.headers.get("x-vercel-ip-country") || "in";
    const activeCountryCode = cookieCountryCode || detectedCountryCode;

    const activeCountry: Country | undefined = countries.find(
      (country) =>
        country.slug.toLowerCase() === activeCountryCode.toLowerCase()
    );

    const isCountryActive = activeCountry?.active || false;
    const countryName = activeCountry?.name || "";

    let response = NextResponse.next();

    if (!cookieCountryCode) {
      response.cookies.set(LugdiUtils.location_cookieName, activeCountryCode, {
        path: "/",
      });
      response.cookies.set(
        LugdiUtils.location_name_country_cookie,
        countryName,
        { path: "/" }
      );
    }

    const excludedPaths = ["/api"];
    const isExcludedPath = excludedPaths.some((excluded) =>
      pathName.startsWith(excluded)
    );

    const isComingSoonPage = pathName.includes("/coming-soon");

    // Redirect to /coming-soon if country is not active
    if (!isCountryActive && !isComingSoonPage) {
      const redirectUrl = new URL(
        `/${activeCountryCode}/coming-soon`,
        request.url
      );
      response = NextResponse.redirect(redirectUrl);
      response.cookies.set(LugdiUtils.location_cookieName, activeCountryCode, {
        path: "/",
      });
      response.cookies.set(
        LugdiUtils.location_name_country_cookie,
        countryName,
        { path: "/" }
      );
      return response;
    }

    // Redirect to home if country is active and trying to access /coming-soon
    if (isCountryActive && isComingSoonPage) {
      response = NextResponse.redirect(new URL("/", request.url));
      response.cookies.set(LugdiUtils.location_cookieName, activeCountryCode, {
        path: "/",
      });
      response.cookies.set(
        LugdiUtils.location_name_country_cookie,
        countryName,
        { path: "/" }
      );
      return response;
    }

    // Skip further processing for excluded paths
    if (isExcludedPath) {
      return response;
    }

    // Handle URL country slug logic
    const validCountrySlugs = countries.map((c) => c.slug.toLowerCase());
    const urlSegments = pathName.split("/").filter(Boolean);
    const detectedSlugs = urlSegments.filter((segment) =>
      validCountrySlugs.includes(segment.toLowerCase())
    );
    const remainingPath = urlSegments
      .filter((segment) => !validCountrySlugs.includes(segment.toLowerCase()))
      .join("/");

    if (
      detectedSlugs.length > 1 ||
      (detectedSlugs.length === 1 &&
        detectedSlugs[0].toLowerCase() !== activeCountryCode.toLowerCase()) ||
      detectedSlugs.length === 0
    ) {
      const redirectUrl = new URL(
        `/${activeCountryCode.toLowerCase()}/${remainingPath}`,
        request.url
      );
      const searchParams = new URLSearchParams(request.nextUrl.search);
      searchParams.forEach((value, key) => {
        redirectUrl.searchParams.set(key, value);
      });

      response = NextResponse.redirect(redirectUrl);
      response.cookies.set(LugdiUtils.location_cookieName, activeCountryCode, {
        path: "/",
      });
      response.cookies.set(
        LugdiUtils.location_name_country_cookie,
        countryName,
        { path: "/" }
      );
      return response;
    }

    return response;
  } catch (error) {
    console.error("Error in middleware:", (error as Error).message);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|gltf|bin|glb)$).*)",
  ],
};
