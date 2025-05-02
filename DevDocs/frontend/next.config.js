/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // For production on Google App Engine, we'll use standalone output
  output: 'standalone',
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  // Disable trailing slash
  trailingSlash: false,
  // Ensure Next.js works with Google App Engine
  experimental: {
    outputFileTracing: true,
  },
  reactStrictMode: false, // Disable strict mode to avoid double-rendering
  // Note: headers are not automatically applied with output: 'export'
  // These will be handled by the server.js file instead
  // If you need to add headers, use the following format:
  // async headers() {
  //   return [
  //     {
  //       source: '/:path*',
  //       headers: [
  //         { key: 'Access-Control-Allow-Origin', value: '*' },
  //       ],
  //     },
  //   ];
  // },
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: 'http://localhost:24125',
    NEXT_PUBLIC_SUPABASE_URL: 'https://dnjnsotemnfrjlotgved.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuam5zb3RlbW5mcmpsb3RndmVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTI4NTI0MDAsImV4cCI6MjAyODQyODQwMH0.placeholder-key',
  },
  // Add path aliases
  webpack(config) {
    config.resolve.alias['@'] = path.join(__dirname, './');
    return config;
  },
};

module.exports = nextConfig;
