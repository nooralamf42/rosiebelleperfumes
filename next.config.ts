import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Long-lived browser/CDN caching for files shipped in /public (bottle photos).
  // Revalidated in the background after a day, so a replaced photo still shows up.
  async headers() {
    return [
      {
        source: "/bottles/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=604800" }],
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Optimised images are cached for a month; Cloudinary URLs change when a file is replaced.
    minimumCacheTTL: 2592000,
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "images.meesho.com" },
    ],
  },
};

export default nextConfig;
