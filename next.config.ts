import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverRuntimeConfig: {
    PROJECT_ROOT: __dirname
  }
};

export default nextConfig;
