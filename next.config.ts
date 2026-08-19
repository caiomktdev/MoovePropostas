import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      { source: "/proposta/:slug", destination: "/p/:slug", permanent: false },
      { source: "/propostas/public/:slug", destination: "/p/:slug", permanent: false },
    ];
  },
};

export default nextConfig;
