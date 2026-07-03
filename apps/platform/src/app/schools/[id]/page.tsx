import Link from 'next/link';
import {
  platformGet,
  PlatformApiError,
  type PlatformSchoolDetailDto,
} from '../../../lib/platform-api';
import { Unauthorized } from '../../../components/Unauthorized';
import { SchoolActions } from '../../../components/SchoolActions';

export const dynamic = 'force-dynamic';

function formatBytes(raw: string | number): string {
  const bytes = typeof raw === 'string' ? Number(raw) : raw;
  if (isNaN(bytes)) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

const STATUS_COLOR: Record<PlatformSchoolDetailDto['status'], string> = {
  ACTIVE: 'var(--green)',
  TRIAL: 'var(--amber)',
  SUSPENDED: 'var(--red)',
};

const row: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '10px 0',
  borderBottom: '1px solid var(--border)',
  fontSize: 'var(--fs-14)',
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={row}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

export default async function SchoolDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let school: PlatformSchoolDetailDto;
  try {
    school = await platformGet<PlatformSchoolDetailDto>(`/platform/schools/${id}`);
  } catch (error) {
    if (error instanceof PlatformApiError && (error.status === 401 || error.status === 403)) {
      return <Unauthorized status={error.status} />;
    }
    throw error;
  }

  return (
    <div>
      <Link href="/schools" style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-14)' }}>
        ← Schools
      </Link>
      <h1 style={{ margin: '8px 0 0' }}>{school.name}</h1>
      <div style={{ maxWidth: 520, marginTop: 16 }}>
        <Row
          label="Status"
          value={
            <strong style={{ color: STATUS_COLOR[school.status] }}>{school.status}</strong>
          }
        />
        <Row label="Slug" value={school.slug} />
        <Row label="Primary domain" value={school.primaryDomain ?? '—'} />
        <Row label="Subscription" value={school.subscriptionStatus ?? '—'} />
        <Row label="Storage used" value={formatBytes(school.storageUsedBytes)} />
        <Row label="Members" value={school.memberCount} />
        <Row label="Admins" value={school.adminCount} />
        <Row label="Teachers" value={school.teacherCount} />
        <Row label="Students" value={school.studentCount} />
        <Row label="Created" value={new Date(school.createdAt).toLocaleDateString()} />
      </div>
      <SchoolActions schoolId={school.id} status={school.status} />
    </div>
  );
}
