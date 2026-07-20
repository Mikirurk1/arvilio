'use client';

import { Repeat, Trash2, Unlink2, X } from 'lucide-react';
import { Button } from '../../components/ui';
import styles from './LessonModal.module.scss';
import type { LessonModalMode } from './types';
import type { LessonModalText } from './tabTypes';
import { USER_ROLE, type UserRoleId } from '@pkg/types';

type Props = {
  mode: LessonModalMode;
  role: UserRoleId;
  text: LessonModalText;
  canUnlinkSeries: boolean;
  onUnlinkSeries: () => void;
  canDeleteSeries: boolean;
  onDeleteSeries: () => void;
  canDeleteLesson: boolean;
  onDeleteLesson: () => void;
  onClose: () => void;
};

export function LessonModalHeader({
  mode,
  role,
  text,
  canUnlinkSeries,
  onUnlinkSeries,
  canDeleteSeries,
  onDeleteSeries,
  canDeleteLesson,
  onDeleteLesson,
  onClose,
}: Props) {
  const isStudent = role === USER_ROLE.student.id;
  const canShowUnlink = canUnlinkSeries;
  return (
    <div className={styles.modalHeader}>
      <div className={styles.modalHeaderText}>
        <span className={`${styles.modalBadge} ${isStudent ? styles.modalBadgeInfo : styles.modalBadgePrimary}`}>
          {isStudent ? 'Lesson details' : mode === 'create' ? 'Create lesson' : 'Edit lesson'}
        </span>
        <div id="lesson-modal-title" className={styles.modalTitle}>
          {isStudent ? 'Lesson' : mode === 'create' ? text.titleCreate : text.titleEdit}
        </div>
        <div className={styles.modalSubtitle}>
          {isStudent ? 'View lesson details, homework and your response.' : text.subtitle}
        </div>
      </div>
      <div className={styles.modalHeaderActions}>
        {canShowUnlink ? (
          <Button
            type="button"
            aria-label={text.aria.unlinkSeries}
            title={text.aria.unlinkSeries}
            className={styles.modalIconBtn}
            onClick={onUnlinkSeries}
          >
            <Unlink2 size={16} />
          </Button>
        ) : null}
        {canDeleteSeries ? (
          <Button
            type="button"
            aria-label={text.aria.deleteSeries}
            title={text.aria.deleteSeries}
            className={`${styles.modalIconBtn} ${styles.modalIconBtnDanger}`}
            onClick={onDeleteSeries}
          >
            <Repeat size={16} />
          </Button>
        ) : null}
        {canDeleteLesson ? (
          <Button
            type="button"
            aria-label={text.aria.deleteLesson}
            title={text.aria.deleteLesson}
            className={`${styles.modalIconBtn} ${styles.modalIconBtnDanger}`}
            onClick={onDeleteLesson}
          >
            <Trash2 size={16} />
          </Button>
        ) : null}
        <Button type="button" aria-label={text.aria.closeModal} className={styles.modalCloseBtn} onClick={onClose}>
          <X size={16} />
        </Button>
      </div>
    </div>
  );
}
