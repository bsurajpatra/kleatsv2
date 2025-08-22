/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return {
      beforeFiles: [
        // Ensure webhook POSTs to /telegram/ are served by the API route at /telegram without redirects
        { source: "/telegram/", destination: "/telegram" },
      ],
      afterFiles: [],
      fallback: [],
    }
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "188.245.112.188",
        port: "3000",
        pathname: "/**",
      },
    ],
  },
}

export default nextConfig
