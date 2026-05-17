export function webOrigin(): string {
  return process.env['WEB_ORIGIN'] ?? 'http://localhost:4200';
}

/** Redirect back to Profile → Connections with query flags for toasts. */
export function profileConnectionsRedirect(query: Record<string, string>): string {
  const configured = process.env['OAUTH_LINK_SUCCESS_REDIRECT'] ?? process.env['GOOGLE_LINK_SUCCESS_REDIRECT'];
  const base = configured?.split('?')[0] ?? `${webOrigin()}/profile`;
  return `${base}?${new URLSearchParams({ tab: 'connections', ...query }).toString()}`;
}
