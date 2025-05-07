/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["openai"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Add this to ensure proper server-side execution
  serverRuntimeConfig: {
    // Will only be available on the server side
    openaiApiKey: process.env.OPENAI_API_KEY,
  },
}

export default nextConfig
