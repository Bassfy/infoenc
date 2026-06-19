import type { NextConfig } from "next";

const isGHPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: isGHPages ? "export" : undefined,
  basePath: isGHPages ? "/infoenc" : "",
  reactStrictMode: true,
  images: {
    unoptimized: isGHPages,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
    ],
  },
  experimental: {},
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  headers: async () =>
    isGHPages
      ? []
      : [
          {
            source: "/(.*)",
            headers: [
              { key: "X-Content-Type-Options", value: "nosniff" },
              { key: "X-Frame-Options", value: "DENY" },
              { key: "X-XSS-Protection", value: "1; mode=block" },
              {
                key: "Referrer-Policy",
                value: "strict-origin-when-cross-origin",
              },
            ],
          },
        ],
};

export default nextConfig;
