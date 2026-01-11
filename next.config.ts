import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'standalone',
  reactCompiler: true,
  reactStrictMode: true,
  // compiler: {
  // 	removeConsole: process.env.NODE_ENV === "production",
  // },
  cacheComponents: false,
  poweredByHeader: false,
  devIndicators: {
    position: "bottom-right",
  },
  compress: true,
  turbopack: {
    root: "./",
  },
  typedRoutes: true,
  // experimental: {
  // 	typedEnv: true,
  // },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "**",
      },
      ...(process.env.NODE_ENV === "development"
        ? [
            {
              protocol: "http" as const,
              hostname: "localhost",
              pathname: "**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
