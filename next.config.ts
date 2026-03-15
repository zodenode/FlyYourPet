import type { NextConfig } from "next";

const isGhPages = process.env.GITHUB_PAGES === "1";
const basePath = isGhPages ? "/flymypet" : "";

// Expose basePath for client-side asset URLs (e.g. public folder images)
if (isGhPages) {
  process.env.NEXT_PUBLIC_BASE_PATH = basePath;
}

const nextConfig: NextConfig = {
  serverExternalPackages: ["telegraf"],
  // Allow ngrok and other dev origins for local tunneling
  allowedDevOrigins: [
    "endoparasitic-tamatha-nonexigent.ngrok-free.dev",
    "*.ngrok-free.dev",
    "*.ngrok.io",
  ],
  // GitHub Pages: static export, base path for repo subpath
  ...(isGhPages && {
    output: "export",
    basePath,
    assetPrefix: basePath ? `${basePath}/` : undefined,
    trailingSlash: true,
  }),
};

export default nextConfig;
