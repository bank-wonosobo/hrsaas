import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    domains: [
      "www.gravatar.com",
      "is3.cloudhost.id",
      "example.com",
      "r2.bankwonosobo.co.id",
      "f25f6724d94ab200c9116b49d8acc632.r2.cloudflarestorage.com",
    ],
    dangerouslyAllowLocalIP: true, // 🔥 ini kunci
  },
  output: "standalone",
};

export default nextConfig;
