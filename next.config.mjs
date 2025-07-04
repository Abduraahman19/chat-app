/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // ✅ Add this line for static export
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
