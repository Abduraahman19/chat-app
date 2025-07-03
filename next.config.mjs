/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ["firebase"],
    // Add these optimizations
    optimizePackageImports: [
      'react-icons',
      'framer-motion',
      'geist'
    ],
    // Disable Turbopack if causing issues
    // turbopack: false
  },
  // Add logging for debugging
  logging: {
    level: 'error',
    fullUrl: true
  }
};

export default nextConfig;