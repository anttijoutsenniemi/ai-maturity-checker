import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    dynamicIO: true,
  },
  generateStaticParams: false,
};

export default nextConfig;
