import { loadRootEnv } from '../../scripts/load-root-env.mjs';
import { withPayload } from '@payloadcms/next/withPayload';

loadRootEnv();

/** @type {import('next').NextConfig} */
const hubOrigin = (process.env.HUB_ORIGIN ?? process.env.WWW_ORIGIN ?? 'http://localhost:4400').replace(
  /\/$/,
  '',
);

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
];

const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@pkg/types'],
  async headers() {
    return [
      { source: '/(.*)', headers: securityHeaders },
      {
        source: '/payload-api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: hubOrigin },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
      // Long-cache immutable media (filenames are content-addressed / stable uploads).
      {
        source: '/media/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/payload-api/media/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: hubOrigin },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
    ];
  },
  async redirects() {
    return [{ source: '/', destination: '/cms-admin', permanent: false }];
  },
};

export default withPayload(nextConfig);
