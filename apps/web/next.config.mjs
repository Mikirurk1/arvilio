import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const apiProxyTarget = (process.env.API_PROXY_TARGET ?? 'http://127.0.0.1:3000').replace(/\/$/, '');

/** Match backend `MATERIAL_ATTACHMENT_MAX_BYTES` (default 100 MB) + multipart / proxy overhead. */
const MATERIAL_MAX_BYTES = Number.parseInt(
  process.env.MATERIAL_ATTACHMENT_MAX_BYTES ?? '104857600',
  10,
);
const PROXY_MAX_BYTES = Math.ceil(MATERIAL_MAX_BYTES * 1.25);

const nextConfig = {
  output: 'standalone',
  experimental: {
    proxyClientMaxBodySize: PROXY_MAX_BYTES,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiProxyTarget}/api/:path*`,
      },
    ];
  },
};

export default withPayload(nextConfig);
