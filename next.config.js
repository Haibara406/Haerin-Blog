/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // 只在生产环境使用 basePath
  ...(process.env.NODE_ENV === 'production' && {
    basePath: '/Haerin-Blog',
    assetPrefix: '/Haerin-Blog/',
  }),
}

module.exports = nextConfig
