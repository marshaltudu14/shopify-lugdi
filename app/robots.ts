import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/*"],
        disallow: [
          "/api/*", // Protect API routes
          "/*/cart/*", // Protect cart pages
          "/*/account/*", // Protect user account pages
          "/*/login/*", // Protect login pages
          "/*/coming-soon/*", // Hide coming soon pages
          "/*/_next/*", // Disallow Next.js internal routes
          "/*.json", // Disallow JSON files
          "/marshal_data/*", // Protect internal data
        ],
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
  };
}
