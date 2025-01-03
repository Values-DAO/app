import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  typescript: {
    // Ignore TypeScript errors during build
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*", // This allows all external image hosts (wildcard)
        port: "",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)", // Apply to all routes
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              img-src * blob: data:;
            `.trim(),
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // Sentry configuration
  org: "values-dao",
  project: "javascript-nextjs-ba",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Automatically annotate React components to show their full name in breadcrumbs and session replay
  reactComponentAnnotation: {
    enabled: true,
  },

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  tunnelRoute: "/monitoring",

  // Hides source maps from generated client bundles (to protect your source code)
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Option to delete source maps after uploading to Sentry
  deleteSourceMapsAfterUpload: true, // This will delete source maps after upload

  // Option to disable source map generation entirely
  sourcemaps: {
    disable: true, // Uncomment this if you want to completely disable source maps
  },
});
