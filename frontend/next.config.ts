import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["localhost", "127.0.0.1", "10.0.193.11"],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
