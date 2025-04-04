import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Disable Next.js Image Optimization (for testing Cloud Run issue)
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
