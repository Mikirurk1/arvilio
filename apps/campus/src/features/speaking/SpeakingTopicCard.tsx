'use client';

import { useEffect, useMemo, useState } from 'react';
import type { SpeakingTopicCardDto } from '@pkg/types';
import { MessageSquare, Mic, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui';
import { useViewerLanguageIds } from '../../hooks/use-viewer-language-ids';
import { useCampusT } from '../../lib/cms';
import { pickWordDefinition } from '../../lib/word-definitions';
import { useVocabularyStore } from '../../stores/vocabulary-store';
import { speakingSubmissionAudioHref } from '../../lib/speaking-upload';
import { WordDetailsModal } from '../vocabulary/WordDetailsModal';
import { AudioPlayer } from './AudioPlayer';
import { SpeakingRecordSession } from './SpeakingRecordSession';
import { SpeakingWordChip } from './SpeakingWordChip';
import styles from './SpeakingTopicCard.module.scss';

type Props = {
  topic: SpeakingTopicCardDto;
  /** When true, shows a Record button that expands inline recording session. */
  allowRecord?: boolean;
  onDelete?: (topic: SpeakingTopicCardDto) => void;
  canDelete?: boolean;
};

type TopicStatus = 'reviewed' | 'submitted' | 'pending';

function topicStatus(topic: SpeakingTopicCardDto): TopicStatus {
  const submission = topic.latestSubmission;
  if (submission?.status === 'reviewed') return 'reviewed';
  if (submission?.status === 'submitted') return 'submitted';
  if (topic.assignment?.status === 'reviewed') return 'reviewed';
  if (topic.assignment?.status === 'submitted') return 'submitted';
  return 'pending';
}

export function SpeakingTopicCard({
  topic,
  allowRecord = false,
  onDelete,
  canDelete = false,
}: Props) {
  const t = useCampusT();
  const fetchWordsByIds = useVocabularyStore((s) => s.fetchWordsByIds);
  const { nativeLanguageId, englishLanguageId } = useViewerLanguageIds();
  const [wordsLoaded, setWordsLoaded] = useState(false);
  const [words, setWords] = useState<
    Array<{ id: string; word: string; pos?: string | null; gloss?: string | null; audioUrl?: string | null }>
  >([]);
  const [isRecording, setIsRecording] = useState(false);
  const [detailsWordId, setDetailsWordId] = useState<string | null>(null);

  useEffect(() => {
    if (topic.wordIds.length === 0) {
      setWords([]);
      setWordsLoaded(true);
      return;
    }
    void fetchWordsByIds(topic.wordIds).then((rows) => {
      setWords(
        rows.map((row) => ({
          id: row.id,
          word: row.text,
          pos: row.partOfSpeech,
          gloss: pickWordDefinition(
            row.definitions,
            nativeLanguageId,
            englishLanguageId,
            row.definition,
          ),
          audioUrl: row.audioUrl,
        })),
      );
      setWordsLoaded(true);
    });
  }, [englishLanguageId, fetchWordsByIds, nativeLanguageId, topic.wordIds]);

  const status = topicStatus(topic);
  const badgeClass = useMemo(() => {
    if (status === 'reviewed') return styles.badgeReviewed;
    if (status === 'submitted') return styles.badgeSubmitted;
    return styles.badgePending;
  }, [status]);

  const statusText =
    status === 'reviewed'
      ? t('speaking.status.reviewed')
      : status === 'submitted'
        ? t('speaking.status.submitted')
        : t('speaking.status.pending');

  const canRecord = allowRecord && Boolean(topic.assignment);
  const feedback = topic.latestSubmission?.teacherFeedback;

  return (
    <div className={`${styles.card} ${isRecording ? styles.cardRecording : ''}`}>
      <div className={styles.head}>
        <div className={styles.headMain}>
          <h3 className={styles.title}>{topic.title}</h3>
          <span className={[styles.badge, badgeClass].join(' ')}>{statusText}</span>
        </div>
        <div className={styles.headActions}>
          {canRecord ? (
            <Button
              type="button"
              variant={isRecording ? 'ghost' : 'default'}
              className={styles.recordBtn}
              onClick={() => setIsRecording((prev) => !prev)}
            >
              <Mic size={14} aria-hidden />
              {isRecording
                ? t('speaking.cancel')
                : topic.latestSubmission?.hasAudio
                  ? t('speaking.reRecord')
                  : t('speaking.record')}
            </Button>
          ) : null}
          {canDelete && onDelete ? (
            <Button
              type="button"
              variant="ghost"
              className={styles.deleteBtn}
              onClick={() => onDelete(topic)}
              aria-label={t('speaking.delete.aria')}
            >
              <Trash2 size={14} aria-hidden />
            </Button>
          ) : null}
        </div>
      </div>

      {!isRecording ? (
        <>
          <p className={styles.prompt}>{topic.prompt}</p>

          {topic.assignment?.personalNote ? (
            <p className={styles.note}>
              <MessageSquare size={12} aria-hidden />
              {topic.assignment.personalNote}
            </p>
          ) : null}

          {topic.wordIds.length > 0 && wordsLoaded ? (
            <div className={styles.words}>
              {words.map((word) => (
                <SpeakingWordChip
                  key={word.id}
                  word={word.word}
                  pos={word.pos}
                  gloss={word.gloss}
                  audioUrl={word.audioUrl}
                  onInfo={() => setDetailsWordId(word.id)}
                />
              ))}
            </div>
          ) : null}

          {topic.latestSubmission?.hasAudio ? (
            <div className={styles.submissionAudio}>
              <span className={styles.submissionAudioLabel}>{t('speaking.yourRecording')}</span>
              <AudioPlayer src={speakingSubmissionAudioHref(topic.latestSubmission.id)} />
            </div>
          ) : null}

          {feedback ? (
            <div className={styles.feedback}>
              <strong>{t('speaking.teacherFeedback')}</strong>
              <p>{feedback}</p>
            </div>
          ) : null}
        </>
      ) : (
        <div className={styles.recordingPanel}>
          <SpeakingRecordSession
            topic={topic}
            embedded
            onDone={() => setIsRecording(false)}
            onCancel={() => setIsRecording(false)}
          />
        </div>
      )}

      {detailsWordId ? (
        <WordDetailsModal wordId={detailsWordId} onClose={() => setDetailsWordId(null)} />
      ) : null}
    </div>
  );
}
