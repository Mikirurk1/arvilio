import {
  platformGet,
  PlatformApiError,
  type PlatformAuditEntryDto,
} from '../../lib/platform-api';
import { Unauthorized } from '../../components/Unauthorized';

export const dynamic = 'force-dynamic';

const cell: React.CSSProperties = {
  padding: '10px 12px',
  borderBottom: '1px solid var(--border)',
  textAlign: 'left',
  fontSize: 'var(--fs-14)',
  verticalAlign: 'top',
};

export default async function AuditLogPage() {
  let entries: PlatformAuditEntryDto[];
  try {
    entries = await platformGet<PlatformAuditEntryDto[]>('/platform/audit-log');
  } catch (error) {
    if (error instanceof PlatformApiError && (error.status === 401 || error.status === 403)) {
      return <Unauthorized status={error.status} />;
    }
    throw error;
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Audit log</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
        <thead>
          <tr>
            <th style={{ ...cell, color: 'var(--text-muted)' }}>When</th>
            <th style={{ ...cell, color: 'var(--text-muted)' }}>Actor</th>
            <th style={{ ...cell, color: 'var(--text-muted)' }}>Action</th>
            <th style={{ ...cell, color: 'var(--text-muted)' }}>School</th>
            <th style={{ ...cell, color: 'var(--text-muted)' }}>IP</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.id}>
              <td style={cell}>{new Date(e.createdAt).toLocaleString()}</td>
              <td style={cell}>{e.actorName}</td>
              <td style={cell}>
                <code>{e.action}</code>
              </td>
              <td style={{ ...cell, color: 'var(--text-muted)' }}>{e.targetSchoolId ?? '—'}</td>
              <td style={{ ...cell, color: 'var(--text-muted)' }}>{e.ip ?? '—'}</td>
            </tr>
          ))}
          {entries.length === 0 ? (
            <tr>
              <td style={{ ...cell, color: 'var(--text-muted)' }} colSpan={5}>
                No audit entries yet.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
