import Link from 'next/link';

/**
 * Shown when the platform API rejects the request (401/403).
 * Operators must use Control Plane login — not campus self-serve auth.
 */
export function Unauthorized({ status }: { status: number }) {
  return (
    <div style={{ padding: '40px 0', maxWidth: 480 }}>
      <h1 style={{ marginTop: 0, fontFamily: 'var(--font-display)' }}>Not authorized</h1>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        {status === 401
          ? 'You are not signed in as a platform operator.'
          : 'Your account is not a platform operator. Control Plane access is invite/CLI only.'}
      </p>
      <p style={{ marginTop: 20 }}>
        <Link
          href="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            minHeight: 44,
            padding: '0 18px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-primary)',
            color: 'var(--on-inverse)',
            fontWeight: 600,
          }}
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
