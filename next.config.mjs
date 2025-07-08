/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
      },
      {
        protocol: 'http',
        hostname: 'arhiva.deschide.md',
      },
      // {
      //   protocol: 'https',
      //   hostname: 'cdn.prod.website-files.com',
      // }
    ]
  }
};

export default nextConfig;
