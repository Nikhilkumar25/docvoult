/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Fix for react-pdf canvas (only applies in webpack mode)
    config.resolve.alias.canvas = false;
    return config;
  },
  // Allow external images from Vercel Blob
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
  // Ensure API routes handle large files
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
};

export default nextConfig;
