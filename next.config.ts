import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ["@cappuccino/web-sdk"],
};

export default nextConfig;
