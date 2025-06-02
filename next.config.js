/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint in the build process
  eslint: {
    // Don't run ESLint during build
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript type checking
  typescript: {
    // Don't run TypeScript during build
    ignoreBuildErrors: true,
  },
  // Suppress meaningless hydration warnings
  reactStrictMode: false,
  // Disable React DevTools in production
  productionBrowserSourceMaps: false,
  // Disable the telemetry
  experimental: {
    // Disable the overlay that appears when there's an error
    webVitalsAttribution: [],
    scrollRestoration: true,
  },
}

module.exports = nextConfig
