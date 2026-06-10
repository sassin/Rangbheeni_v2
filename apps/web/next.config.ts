import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@rangbheeni/shared-types"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-cf212b8e52d44f7a99d8dac828687929.r2.dev",
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;
