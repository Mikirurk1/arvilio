import Link from 'next/link';
import {
  platformGet,
  PlatformApiError,
  type PlatformSchoolRowDto,
} from '../../lib/platform-api';
import { Unauthorized } from '../../components/Unauthorized';

export const dynamic = 'force-dynamic';

const STATUS_COLOR: Record<PlatformSchoolRowDto['status'], string> = {
  ACTIVE: 'var(--green)',
  TRIAL: 'var(--amber)',
  SUSPENDED: 'var(--red)',
};

const cell: React.CSSProperties = {
  padding: '10px 12px',
  borderBottom: '1px solid var(--border)',
  textAlign: 'left',
  fontSize: 'var(--fs-14)',
};

export default async function SchoolsPage() {
  let rows: PlatformSchoolRowDto[];
  try {
    rows = await platformGet<PlatformSchoolRowDto[]>('/platform/schools');
  } catch (error) {
    if (error instanceof PlatformApiError && (error.status === 401 || error.status === 403)) {
      return <Unauthorized status={error.status} />;
    }
    throw error;
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Schools</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
        <thead>
          <tr>
            <th style={{ ...cell, color: 'var(--text-muted)' }}>Name</th>
            <th style={{ ...cell, color: 'var(--text-muted)' }}>Slug</th>
            <th style={{ ...cell, color: 'var(--text-muted)' }}>Status</th>
            <th style={{ ...cell, color: 'var(--text-muted)' }}>Members</th>
            <th style={{ ...cell, color: 'var(--text-muted)' }}>Subscription</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => (
            <tr key={s.id}>
              <td style={cell}>
                <Link href={`/schools/${s.id}`} style={{ color: 'var(--accent)' }}>
                  {s.name}
                </Link>
              </td>
              <td style={{ ...cell, color: 'var(--text-muted)' }}>{s.slug}</td>
              <td style={{ ...cell, color: STATUS_COLOR[s.status], fontWeight: 600 }}>
                {s.status}
              </td>
              <td style={cell}>{s.memberCount}</td>
              <td style={{ ...cell, color: 'var(--text-muted)' }}>{s.subscriptionStatus ?? '—'}</td>
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td style={{ ...cell, color: 'var(--text-muted)' }} colSpan={5}>
                No schools yet.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
