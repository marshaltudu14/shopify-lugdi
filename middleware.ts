import { NextResponse, NextRequest } from "next/server";
import { countries } from "./lib/countries";
import LugdiUtils from "./utils/LugdiUtils";

// Removed Shopify refreshToken function - no longer needed for demo mode

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const pathName = request.nextUrl.pathname || "";
  try {
    const cookies = request.cookies;
    // Disable protected routes for demo mode - no Shopify authentication needed
    const protectedRoutes: string[] = []; // Empty array disables all protected routes
    const isProtectedRoute = protectedRoutes.some((route) =>
      pathName.startsWith(route)
    );

    if (isProtectedRoute) {
      // This block will never execute since protectedRoutes is empty
      return NextResponse.redirect(new URL("/login", request.url));
    }



    const cookieCountryCode =
      cookies.get(LugdiUtils.location_cookieName)?.value || null;
    const detectedCountryCode =
      request.headers.get("x-vercel-ip-country") || "in";
    let activeCountryCode = cookieCountryCode || detectedCountryCode;

    let activeCountry = countries.find(
      (country) =>
        country.slug.toLowerCase() === activeCountryCode.toLowerCase()
    );

    if (!activeCountry || !activeCountry.active) {
      activeCountryCode = "in";
      activeCountry = countries.find((c) => c.slug === "in")!;
    }

    const countryName = activeCountry.name;

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
    // Exclude static assets, images, icons, robots.txt, and all sitemap XML files
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.*\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|gltf|bin|glb)$).*)",
  ],
};
