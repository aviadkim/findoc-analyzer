/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  // Ensure Next.js works with Google App Engine
  experimental: {
    outputFileTracing: true,
  },
};

module.exports = nextConfig;
