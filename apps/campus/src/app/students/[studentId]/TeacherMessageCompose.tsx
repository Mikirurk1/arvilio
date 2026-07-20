'use client';

import { useState } from 'react';
import { Button, Field, SurfaceCard } from '../../../components/ui';
import { toast } from '../../../features/notifications';
import { SEND_TEACHER_MESSAGE } from '../../../graphql/operations';
import { graphqlRequest } from '../../../lib/graphql-client';
import styles from './page.module.scss';

export function TeacherMessageCompose({ studentId }: { studentId: string }) {
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    const trimmed = body.trim();
    if (!trimmed) return;
    setSending(true);
    try {
      await graphqlRequest(SEND_TEACHER_MESSAGE, {
        input: { studentId, body: trimmed },
      });
      setBody('');
      toast.success(
        'Message sent',
        'The student receives an email when teacher messages are enabled.',
      );
    } catch (error) {
      toast.error(
        'Failed to send message',
        error instanceof Error ? error.message : undefined,
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <SurfaceCard className={styles.tabCard}>
      <p className={styles.tabIntro}>
        Send a message to this student. They receive an email when teacher messages are enabled in
        their profile.
      </p>
      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="teacher-message-body">
          Message
        </label>
        <Field
          id="teacher-message-body"
          as="textarea"
          className={styles.input}
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your message…"
        />
      </div>
      <div className={styles.actions}>
        <Button
          type="button"
          className={styles.primaryBtn}
          disabled={sending || !body.trim()}
          onClick={() => void handleSend()}
        >
          {sending ? 'Sending…' : 'Send message'}
        </Button>
      </div>
    </SurfaceCard>
  );
}
