import Link from 'next/link';
import {
  Building2,
  Crown,
  GraduationCap,
  HardDrive,
  Shield,
  UserRound,
  Users,
} from 'lucide-react';
import {
  platformGet,
  PlatformApiError,
  type PlatformSchoolDetailDto,
} from '../../../../lib/platform-api';
import { formatBytes } from '../../../../lib/format';
import { Unauthorized } from '../../../../components/Unauthorized';
import { SchoolActions } from '../../../../components/SchoolActions';
import { SchoolBillingCountryEditor } from '../../../../components/SchoolBillingCountryEditor';
import { CampusMembersPanel } from '../../../../components/CampusMembersPanel';
import {
  DetailRow,
  PageGrid,
  PageHeader,
  PageStack,
  Panel,
  StatCard,
  StatGrid,
  StatusBadge,
} from '../../../../components/ui';
import ui from '../../../../components/ui/ui.module.scss';

export const dynamic = 'force-dynamic';

export default async function CampusDetailPage({
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
    <PageStack>
      <PageHeader
        back={<Link href="/schools">← Campuses</Link>}
        icon={<Building2 size={22} aria-hidden />}
        title={school.name}
        description="Campus tenant detail — people, billing, and operator actions."
        actions={
          <>
            <StatusBadge status={school.status} />
            <SchoolActions schoolId={school.id} status={school.status} />
          </>
        }
      />

      <StatGrid>
        <StatCard
          label="Members"
          value={school.memberCount}
          icon={<Users size={18} aria-hidden />}
        />
        <StatCard
          label="Admins"
          value={school.adminCount}
          icon={<Shield size={18} aria-hidden />}
        />
        <StatCard
          label="Teachers"
          value={school.teacherCount}
          icon={<GraduationCap size={18} aria-hidden />}
        />
        <StatCard
          label="Students"
          value={school.studentCount}
          icon={<UserRound size={18} aria-hidden />}
        />
        <StatCard
          label="Storage"
          value={formatBytes(school.storageUsedBytes)}
          icon={<HardDrive size={18} aria-hidden />}
        />
      </StatGrid>

      <PageGrid>
        <Panel title="Campus" icon={<Building2 size={16} aria-hidden />}>
          <DetailRow label="Status" value={<StatusBadge status={school.status} />} />
          <DetailRow label="Slug" value={school.slug} />
          <DetailRow label="Primary domain" value={school.primaryDomain ?? '—'} />
          <DetailRow label="Subscription" value={school.subscriptionStatus ?? '—'} />
          <DetailRow label="Created" value={new Date(school.createdAt).toLocaleDateString()} />
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
            <p className={ui.mutedCopy} style={{ marginBottom: 12 }}>
              Campus subscription country — used for SaaS plan price and payment rail (Control
              Plane only).
            </p>
            <SchoolBillingCountryEditor schoolId={school.id} initial={school.billingCountry} />
          </div>
        </Panel>

        <div className={ui.pageStack}>
          <Panel title="Owner" icon={<Crown size={16} aria-hidden />}>
            {school.owner ? (
              <>
                <DetailRow label="Name" value={school.owner.displayName} />
                <DetailRow label="Email" value={school.owner.email} />
                <DetailRow label="Status" value={<StatusBadge status={school.owner.status} />} />
                <DetailRow
                  label="Account created"
                  value={new Date(school.owner.createdAt).toLocaleDateString()}
                />
                <p className={ui.mutedCopy} style={{ marginTop: 8 }}>
                  Owner = earliest active ADMIN (same default as impersonation).
                </p>
              </>
            ) : (
              <p className={ui.mutedCopy}>No active admin — campus has no owner.</p>
            )}
          </Panel>

          <Panel title="Admins" icon={<Shield size={16} aria-hidden />}>
            {school.admins.length === 0 ? (
              <p className={ui.mutedCopy}>No active admins.</p>
            ) : (
              <ul className={ui.mutedCopy} style={{ margin: 0, paddingLeft: '1.1rem' }}>
                {school.admins.map((a, i) => (
                  <li key={a.id} style={{ marginBottom: 6 }}>
                    <strong style={{ color: 'var(--text-primary)' }}>{a.displayName}</strong>
                    {i === 0 ? ' (owner)' : ''} — {a.email} · <StatusBadge status={a.status} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </PageGrid>

      <Panel title="All members" icon={<Users size={16} aria-hidden />} variant="flush">
        <CampusMembersPanel schoolId={school.id} />
      </Panel>
    </PageStack>
  );
}
