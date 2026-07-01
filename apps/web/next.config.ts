import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@shipflow/api",
    "@shipflow/auth",
    "@shipflow/config",
    "@shipflow/db",
    "@shipflow/ai",
    "@shipflow/github",
    "@shipflow/workflows",
    "@shipflow/ui"
  ]
};

export default nextConfig;
