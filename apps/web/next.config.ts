import type { NextConfig } from "next";

function hostnameFromUrl(value?: string) {
  if (!value) return "";

  try {
    return new URL(value).hostname;
  } catch {
    return "";
  }
}

const mediaHostnames = Array.from(
  new Set(
    [
      "pub-cf212b8e52d44f7a99d8dac828687929.r2.dev",
      "media.rangbheeni.org",
      hostnameFromUrl(process.env.MEDIA_PUBLIC_BASE_URL),
      hostnameFromUrl(process.env.NEXT_PUBLIC_MEDIA_PUBLIC_BASE_URL),
      hostnameFromUrl(process.env.R2_PUBLIC_BASE_URL),
    ].filter(Boolean)
  )
);

const nextConfig: NextConfig = {
  transpilePackages: ["@rangbheeni/shared-types"],
  images: {
    remotePatterns: mediaHostnames.map((hostname) => ({
      protocol: "https",
      hostname,
      pathname: "/images/**",
    })),
  },
};

export default nextConfig;
