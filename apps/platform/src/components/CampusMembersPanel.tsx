'use client';

import { useMemo, useState } from 'react';
import { Field } from '@fe/ui';
import type { PlatformSchoolMemberRowDto } from '../lib/platform-api';
import { useDebouncedValue, useInfinitePlatformList } from '../lib/use-infinite-platform-list';
import { InfiniteDataTable } from './InfiniteDataTable';
import { StatusBadge, Td } from './ui';
import styles from './CampusesTable.module.scss';

type RoleFilter = 'all' | 'ADMIN' | 'TEACHER' | 'STUDENT';
type MemStatusFilter = 'all' | 'ACTIVE' | 'INVITED' | 'REMOVED';

/**
 * Campus members directory with filters + infinite scroll.
 */
export function CampusMembersPanel({ schoolId }: { schoolId: string }) {
  const [query, setQuery] = useState('');
  const debouncedQ = useDebouncedValue(query);
  const [role, setRole] = useState<RoleFilter>('all');
  const [membershipStatus, setMembershipStatus] = useState<MemStatusFilter>('all');

  const params = useMemo(
    () => ({
      q: debouncedQ.trim() || undefined,
      role: role === 'all' ? undefined : role,
      membershipStatus: membershipStatus === 'all' ? undefined : membershipStatus,
      limit: 25,
    }),
    [debouncedQ, role, membershipStatus],
  );
  const filterKey = `${schoolId}:${JSON.stringify(params)}`;
  const list = useInfinitePlatformList<PlatformSchoolMemberRowDto>({
    path: `/platform/schools/${schoolId}/members`,
    params,
    filterKey,
  });

  return (
    <div>
      <div className={styles.toolbar}>
        <Field
          label="Search members"
          placeholder="Name, email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Field as="select" label="Role" value={role} onChange={(e) => setRole(e.target.value as RoleFilter)}>
          <option value="all">All roles</option>
          <option value="ADMIN">Admin</option>
          <option value="TEACHER">Teacher</option>
          <option value="STUDENT">Student</option>
        </Field>
        <Field
          as="select"
          label="Membership"
          value={membershipStatus}
          onChange={(e) => setMembershipStatus(e.target.value as MemStatusFilter)}
        >
          <option value="all">All memberships</option>
          <option value="ACTIVE">Active</option>
          <option value="INVITED">Invited</option>
          <option value="REMOVED">Removed</option>
        </Field>
      </div>

      <InfiniteDataTable
        headers={['Name', 'Email', 'Role', 'User status', 'Membership', 'Joined']}
        hasMore={list.hasMore}
        loading={list.loading}
        loadingMore={list.loadingMore}
        onLoadMore={list.loadMore}
        loadedCount={list.items.length}
        total={list.total}
        error={list.error}
        empty="No members match these filters."
        maxHeight="32rem"
      >
        {list.items.map((m) => (
          <tr key={m.membershipId}>
            <Td>
              {m.displayName}
              {m.isOwner ? ' · Owner' : ''}
            </Td>
            <Td muted>{m.email}</Td>
            <Td>{m.role}</Td>
            <Td>
              <StatusBadge status={m.userStatus} />
            </Td>
            <Td muted>{m.membershipStatus}</Td>
            <Td muted>{new Date(m.joinedAt).toLocaleDateString()}</Td>
          </tr>
        ))}
      </InfiniteDataTable>
    </div>
  );
}
