import type { NextConfig } from "next";

const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1')
  .replace(/\/api\/v1\/?$/, '');

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api-images/:path*',
        destination: `${apiBase}/images/:path*`,
      },
    ];
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ['**/node_modules/**', '**/.git/**', '**/logs/**', '**/*.log'],
      };
    }
    return config;
  },
};

export default nextConfig;
