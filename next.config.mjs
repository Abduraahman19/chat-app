/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["firebase"],
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  eslint: {
    ignoreDuringBuilds: true, // Temporary for build
  },
  logging: {
    level: 'error',
    fullUrl: true
  }
};

export default nextConfig;