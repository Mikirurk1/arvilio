'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Ban,
  Building2,
  CheckCircle2,
  Shield,
  UserMinus,
  Users,
} from 'lucide-react';
import { Field } from '@fe/ui';
import type { PlatformUserRowDto, PlatformUserStatsDto } from '../lib/platform-api';
import { useDebouncedValue, useInfinitePlatformList } from '../lib/use-infinite-platform-list';
import { InfiniteDataTable } from './InfiniteDataTable';
import { StatusBadge, StatCard, StatGrid, Td } from './ui';
import ui from './ui/ui.module.scss';
import styles from './CampusesTable.module.scss';

type StatusFilter = 'all' | 'ACTIVE' | 'PAUSED' | 'BLOCKED' | 'LEAVED';
type RoleFilter = 'all' | 'ADMIN' | 'TEACHER' | 'STUDENT';
type ScopeFilter = 'all' | 'operators' | 'members' | 'orphan';

/**
 * Global users directory for Control Plane.
 */
export function UsersDirectory({ initialStats }: { initialStats: PlatformUserStatsDto }) {
  const [query, setQuery] = useState('');
  const debouncedQ = useDebouncedValue(query);
  const [status, setStatus] = useState<StatusFilter>('all');
  const [membershipRole, setMembershipRole] = useState<RoleFilter>('all');
  const [scope, setScope] = useState<ScopeFilter>('all');

  const params = useMemo(
    () => ({
      q: debouncedQ.trim() || undefined,
      status: status === 'all' ? undefined : status,
      membershipRole: membershipRole === 'all' ? undefined : membershipRole,
      scope: scope === 'all' ? undefined : scope,
      limit: 25,
    }),
    [debouncedQ, status, membershipRole, scope],
  );
  const filterKey = JSON.stringify(params);
  const list = useInfinitePlatformList<PlatformUserRowDto>({
    path: '/platform/users',
    params,
    filterKey,
  });

  return (
    <div>
      <StatGrid>
        <StatCard
          label="Total users"
          value={initialStats.totalUsers}
          icon={<Users size={18} aria-hidden />}
        />
        <StatCard
          label="Active"
          value={initialStats.activeUsers}
          icon={<CheckCircle2 size={18} aria-hidden />}
        />
        <StatCard
          label="With campus"
          value={initialStats.usersWithMembership}
          icon={<Building2 size={18} aria-hidden />}
        />
        <StatCard
          label="No campus"
          value={initialStats.usersWithoutMembership}
          icon={<UserMinus size={18} aria-hidden />}
        />
        <StatCard
          label="Operators"
          value={initialStats.platformOperators}
          icon={<Shield size={18} aria-hidden />}
        />
        <StatCard
          label="Blocked"
          value={initialStats.blockedUsers}
          icon={<Ban size={18} aria-hidden />}
        />
      </StatGrid>

      <div className={styles.toolbar} style={{ marginTop: 16 }}>
        <Field
          label="Search"
          placeholder="Name, email, id…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Field
          as="select"
          label="Account status"
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
        >
          <option value="all">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="PAUSED">Paused</option>
          <option value="BLOCKED">Blocked</option>
          <option value="LEAVED">Left</option>
        </Field>
        <Field
          as="select"
          label="Membership role"
          value={membershipRole}
          onChange={(e) => setMembershipRole(e.target.value as RoleFilter)}
        >
          <option value="all">Any role</option>
          <option value="ADMIN">Admin</option>
          <option value="TEACHER">Teacher</option>
          <option value="STUDENT">Student</option>
        </Field>
        <Field
          as="select"
          label="Scope"
          value={scope}
          onChange={(e) => setScope(e.target.value as ScopeFilter)}
        >
          <option value="all">All users</option>
          <option value="members">With campus</option>
          <option value="orphan">No campus</option>
          <option value="operators">Platform operators</option>
        </Field>
      </div>

      <InfiniteDataTable
        headers={['Name', 'Email', 'Status', 'Campuses', 'Operator', 'Created']}
        hasMore={list.hasMore}
        loading={list.loading}
        loadingMore={list.loadingMore}
        onLoadMore={list.loadMore}
        loadedCount={list.items.length}
        total={list.total}
        error={list.error}
        empty="No users match these filters."
      >
        {list.items.map((u) => (
          <tr key={u.id}>
            <Td>{u.displayName}</Td>
            <Td muted>{u.email}</Td>
            <Td>
              <StatusBadge status={u.status} />
            </Td>
            <Td>
              {u.membershipCount === 0 ? (
                <span className={ui.mutedCopy}>—</span>
              ) : (
                <>
                  {u.memberships.map((m) => (
                    <span key={`${m.schoolId}-${m.role}`} className={ui.membershipChip}>
                      <Link href={`/schools/${m.schoolId}`} className={ui.tableLink}>
                        {m.schoolName}
                      </Link>
                      {` · ${m.role}`}
                    </span>
                  ))}
                  {u.membershipCount > u.memberships.length
                    ? ` +${u.membershipCount - u.memberships.length}`
                    : null}
                </>
              )}
            </Td>
            <Td>
              {u.isPlatformOperator ? (
                <StatusBadge status={u.platformRole ?? 'OPERATOR'} />
              ) : (
                <span className={ui.mutedCopy}>—</span>
              )}
            </Td>
            <Td muted>{new Date(u.createdAt).toLocaleDateString()}</Td>
          </tr>
        ))}
      </InfiniteDataTable>
    </div>
  );
}
