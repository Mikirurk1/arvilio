import Link from 'next/link';
import {
  AlertTriangle,
  Ban,
  Building2,
  CheckCircle2,
  CreditCard,
  HardDrive,
  LayoutDashboard,
  ScrollText,
  Shield,
  Timer,
  TrendingUp,
  UserMinus,
  Users,
} from 'lucide-react';
import {
  platformGet,
  PlatformApiError,
  type PlatformDashboardDto,
} from '../../../lib/platform-api';
import { formatBytes, formatMrrMinor } from '../../../lib/format';
import { Unauthorized } from '../../../components/Unauthorized';
import {
  PageGrid,
  PageHeader,
  PageStack,
  Panel,
  StatCard,
  StatGrid,
  StatusBadge,
} from '../../../components/ui';
import ui from '../../../components/ui/ui.module.scss';

export const dynamic = 'force-dynamic';

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;
  const diffSec = Math.round((then - Date.now()) / 1000);
  const abs = Math.abs(diffSec);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  if (abs < 60) return rtf.format(diffSec, 'second');
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), 'hour');
  return rtf.format(Math.round(diffSec / 86400), 'day');
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
    <PageStack>
      <PageHeader
        icon={<LayoutDashboard size={22} aria-hidden />}
        title="Dashboard"
        description="Fleet health across Arvilio Campus tenants."
      />

      <StatGrid>
        <StatCard
          label="Campuses"
          value={data.schoolCount}
          icon={<Building2 size={18} aria-hidden />}
        />
        <StatCard
          label="Active"
          value={data.activeSchoolCount}
          icon={<CheckCircle2 size={18} aria-hidden />}
        />
        <StatCard
          label="Trial"
          value={data.trialSchoolCount}
          icon={<Timer size={18} aria-hidden />}
        />
        <StatCard
          label="Suspended"
          value={data.suspendedSchoolCount}
          icon={<Ban size={18} aria-hidden />}
        />
        <StatCard
          label="Active users"
          value={data.activeUserCount}
          icon={<Users size={18} aria-hidden />}
        />
        <StatCard
          label="Active subscriptions"
          value={data.activeSubscriptionCount}
          icon={<CreditCard size={18} aria-hidden />}
        />
        <StatCard
          label="Storage used"
          value={formatBytes(data.totalStorageUsedBytes)}
          icon={<HardDrive size={18} aria-hidden />}
        />
        <StatCard
          label="MRR"
          value={data.mrrMinor ? formatMrrMinor(data.mrrMinor) : '—'}
          icon={<TrendingUp size={18} aria-hidden />}
        />
      </StatGrid>

      <div className={ui.metricStrip} aria-label="Secondary metrics">
        <div className={ui.metricChip}>
          <Shield size={14} aria-hidden />
          <span>Operators</span>
          <strong>{data.userStats.platformOperators}</strong>
        </div>
        <div className={ui.metricChip}>
          <UserMinus size={14} aria-hidden />
          <span>Orphans</span>
          <strong>{data.userStats.usersWithoutMembership}</strong>
        </div>
        <div className={ui.metricChip}>
          <Ban size={14} aria-hidden />
          <span>Blocked</span>
          <strong>{data.userStats.blockedUsers}</strong>
        </div>
        <div className={ui.metricChip}>
          <Timer size={14} aria-hidden />
          <span>Trials ending</span>
          <strong>{data.trialsEndingSoon.length}</strong>
        </div>
        <div className={ui.metricChip}>
          <CreditCard size={14} aria-hidden />
          <span>Rails configured</span>
          <strong>
            {data.billingHealth.configuredCount}/{data.billingHealth.totalRails}
          </strong>
        </div>
        <div className={ui.metricChip}>
          <CreditCard size={14} aria-hidden />
          <span>Trialing subs</span>
          <strong>{data.trialingSubscriptionCount}</strong>
        </div>
      </div>

      {data.trialsEndingSoon.length > 0 ? (
        <Panel title="Trials ending soon" icon={<AlertTriangle size={16} aria-hidden />}>
          <ul className={ui.opsList}>
            {data.trialsEndingSoon.map((row) => (
              <li key={row.id} className={ui.opsListItem}>
                <Link href={`/schools/${row.id}`} className={ui.tableLink}>
                  {row.name}
                </Link>
                <span className={ui.opsListMeta}>{formatRelative(row.trialEndsAt)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      <PageGrid>
        <Panel
          title="Recent campuses"
          icon={<Building2 size={16} aria-hidden />}
          actions={
            <Link href="/schools" className={ui.tableLink}>
              View all
            </Link>
          }
        >
          {data.recentCampuses.length === 0 ? (
            <p className={ui.mutedCopy}>No campuses yet.</p>
          ) : (
            <ul className={ui.opsList}>
              {data.recentCampuses.map((campus) => (
                <li key={campus.id} className={ui.opsListItem}>
                  <span className={ui.opsListMain}>
                    <Link href={`/schools/${campus.id}`} className={ui.tableLink}>
                      {campus.name}
                    </Link>
                    <StatusBadge status={campus.status} />
                  </span>
                  <span className={ui.opsListMeta}>{formatRelative(campus.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Recent audit"
          icon={<ScrollText size={16} aria-hidden />}
          actions={
            <Link href="/audit-log" className={ui.tableLink}>
              View all
            </Link>
          }
        >
          {data.recentAudit.length === 0 ? (
            <p className={ui.mutedCopy}>No operator actions yet.</p>
          ) : (
            <ul className={ui.opsList}>
              {data.recentAudit.map((entry) => (
                <li key={entry.id} className={ui.opsListItem}>
                  <span className={ui.opsListMain}>
                    <span className={ui.opsListAction}>{entry.action}</span>
                    <span className={ui.opsListMeta}>{entry.actorName}</span>
                  </span>
                  <span className={ui.opsListMeta}>{formatRelative(entry.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </PageGrid>
    </PageStack>
  );
}
