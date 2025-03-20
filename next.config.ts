import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000", // localhost
        "foobar-3000.app.github.dev", // Codespaces
        "120.26.45.50:6060", // Add your server's IP and port
      ],
    },
  },
  webpack: (config) => {
    // Add custom rules for loading .pb and .json files if necessary
    config.module.rules.push({
      test: /\.pb$/,
      use: "file-loader", // or 'url-loader' depending on your needs
    });
    return config;
  },
};

export default nextConfig;
