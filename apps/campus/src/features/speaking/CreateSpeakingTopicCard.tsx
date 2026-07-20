'use client';

import { useState, type FormEvent } from 'react';
import type { CreateSpeakingTopicRequestDto, SpeakingTopicCardDto } from '@pkg/types';
import { Mic, Plus } from 'lucide-react';
import { Button, Field, SurfaceCard } from '../../components/ui';
import { useAuth } from '../../lib/auth-context';
import { useCampusT } from '../../lib/cms';
import { useSpeakingStore } from '../../stores/speaking-store';
import { SpeakingTopicWordPicker } from './SpeakingTopicWordPicker';
import styles from './CreateSpeakingTopicCard.module.scss';

type Props = {
  studentId?: string;
  className?: string;
  onCreated?: (topic: SpeakingTopicCardDto) => void;
};

export function CreateSpeakingTopicCard({ studentId, className, onCreated }: Props) {
  const t = useCampusT();
  const { user } = useAuth();
  const creating = useSpeakingStore((s) => s.creating);
  const createError = useSpeakingStore((s) => s.createError);
  const createTopic = useSpeakingStore((s) => s.createTopic);

  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [personalNote, setPersonalNote] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [wordIds, setWordIds] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const targetStudentId = studentId ?? user?.id ?? '';
  const isStaffAssign = Boolean(studentId && studentId !== user?.id);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (creating) return;

    const body: CreateSpeakingTopicRequestDto = {
      title: title.trim(),
      prompt: prompt.trim(),
      wordIds,
      studentId: isStaffAssign ? studentId : undefined,
      personalNote: isStaffAssign && personalNote.trim() ? personalNote.trim() : undefined,
      dueDate: isStaffAssign && dueDate ? dueDate : undefined,
    };

    try {
      const created = await createTopic(body);
      setTitle('');
      setPrompt('');
      setPersonalNote('');
      setDueDate('');
      setWordIds([]);
      setOpen(false);
      onCreated?.(created);
    } catch {
      // store holds createError
    }
  };

  if (!open) {
    return (
      <Button
        variant="bare"
        type="button"
        className={[styles.createTrigger, className].filter(Boolean).join(' ')}
        onClick={() => setOpen(true)}
      >
        <span className={styles.createTriggerIcon} aria-hidden>
          <Plus size={14} />
        </span>
        {studentId ? t('speaking.createTopic') : t('speaking.newTopic')}
      </Button>
    );
  }

  return (
    <SurfaceCard className={[styles.card, className].filter(Boolean).join(' ')}>
      <div className={styles.head}>
        <Mic size={18} aria-hidden />
        <h3 className={styles.title}>
          {isStaffAssign ? t('speaking.createTitleStaff') : t('speaking.createTitle')}
        </h3>
      </div>

      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <Field
          label={t('speaking.form.title')}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={t('speaking.form.titlePlaceholder')}
          disabled={creating}
        />
        <Field
          label={t('speaking.form.prompt')}
          as="textarea"
          rows={4}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder={t('speaking.form.promptPlaceholder')}
          disabled={creating}
        />

        {targetStudentId ? (
          <SpeakingTopicWordPicker
            studentId={targetStudentId}
            selectedWordIds={wordIds}
            onChange={setWordIds}
            disabled={creating}
          />
        ) : null}

        {isStaffAssign ? (
          <>
            <Field
              label={t('speaking.form.personalNote')}
              as="textarea"
              rows={2}
              value={personalNote}
              onChange={(event) => setPersonalNote(event.target.value)}
              disabled={creating}
            />
            <Field
              label={t('speaking.form.dueDate')}
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              disabled={creating}
            />
          </>
        ) : null}

        {createError ? <p className={styles.error}>{createError}</p> : null}

        <div className={styles.actions}>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={creating}>
            {t('speaking.form.cancel')}
          </Button>
          <Button type="submit" disabled={creating || !title.trim() || !prompt.trim()}>
            {creating ? t('speaking.form.creating') : t('speaking.form.create')}
          </Button>
        </div>
      </form>
    </SurfaceCard>
  );
}
