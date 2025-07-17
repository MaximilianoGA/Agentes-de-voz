/** @type {import('next').NextConfig} */
const nextConfig = {};
  output: 'standalone',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  env: {
    ULTRAVOX_API_KEY: process.env.ULTRAVOX_API_KEY,
  }

export default nextConfig;
