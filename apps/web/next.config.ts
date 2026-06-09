import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@rangbheeni/shared-types"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
