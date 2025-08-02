import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Disable Next.js Image Optimization (as it resolves Cloud Run 400 errors)
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos", // Demo images from Picsum
      },
      // Removed Shopify CDN for demo mode
    ],
  },
};

export default nextConfig;
