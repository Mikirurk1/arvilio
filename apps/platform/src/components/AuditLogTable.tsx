'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Field } from '@fe/ui';
import type { PlatformAuditEntryDto } from '../lib/platform-api';
import { useDebouncedValue, useInfinitePlatformList } from '../lib/use-infinite-platform-list';
import { InfiniteDataTable } from './InfiniteDataTable';
import { Td } from './ui';
import ui from './ui/ui.module.scss';
import styles from './CampusesTable.module.scss';

export function AuditLogTable({ schoolId }: { schoolId?: string } = {}) {
  const [query, setQuery] = useState('');
  const debouncedQ = useDebouncedValue(query);

  const params = useMemo(
    () => ({
      q: debouncedQ.trim() || undefined,
      schoolId: schoolId || undefined,
      limit: 50,
    }),
    [debouncedQ, schoolId],
  );
  const filterKey = JSON.stringify(params);
  const list = useInfinitePlatformList<PlatformAuditEntryDto>({
    path: '/platform/audit-log',
    params,
    filterKey,
  });

  return (
    <div>
      <div className={styles.toolbar}>
        <Field
          label="Search"
          placeholder="Action, actor, campus id…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <InfiniteDataTable
        headers={['When', 'Actor', 'Action', 'Campus', 'IP']}
        hasMore={list.hasMore}
        loading={list.loading}
        loadingMore={list.loadingMore}
        onLoadMore={list.loadMore}
        loadedCount={list.items.length}
        total={list.total}
        error={list.error}
        empty="No audit entries yet."
      >
        {list.items.map((e) => (
          <tr key={e.id}>
            <Td>{new Date(e.createdAt).toLocaleString()}</Td>
            <Td>{e.actorName}</Td>
            <Td>
              <span className={ui.actionChip}>{e.action}</span>
            </Td>
            <Td muted>
              {e.targetSchoolId ? (
                <Link href={`/schools/${e.targetSchoolId}`} className={ui.tableLink}>
                  {e.targetSchoolId}
                </Link>
              ) : (
                '—'
              )}
            </Td>
            <Td muted>{e.ip ?? '—'}</Td>
          </tr>
        ))}
      </InfiniteDataTable>
    </div>
  );
}
