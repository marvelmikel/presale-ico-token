/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: 'https://www.oklink.com/api/v5/amoy/:path*',
  //     },
  //   ];
  // },
};

module.exports = nextConfig;
