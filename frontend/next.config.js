/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    domains: [],
  },
  // Configuração para Vercel
  experimental: {
    outputFileTracingIncludes: {
      '/': ['./**/*'],
    },
  },
}

module.exports = nextConfig

