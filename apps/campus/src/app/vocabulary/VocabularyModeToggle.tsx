'use client';

import { Play } from 'lucide-react';
import { SegmentedControl } from '../../components/ui';
import { useCampusT } from '../../lib/cms';
import styles from './page.module.scss';

export function VocabularyModeToggle({
  mode,
  onChange,
}: {
  mode: 'list' | 'flashcard' | 'play';
  onChange: (mode: 'list' | 'flashcard' | 'play') => void;
}) {
  const t = useCampusT();
  return (
    <SegmentedControl
      value={mode}
      onValueChange={onChange}
      ariaLabel={t('vocabulary.mode.aria')}
      className={styles.modeToggle}
      optionClassName={styles.modeBtn}
      activeOptionClassName={styles.modeActive}
      dataAttrs={{ 'data-tour-anchor': 'vocab-mode-toggle' }}
      options={[
        {
          value: 'list',
          label: t('vocabulary.mode.list'),
          icon: (
            <svg width='16' height='16' viewBox='0 0 16 16' fill='none'>
              <path
                d='M2 4h12M2 8h12M2 12h8'
                stroke='currentColor'
                strokeWidth='1.5'
                strokeLinecap='round'
              />
            </svg>
          ),
        },
        {
          value: 'flashcard',
          label: t('vocabulary.mode.flashcards'),
          icon: (
            <svg width='16' height='16' viewBox='0 0 16 16' fill='none'>
              <rect
                x='2'
                y='4'
                width='12'
                height='9'
                rx='1.5'
                stroke='currentColor'
                strokeWidth='1.5'
              />
              <path
                d='M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1'
                stroke='currentColor'
                strokeWidth='1.5'
              />
            </svg>
          ),
        },
        {
          value: 'play',
          label: t('vocabulary.mode.play'),
          icon: <Play size={16} />,
        },
      ]}
    />
  );
}
