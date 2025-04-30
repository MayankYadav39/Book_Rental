/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        // protocol: 'https',
        // hostname: '**',
        protocol: 'https',
        hostname: 'pngimg.com',
        pathname: '/uploads/**',
      },
    ],
  },
}

module.exports = nextConfig
