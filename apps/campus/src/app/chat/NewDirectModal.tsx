'use client';

import { useMemo, useState } from 'react';
import { MessageSquarePlus } from 'lucide-react';
import type { ChatUserDto } from '@pkg/types';
import { Button, Field } from '../../components/ui';
import { useCampusT } from '../../lib/cms';
import styles from './page.module.scss';

export function NewDirectModal({
  contacts,
  onClose,
  onSelect,
}: {
  contacts: ChatUserDto[];
  onClose: () => void;
  onSelect: (peerUserId: string) => Promise<void>;
}) {
  const t = useCampusT();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(
      (c) =>
        c.displayName.toLowerCase().includes(q) ||
        c.roleLabel.toLowerCase().includes(q),
    );
  }, [contacts, search]);

  return (
    <div className={styles.modalOverlay} role="presentation" onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-chat-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <span className={styles.modalBadge}>
            <MessageSquarePlus size={14} aria-hidden />
            {t('chat.dm.badge')}
          </span>
          <h2 id="new-chat-title" className={styles.modalTitle}>
            {t('chat.dm.title')}
          </h2>
          <p className={styles.modalHint}>{t('chat.dm.hint')}</p>
        </div>
        <Field
          type="search"
          className={styles.fieldInput}
          placeholder={t('chat.dm.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label={t('chat.dm.searchAria')}
        />
        <div className={styles.contactList}>
          {filtered.map((contact) => (
            <Button
              key={contact.id}
              type="button"
              variant="ghost"
              className={styles.contactRow}
              disabled={loading}
              onClick={() => {
                setLoading(true);
                void onSelect(contact.id).finally(() => setLoading(false));
              }}
            >
              <span className={styles.avatar} aria-hidden>
                {contact.initials}
              </span>
              <span>
                <span className={styles.convName}>{contact.displayName}</span>
                <span className={styles.convPreview}> · {contact.roleLabel}</span>
              </span>
            </Button>
          ))}
          {filtered.length === 0 ? (
            <p className={styles.modalEmpty}>{t('chat.dm.empty')}</p>
          ) : null}
        </div>
        <div className={styles.modalActions}>
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('chat.dm.cancel')}
          </Button>
        </div>
      </div>
    </div>
  );
}
