import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,
  turbopack: process.env.TURBOPACK_ROOT ? { root: process.env.TURBOPACK_ROOT } : {},
};

export default nextConfig;
