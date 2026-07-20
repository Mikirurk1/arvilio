'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Field } from '@fe/ui';
import type { PlatformSchoolRowDto } from '../lib/platform-api';
import { useDebouncedValue, useInfinitePlatformList } from '../lib/use-infinite-platform-list';
import { InfiniteDataTable } from './InfiniteDataTable';
import { StatusBadge, Td } from './ui';
import ui from './ui/ui.module.scss';
import styles from './CampusesTable.module.scss';

type StatusFilter = 'all' | PlatformSchoolRowDto['status'];
type SubFilter = 'all' | 'none' | 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED';

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'All statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'TRIAL', label: 'Trial' },
  { value: 'SUSPENDED', label: 'Suspended' },
];

const SUB_OPTIONS: Array<{ value: SubFilter; label: string }> = [
  { value: 'all', label: 'All subscriptions' },
  { value: 'none', label: 'No subscription' },
  { value: 'TRIALING', label: 'Trialing' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PAST_DUE', label: 'Past due' },
  { value: 'CANCELED', label: 'Canceled' },
];

/**
 * Campuses list with server-side search/filters and infinite scroll.
 */
export function CampusesTable() {
  const [query, setQuery] = useState('');
  const debouncedQ = useDebouncedValue(query);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [subFilter, setSubFilter] = useState<SubFilter>('all');

  const params = useMemo(
    () => ({
      q: debouncedQ.trim() || undefined,
      status: statusFilter === 'all' ? undefined : statusFilter,
      subscriptionStatus: subFilter === 'all' ? undefined : subFilter,
      limit: 25,
    }),
    [debouncedQ, statusFilter, subFilter],
  );
  const filterKey = JSON.stringify(params);
  const list = useInfinitePlatformList<PlatformSchoolRowDto>({
    path: '/platform/schools',
    params,
    filterKey,
  });

  return (
    <div>
      <div className={styles.toolbar}>
        <Field
          label="Search"
          placeholder="Name, slug…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Field
          as="select"
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Field>
        <Field
          as="select"
          label="Subscription"
          value={subFilter}
          onChange={(e) => setSubFilter(e.target.value as SubFilter)}
        >
          {SUB_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Field>
      </div>

      <InfiniteDataTable
        headers={['Name', 'Owner', 'Slug', 'Status', 'Members', 'Subscription']}
        hasMore={list.hasMore}
        loading={list.loading}
        loadingMore={list.loadingMore}
        onLoadMore={list.loadMore}
        loadedCount={list.items.length}
        total={list.total}
        error={list.error}
        empty="No campuses match these filters."
      >
        {list.items.map((s) => (
          <tr key={s.id}>
            <Td>
              <Link href={`/schools/${s.id}`} className={ui.tableLink}>
                {s.name}
              </Link>
            </Td>
            <Td muted>{s.ownerDisplayName ?? '—'}</Td>
            <Td muted>{s.slug}</Td>
            <Td>
              <StatusBadge status={s.status} />
            </Td>
            <Td>{s.memberCount}</Td>
            <Td muted>{s.subscriptionStatus ?? '—'}</Td>
          </tr>
        ))}
      </InfiniteDataTable>
    </div>
  );
}
