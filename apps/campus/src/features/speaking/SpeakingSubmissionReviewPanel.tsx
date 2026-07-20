'use client';

import { useState, type FormEvent } from 'react';
import type { SpeakingSubmissionDto } from '@pkg/types';
import { Button, Field } from '../../components/ui';
import { speakingSubmissionAudioHref } from '../../lib/speaking-upload';
import { useSpeakingStore } from '../../stores/speaking-store';
import styles from './SpeakingSubmissionReviewPanel.module.scss';

type Props = {
  submission: SpeakingSubmissionDto;
};

export function SpeakingSubmissionReviewPanel({ submission }: Props) {
  const reviewSubmission = useSpeakingStore((s) => s.reviewSubmission);
  const [feedback, setFeedback] = useState(submission.teacherFeedback ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving || !feedback.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await reviewSubmission({
        submissionId: submission.id,
        teacherFeedback: feedback.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save feedback');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <div className={styles.headMain}>
          <h4 className={styles.title}>{submission.topicTitle}</h4>
          <p className={styles.meta}>
            {new Date(submission.submittedAt).toLocaleString()} ·{' '}
            {submission.durationSec ? `${submission.durationSec}s` : '—'}
          </p>
        </div>
        <span
          className={[
            styles.badge,
            submission.status === 'reviewed' ? styles.badgeReviewed : styles.badgePending,
          ].join(' ')}
        >
          {submission.status === 'reviewed' ? 'Reviewed' : 'Pending'}
        </span>
      </div>

      <p className={styles.prompt}>{submission.topicPrompt}</p>

      {submission.hasAudio ? (
        <audio className={styles.player} controls src={speakingSubmissionAudioHref(submission.id)}>
          <track kind="captions" />
        </audio>
      ) : (
        <p className={styles.missing}>No audio uploaded yet.</p>
      )}

      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <Field
          label="Teacher comment"
          as="textarea"
          rows={3}
          value={feedback}
          onChange={(event) => setFeedback(event.target.value)}
          placeholder="Share pronunciation notes, grammar tips, or encouragement…"
          disabled={saving}
        />
        {error ? <p className={styles.error}>{error}</p> : null}
        <Button type="submit" disabled={saving || !feedback.trim()}>
          {saving ? 'Saving…' : submission.status === 'reviewed' ? 'Update feedback' : 'Save feedback'}
        </Button>
      </form>
    </div>
  );
}
