import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['shiki', 'vscode-oniguruma'],
};

export default nextConfig;
