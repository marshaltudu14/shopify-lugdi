import { NextResponse, NextRequest } from "next/server";
import { countries, Country } from "./lib/countries";
import LugdiUtils from "./utils/LugdiUtils";

// Rename parameter to avoid conflict with function name
export async function refreshToken(refreshTokenValue: string): Promise<{
  access_token: string;
  expires_in: number;
  refresh_token: string;
} | null> {
  const shopId = process.env.SHOPIFY_SHOP_ID!;
  const clientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID!;

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    refresh_token: refreshTokenValue, // Use the renamed parameter
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
    const protectedRoutes = ["/account"];
    const isProtectedRoute = protectedRoutes.some((route) =>
      pathName.startsWith(route)
    );

    if (isProtectedRoute) {
      let accessToken = cookies.get("lugdi_shopify_access_token")?.value;
      const refreshTokenValue = cookies.get(
        "lugdi_shopify_refresh_token"
      )?.value; // Renamed for clarity
      const expiresAt = cookies.get("lugdi_shopify_expires_at")?.value;

      if (!accessToken || !refreshTokenValue || !expiresAt) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      if (Date.now() > parseInt(expiresAt)) {
        // Call the function with the refresh token value
        const refreshedTokens = await refreshToken(refreshTokenValue);
        if (!refreshedTokens) {
          const response = NextResponse.redirect(
            new URL("/login", request.url)
          );
          response.cookies.delete("lugdi_shopify_access_token");
          response.cookies.delete("lugdi_shopify_refresh_token");
          response.cookies.delete("lugdi_shopify_id_token");
          response.cookies.delete("lugdi_shopify_expires_at");
          return response;
        }

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
          { httpOnly: true, secure: true }
        );
        accessToken = refreshedTokens.access_token;
        return response;
      }
    }

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

    if (isExcludedPath) {
      return response;
    }

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
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|sitemap-index.xml|collections-sitemap.xml|products-sitemap.xml|category-sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|gltf|bin|glb)$).*)",
  ],
};
