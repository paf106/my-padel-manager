import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.52"],
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns", "date-fns-tz", "recharts"],
  },
};

export default nextConfig;
