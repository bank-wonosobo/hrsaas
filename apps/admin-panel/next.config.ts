import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    domains: ["www.gravatar.com", "is3.cloudhost.id", "example.com", "r2.bankwonosobo.co.id"],
    dangerouslyAllowLocalIP: true, // 🔥 ini kunci
  },
  output: "standalone",
};

export default nextConfig;
