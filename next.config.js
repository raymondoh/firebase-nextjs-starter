/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === "development";

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  reactStrictMode: true,
  webpack: config => {
    // Preserve your existing fallback config
    config.resolve.fallback = {
      ...config.resolve.fallback,
      net: false,
      tls: false,
      fs: false,
      http2: false,
      http: false,
      https: false,
      zlib: false,
      child_process: false
    };

    // ✅ Exclude src/dev from production builds
    if (!isDev) {
      config.module.rules.push({
        test: /\.(js|ts|tsx)$/,
        include: /src\/dev/,
        use: {
          loader: "null-loader"
        }
      });
    }

    return config;
  },
  serverExternalPackages: ["firebase-admin"],
  images: {
    domains: [
      "storage.googleapis.com",
      "lh3.googleusercontent.com",
      "lh4.googleusercontent.com",
      "lh5.googleusercontent.com",
      "lh6.googleusercontent.com"
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/**"
      }
    ]
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-XSS-Protection",
            value: "1; mode=block"
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN"
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin"
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:;"
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
