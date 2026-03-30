/** @type {import('next').NextConfig} */
const nextConfig = {
  // 只在生产构建时使用 export，开发时使用正常模式
  ...(process.env.NODE_ENV === 'production' && { output: 'export' }),
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
