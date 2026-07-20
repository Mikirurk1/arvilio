'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Badge, PanelCard, UserAvatar } from '../ui';
import {
  getProficiencyLevelById,
  getUserAccountStatusById,
  USER_ACCOUNT_STATUS,
  type UserAccountStatusId,
} from '@pkg/types';
import type { MockStudent } from '../../lib/user-models';
import { useCampusT } from '../../lib/cms';
import styles from './StudentSummaryCard.module.scss';

function accountStatusLabel(
  statusId: UserAccountStatusId,
  t: (key: string) => string,
): string {
  const entry = getUserAccountStatusById(statusId);
  if (!entry) return '—';
  const key = `students.status.${entry.name}`;
  const label = t(key);
  return label === key ? entry.name : label;
}

export function StudentSummaryCard({
  student,
  profileId,
  avatarUrl,
  color,
}: {
  student: MockStudent;
  /** Backend user id (UUID) when listing from API. */
  profileId?: string;
  avatarUrl?: string | null;
  /** User display color hex (from backend). */
  color?: string | null;
}) {
  const t = useCampusT();
  const router = useRouter();
  const profileHref = `/students/${profileId ?? student.id}`;

  return (
    <PanelCard interactive fillHeight data-tour-anchor="student-card">
      <div className={styles.header}>
        <UserAvatar
          size="md"
          src={avatarUrl}
          name={student.fullName}
          email={student.email}
          color={color}
        />
        <div className={styles.headerMeta}>
          <div className={styles.name}>{student.fullName}</div>
          <div className={styles.teacher}>
            {t('students.card.teacher', { name: student.teacherName })}
          </div>
        </div>
      </div>

      <div className={styles.badges}>
        <Badge className={styles.badge} variant="neutral">
          {getProficiencyLevelById(student.proficiencyLevelId)?.code ?? '—'}
        </Badge>
        <Badge
          className={styles.badge}
          variant={student.statusId === USER_ACCOUNT_STATUS.active.id ? 'green' : 'amber'}
        >
          {accountStatusLabel(student.statusId, t)}
        </Badge>
      </div>

      <div className={styles.scanStats} aria-label={t('students.card.snapshotAria')}>
        <div className={styles.scanStat}>
          <span className={styles.scanStatValue}>{student.lessonsCompleted}</span>
          <span className={styles.scanStatLabel}>{t('students.card.lessons')}</span>
        </div>
        <div className={styles.scanStat}>
          <span className={styles.scanStatValue}>{student.wordsLearned}</span>
          <span className={styles.scanStatLabel}>{t('students.card.words')}</span>
        </div>
        <div className={styles.scanStat}>
          <span className={styles.scanStatValue}>
            {student.streakDays > 0 ? student.streakDays : '—'}
          </span>
          <span className={styles.scanStatLabel}>{t('students.card.streak')}</span>
        </div>
      </div>

      <div className={styles.metaBlock}>
        <div className={styles.metaRow}>
          <span className={styles.metaLabel}>{t('students.card.email')}</span>
          <span className={styles.metaValue}>{student.email}</span>
        </div>
      </div>

      <div className={styles.footer}>
        <Link
          href={profileHref}
          prefetch
          className={styles.openBtn}
          onMouseEnter={() => router.prefetch(profileHref)}
          onFocus={() => router.prefetch(profileHref)}
        >
          {t('students.card.openProfile')} <ArrowRight size={14} />
        </Link>
      </div>
    </PanelCard>
  );
}
