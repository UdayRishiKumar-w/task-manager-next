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
  headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
