'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { ChatConversationDto } from '@pkg/types';
import { Button, Field } from '../../components/ui';
import styles from './page.module.scss';

function formatListTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  if (sameDay) {
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()
  ) {
    return 'Yesterday';
  }
  return date.toLocaleDateString(undefined, { weekday: 'short' });
}

export function ChatInbox({
  conversations,
  activeId,
  onSelect,
  headerExtra,
}: {
  conversations: ChatConversationDto[];
  activeId: string | null;
  onSelect: (id: string) => void;
  headerExtra?: React.ReactNode;
}) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((row) => row.title.toLowerCase().includes(q));
  }, [conversations, search]);

  return (
    <aside className={styles.inbox}>
      <div className={styles.inboxHead}>
        <div className={styles.inboxTitleRow}>
          <h2 className={styles.inboxTitle}>Messages</h2>
          {headerExtra}
        </div>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} aria-hidden />
          <Field
            type="search"
            className={styles.searchField}
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search conversations"
          />
        </div>
      </div>
      <div className={styles.convList}>
        {filtered.map((conv) => (
          <Button
            key={conv.id}
            type="button"
            variant="ghost"
            className={`${styles.convRow} ${activeId === conv.id ? styles.convRowActive : ''}`}
            onClick={() => onSelect(conv.id)}
          >
            <span className={styles.avatar} aria-hidden>
              {conv.type === 'group' ? 'G' : (conv.peer?.initials ?? '?')}
            </span>
            <span className={styles.convMeta}>
              <span className={styles.convTop}>
                <span className={styles.convName}>{conv.title}</span>
                <span className={styles.convTime}>{formatListTime(conv.lastMessageAt)}</span>
              </span>
              <span className={styles.convTop}>
                <span className={styles.convPreview}>{conv.lastMessage ?? 'No messages yet'}</span>
                {conv.unreadCount > 0 ? (
                  <span className={styles.unreadBadge}>{conv.unreadCount}</span>
                ) : null}
              </span>
            </span>
          </Button>
        ))}
      </div>
    </aside>
  );
}
