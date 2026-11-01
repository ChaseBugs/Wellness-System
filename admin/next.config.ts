import type { NextConfig } from "next";

// Wellness Platform origin; migrated TalentBaby images are served from /static/babygrow/images.
const apiOrigin = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4500/api/v1").replace(/\/api\/v1\/?$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // BabyGrow recipe pages still resolve legacy /images/... paths through this same-origin proxy.
      { source: "/api-images/:path*", destination: `${apiOrigin}/static/babygrow/images/:path*` }
    ];
  }
};

export default nextConfig;
