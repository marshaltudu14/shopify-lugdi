import { NextResponse, NextRequest } from "next/server";
import { countries, Country } from "./lib/countries";
import LugdiUtils from "./utils/LugdiUtils";

export async function middleware(request: NextRequest): Promise<NextResponse> {
  try {
    const cookies = request.cookies;
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

    const pathName = request.nextUrl.pathname || "";
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
