import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["framer-motion", "lucide-react"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "ipfs.io" },
      { protocol: "https", hostname: "*.ipfs.dweb.link" },
    ],
  },
  webpack: (cfg) => {
    // MetaMask SDK pulls in RN-only modules in web builds; silence the noise.
    cfg.resolve = cfg.resolve ?? {};
    cfg.resolve.fallback = {
      ...(cfg.resolve.fallback ?? {}),
      "@react-native-async-storage/async-storage": false,
      "pino-pretty": false,
    };
    return cfg;
  },
};

export default config;
