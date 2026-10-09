import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: process.env.KIVRO_NETSONS_STANDALONE === "1" ? "standalone" : undefined,
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
