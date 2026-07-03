/**
 * Shown when the platform API rejects the request (401/403). Cross-app SSO (shared
 * cookie domain or a dedicated platform login) is a known seam — see
 * docs/multi-tenant-execution-plan.md Phase 4D. For now the operator must hold a
 * valid platform-operator session on this origin.
 */
export function Unauthorized({ status }: { status: number }) {
  return (
    <div style={{ padding: '40px 0' }}>
      <h1 style={{ marginTop: 0 }}>Not authorized</h1>
      <p style={{ color: 'var(--text-muted)' }}>
        {status === 401
          ? 'You are not signed in as a platform operator on this origin.'
          : 'Your account is not a platform operator.'}
      </p>
    </div>
  );
}
