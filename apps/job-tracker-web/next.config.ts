import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["shared-types"],
  async rewrites() {
    return [
      {
        // Strip /api/job prefix — job-service receives e.g. /jobs
        source: "/api/job/:path*",
        destination: `${process.env.JOB_SERVICE_URL}/:path*`,
      },
      {
        // Strip /api/user prefix — user-service receives e.g. /users/auth
        source: "/api/user/:path*",
        destination: `${process.env.USER_SERVICE_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
