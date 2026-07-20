'use client';

import { useState, type FormEvent } from 'react';
import type { SpeakingSubmissionDto } from '@pkg/types';
import { Button, Field } from '../../components/ui';
import { useCampusT } from '../../lib/cms';
import { speakingSubmissionAudioHref } from '../../lib/speaking-upload';
import { useSpeakingStore } from '../../stores/speaking-store';
import styles from './SpeakingSubmissionReviewPanel.module.scss';

type Props = {
  submission: SpeakingSubmissionDto;
};

export function SpeakingSubmissionReviewPanel({ submission }: Props) {
  const t = useCampusT();
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
      setError(err instanceof Error ? err.message : t('speaking.review.saveFailed'));
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
          {submission.status === 'reviewed'
            ? t('speaking.status.reviewed')
            : t('speaking.status.pending')}
        </span>
      </div>

      <p className={styles.prompt}>{submission.topicPrompt}</p>

      {submission.hasAudio ? (
        <audio className={styles.player} controls src={speakingSubmissionAudioHref(submission.id)}>
          <track kind="captions" />
        </audio>
      ) : (
        <p className={styles.missing}>{t('speaking.review.noAudio')}</p>
      )}

      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <Field
          label={t('speaking.review.teacherComment')}
          as="textarea"
          rows={3}
          value={feedback}
          onChange={(event) => setFeedback(event.target.value)}
          placeholder={t('speaking.review.commentPlaceholder')}
          disabled={saving}
        />
        {error ? <p className={styles.error}>{error}</p> : null}
        <Button type="submit" disabled={saving || !feedback.trim()}>
          {saving
            ? t('speaking.review.saving')
            : submission.status === 'reviewed'
              ? t('speaking.review.update')
              : t('speaking.review.save')}
        </Button>
      </form>
    </div>
  );
}
