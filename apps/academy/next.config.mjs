import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Cloudflare Stream serves video; images optimized via next/image + Cloudflare (Phase 2 doc 04).
  images: { formats: ["image/avif", "image/webp"] },
  experimental: { optimizePackageImports: ["@infoenc/ui"] },
  async headers() {
    // Baseline security headers; strict per-route CSP is added at the edge (Phase 2 doc 04 §7).
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
