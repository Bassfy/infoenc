import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://waclighting.com";

  const staticRoutes = [
    "",
    "/products",
    "/products/interior",
    "/products/exterior",
    "/products/commercial",
    "/products/smart",
    "/products/track",
    "/products/recessed",
    "/products/pendant",
    "/products/wall",
    "/products/landscape",
    "/collections",
    "/collections/essence",
    "/collections/aurora",
    "/collections/terra",
    "/collections/meridian",
    "/collections/solstice",
    "/collections/obsidian",
    "/projects",
    "/technology",
    "/technology/truecolor",
    "/technology/smartlink",
    "/technology/tunable",
    "/about",
    "/contact",
    "/news",
    "/careers",
    "/sustainability",
    "/showrooms",
  ];

  return staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : route.startsWith("/products") || route.startsWith("/collections") ? 0.8 : 0.6,
  }));
}
