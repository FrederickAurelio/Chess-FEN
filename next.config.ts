import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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
