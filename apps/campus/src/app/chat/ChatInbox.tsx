'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { ChatConversationDto } from '@pkg/types';
import { Button, Field, UserAvatar } from '../../components/ui';
import { useCampusI18n, useCampusT } from '../../lib/cms';
import styles from './page.module.scss';

function formatListTime(
  iso: string,
  locale: string,
  yesterdayLabel: string,
): string {
  const date = new Date(iso);
  const now = new Date();
  const dateLocale = locale === 'uk' ? 'uk-UA' : 'en-US';
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  if (sameDay) {
    return date.toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()
  ) {
    return yesterdayLabel;
  }
  return date.toLocaleDateString(dateLocale, { weekday: 'short' });
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
  const t = useCampusT();
  const { locale } = useCampusI18n();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((row) => row.title.toLowerCase().includes(q));
  }, [conversations, search]);

  return (
    <aside className={styles.inbox} data-tour-anchor="chat-inbox">
      <div className={styles.inboxHead}>
        <div className={styles.inboxTitleRow}>
          <h2 className={styles.inboxTitle}>{t('chat.title')}</h2>
          {headerExtra}
        </div>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} aria-hidden />
          <Field
            type="search"
            className={styles.searchField}
            placeholder={t('chat.search.placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label={t('chat.search.aria')}
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
            <UserAvatar
              size="md"
              src={conv.type === 'direct' ? conv.peer?.avatarUrl : null}
              name={conv.type === 'direct' ? (conv.peer?.displayName ?? conv.title) : conv.title}
              className={styles.avatar}
            />
            <span className={styles.convMeta}>
              <span className={styles.convTop}>
                <span className={`${styles.convName} ${conv.unreadCount > 0 ? styles.convNameUnread : ''}`}>
                  {conv.title}
                </span>
                <span className={styles.convTime}>
                  {formatListTime(conv.lastMessageAt, locale, t('chat.yesterday'))}
                </span>
              </span>
              <span className={styles.convTop}>
                <span className={styles.convPreview}>{conv.lastMessage ?? t('chat.noMessagesYet')}</span>
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
