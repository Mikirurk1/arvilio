import {
  platformGet,
  PlatformApiError,
  type PlatformDashboardDto,
} from '../../lib/platform-api';
import { Unauthorized } from '../../components/Unauthorized';

export const dynamic = 'force-dynamic';

function formatBytes(bytes: string): string {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(n) / Math.log(1024)), units.length - 1);
  return `${(n / 1024 ** i).toFixed(1)} ${units[i]}`;
}

const cardStyle: React.CSSProperties = {
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: '18px 20px',
};

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={cardStyle}>
      <div style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-14)' }}>{label}</div>
      <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: 6 }}>{value}</div>
    </div>
  );
}

export default async function DashboardPage() {
  let data: PlatformDashboardDto;
  try {
    data = await platformGet<PlatformDashboardDto>('/platform/dashboard');
  } catch (error) {
    if (error instanceof PlatformApiError && (error.status === 401 || error.status === 403)) {
      return <Unauthorized status={error.status} />;
    }
    throw error;
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Dashboard</h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 16,
          marginTop: 20,
        }}
      >
        <Stat label="Schools" value={data.schoolCount} />
        <Stat label="Active" value={data.activeSchoolCount} />
        <Stat label="Trial" value={data.trialSchoolCount} />
        <Stat label="Suspended" value={data.suspendedSchoolCount} />
        <Stat label="Active users" value={data.activeUserCount} />
        <Stat label="Active subscriptions" value={data.activeSubscriptionCount} />
        <Stat label="Storage used" value={formatBytes(data.totalStorageUsedBytes)} />
        <Stat label="MRR" value={`$${(data.mrrMinor / 100).toFixed(2)}`} />
      </div>
    </div>
  );
}
