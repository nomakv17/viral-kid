import type { NextConfig } from "next";

// Content Security Policy directives
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://api.twitter.com https://api.x.com https://www.googleapis.com https://oauth2.googleapis.com https://oauth.reddit.com https://www.reddit.com https://graph.instagram.com https://graph.facebook.com https://api.instagram.com https://openrouter.ai",
  "frame-src 'self'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
];

const nextConfig: NextConfig = {
  // Performance optimizations
  poweredByHeader: false,

  // Security headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspDirectives.join("; "),
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
