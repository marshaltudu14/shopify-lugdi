import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Disable Next.js Image Optimization (as it resolves Cloud Run 400 errors)
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
      // Removed localhost entry for production
    ],
  },
};

export default nextConfig;
