import { loadRootEnv } from '../../scripts/load-root-env.mjs';

loadRootEnv();

/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
];

function cmsImageRemotePatterns() {
  const raw = process.env.CMS_URL ?? process.env.NEXT_PUBLIC_CMS_URL ?? 'http://127.0.0.1:4410';
  /** @type {import('next/dist/shared/lib/image-config').RemotePattern[]} */
  const patterns = [
    { protocol: 'http', hostname: '127.0.0.1', port: '4410', pathname: '/**' },
    { protocol: 'http', hostname: 'localhost', port: '4410', pathname: '/**' },
  ];
  try {
    const u = new URL(raw);
    const protocol = u.protocol.replace(':', '');
    if (protocol === 'http' || protocol === 'https') {
      patterns.push({
        protocol,
        hostname: u.hostname,
        ...(u.port ? { port: u.port } : {}),
        pathname: '/**',
      });
    }
  } catch {
    /* keep localhost defaults */
  }
  return patterns;
}

const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@fe/ui', '@pkg/types'],
  images: {
    remotePatterns: cmsImageRemotePatterns(),
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};

export default nextConfig;
