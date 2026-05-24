'use client';

import { useState } from 'react';
import type { ChatUserDto } from '@pkg/types';
import { Button, Field } from '../../components/ui';
import styles from './page.module.scss';

export function CreateGroupModal({
  contacts,
  onClose,
  onCreate,
}: {
  contacts: ChatUserDto[];
  onClose: () => void;
  onCreate: (title: string, memberIds: string[]) => Promise<void>;
}) {
  const [title, setTitle] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSubmit = async () => {
    if (!title.trim() || selected.length === 0 || saving) return;
    setSaving(true);
    try {
      await onCreate(title.trim(), selected);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.modalOverlay} role="presentation" onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-group-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="create-group-title" className={styles.modalTitle}>
          Create group chat
        </h2>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="group-chat-title">
            Group name
          </label>
          <Field
            id="group-chat-title"
            className={styles.fieldInput}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Study group"
          />
        </div>
        <p className={styles.threadPeerRole}>Select members</p>
        <div className={styles.contactList}>
          {contacts.map((contact) => {
            const isSelected = selected.includes(contact.id);
            return (
              <Button
                key={contact.id}
                type="button"
                variant="ghost"
                className={`${styles.contactRow} ${isSelected ? styles.contactRowSelected : ''}`}
                onClick={() => toggle(contact.id)}
              >
                <span className={styles.avatar} aria-hidden>
                  {contact.initials}
                </span>
                <span>
                  <span className={styles.convName}>{contact.displayName}</span>
                  <span className={styles.convPreview}> · {contact.roleLabel}</span>
                </span>
              </Button>
            );
          })}
        </div>
        <div className={styles.modalActions}>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!title.trim() || selected.length === 0 || saving}
            loading={saving}
            onClick={() => void handleSubmit()}
          >
            Create
          </Button>
        </div>
      </div>
    </div>
  );
}
