import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
        port: '',
        pathname: '/**',
        search: ''
      }
    ]
  },
  serverExternalPackages: ['beatprints.js', '@napi-rs/canvas', 'jimp']
};

export default nextConfig;
