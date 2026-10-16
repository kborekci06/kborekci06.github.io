import type { NextConfig } from "next";

// Jekyll builds the older experiments (and /assets) into public/ before next build; Next serves them as static files.
// public/ does not resolve a folder to its index.html, so the Jekyll pages get a rewrite (after app routes and files).
const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  images: { unoptimized: true }, // every picture is a hand-sized WebP in public/assets; no optimizer in the loop
  async rewrites() {
    return { afterFiles: [{ source: "/experiments/:group/:slug/", destination: "/experiments/:group/:slug/index.html" }] };
  },
};

export default nextConfig;
