/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['firebase'],
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  logging: {
    level: 'error',
    fullUrl: true,
  },
};

export default nextConfig;
