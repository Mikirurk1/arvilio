import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Badge, SurfaceCard } from '../ui';
import { getProficiencyLevelById, getUserAccountStatusById, USER_ACCOUNT_STATUS, type MockStudent } from '../../mocks';
import styles from './StudentSummaryCard.module.scss';

export function StudentSummaryCard({
  student,
  profileId,
}: {
  student: MockStudent;
  /** Backend user id (UUID) when listing from API. */
  profileId?: string;
}) {
  const initials = student.fullName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2);

  return (
    <SurfaceCard className={styles.card}>
      <div className={styles.header}>
        <div className={styles.avatar}>{initials}</div>
        <div className={styles.headerMeta}>
          <div className={styles.name}>{student.fullName}</div>
          <div className={styles.teacher}>Teacher: {student.teacherName}</div>
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
          {getUserAccountStatusById(student.statusId)?.name ?? '—'}
        </Badge>
      </div>

      <div className={styles.metaBlock}>
        <div className={styles.metaRow}>
          <span className={styles.metaLabel}>Email</span>
          <span className={styles.metaValue}>{student.email}</span>
        </div>
      </div>

      <div className={styles.footer}>
        <Link href={`/students/${profileId ?? student.id}`} className={styles.openBtn}>
          Open profile <ArrowRight size={14} />
        </Link>
      </div>
    </SurfaceCard>
  );
}
