import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['jose', 'jwks-rsa', 'firebase-admin'],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
