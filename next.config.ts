import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",       // when user visits "/"
        destination: "/pages/home", // redirect to
        permanent: false,  // false = 307 Temporary | true = 308 Permanent
      },
    ];
  },
};

export default nextConfig;
