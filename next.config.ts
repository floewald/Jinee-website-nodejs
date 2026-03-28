import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Generate a fully-static site deployable via FTP (no Node.js runtime needed)
  output: "export",

  // Clean URLs: /portfolio/photography/ → out/portfolio/photography/index.html
  trailingSlash: true,

  // Static export cannot use Next.js Image Optimization API
  images: {
    // Static FTP deployment — no Node.js runtime on the server.
    // Images are pre-processed to WebP by `npm run build:images`.
    unoptimized: true,
  },
};

export default nextConfig;
