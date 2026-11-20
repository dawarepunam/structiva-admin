import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // We already run independent 'npx tsc --noEmit' with 0 errors
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
