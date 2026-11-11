import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";

// GitHub Pages project sites serve assets beneath the repository slug.
const basePath = process.env.PAGES_BASE_PATH ?? "";
// Dev-browser tests can isolate generated artifacts without changing the production default.
const distDir = process.env.NEXT_DIST_DIR?.trim() || ".next";

const nextConfig: NextConfig = {
  output: "export",
  devIndicators: false,
  basePath,
  distDir,
  assetPrefix: basePath || undefined,
  env: {
    NEXT_PUBLIC_PAGES_BASE_PATH: basePath,
  },
  trailingSlash: true,
  images: { unoptimized: true },
  // Next 16 requires explicit development hosts, including the advertised LAN URL.
  allowedDevOrigins: [
    "127.0.0.1",
    ...Object.values(networkInterfaces())
      .flatMap((addresses) => addresses ?? [])
      .filter((address) => address.family === "IPv4" && !address.internal)
      .map((address) => address.address),
  ],
  turbopack: { root: process.cwd() },
};

export default nextConfig;
