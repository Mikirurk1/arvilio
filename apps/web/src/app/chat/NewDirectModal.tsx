'use client';

import { useMemo, useState } from 'react';
import type { ChatUserDto } from '@pkg/types';
import { Button, Field } from '../../components/ui';
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
        <h2 id="new-chat-title" className={styles.modalTitle}>
          New message
        </h2>
        <Field
          type="search"
          className={styles.fieldInput}
          placeholder="Search people..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search people"
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
        </div>
        <div className={styles.modalActions}>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
