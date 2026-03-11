/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias['pdfjs-dist'] = 'pdfjs-dist/legacy/build/pdf.js';
    // Fix for canvas module not found during build
    config.resolve.alias.canvas = false;
    return config;
  },
  serverExternalPackages: ['@prisma/client', 'pdf-parse'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
    ],
  },
};

export default nextConfig;
