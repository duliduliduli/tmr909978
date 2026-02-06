/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    NEXT_PUBLIC_MAPBOX_STYLE: process.env.NEXT_PUBLIC_MAPBOX_STYLE,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  // Configure transpilation for mapbox-gl
  transpilePackages: ['mapbox-gl'],
  // Type checking and linting run during builds
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Configure webpack for mapbox-gl
  webpack: (config, { isServer }) => {
    // Handle mapbox-gl for client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig
