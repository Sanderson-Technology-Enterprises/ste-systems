import type { MetadataRoute } from "next";

import { SITE, withBasePath } from "./lib/site";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: "STE Systems",
    description: SITE.description,
    id: withBasePath("/"),
    start_url: withBasePath("/"),
    scope: withBasePath("/"),
    display: "standalone",
    background_color: "#07111f",
    theme_color: "#07111f",
    categories: ["developer", "productivity", "utilities"],
    icons: [
      {
        src: withBasePath("/android-chrome-192x192.png"),
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: withBasePath("/android-chrome-512x512.png"),
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: withBasePath("/maskable-icon-512x512.png"),
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
