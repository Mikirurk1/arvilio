'use client';

import { useEffect } from 'react';
import { confirmDialog } from '../../../features/confirm';
import { CreateSpeakingTopicCard } from '../../../features/speaking/CreateSpeakingTopicCard';
import { SpeakingSubmissionReviewPanel } from '../../../features/speaking/SpeakingSubmissionReviewPanel';
import { SpeakingTopicCard } from '../../../features/speaking/SpeakingTopicCard';
import { canEdit } from '../../../lib/roles';
import { useActiveUser } from '../../../lib/active-user';
import { useSpeakingStore } from '../../../stores/speaking-store';
import { EmptyStateCard, SurfaceCard } from '../../../components/ui';
import { useCampusT } from '../../../lib/cms';
import styles from './StudentSpeakingTab.module.scss';

type Props = {
  studentId: string;
  embedded?: boolean;
};

export function StudentSpeakingTab({ studentId, embedded = false }: Props) {
  const t = useCampusT();
  const activeUser = useActiveUser();
  const isStaff = canEdit('quiz', activeUser.role);

  const studentTopics = useSpeakingStore((s) => s.studentTopics);
  const studentSubmissions = useSpeakingStore((s) => s.studentSubmissions);
  const fetchStudentTopics = useSpeakingStore((s) => s.fetchStudentTopics);
  const fetchStudentSubmissions = useSpeakingStore((s) => s.fetchStudentSubmissions);
  const deleteTopic = useSpeakingStore((s) => s.deleteTopic);

  useEffect(() => {
    void fetchStudentTopics(studentId);
    if (isStaff) {
      void fetchStudentSubmissions(studentId);
    }
  }, [fetchStudentSubmissions, fetchStudentTopics, isStaff, studentId]);

  const topics = studentTopics.data ?? [];
  const submissions = (studentSubmissions.data ?? []).slice().sort((a, b) => {
    if (a.status !== b.status) return a.status === 'submitted' ? -1 : 1;
    return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
  });

  const handleDelete = async (topicId: string) => {
    const ok = await confirmDialog({
      title: t('students.detail.speaking.deleteTitle'),
      message: t('students.detail.speaking.deleteMessage'),
      confirmLabel: t('calendar.series.delete'),
      variant: 'danger',
    });
    if (!ok) return;
    await deleteTopic(topicId, studentId);
    void fetchStudentTopics(studentId, true);
  };

  const content = (
    <div className={styles.stack}>
      {isStaff ? (
        <CreateSpeakingTopicCard
          studentId={studentId}
          onCreated={() => {
            void fetchStudentTopics(studentId, true);
            void fetchStudentSubmissions(studentId, true);
          }}
        />
      ) : null}

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('students.detail.speaking.assignedTopics')}</h3>
        {studentTopics.status === 'loading' && topics.length === 0 ? (
          <SurfaceCard className={styles.loading}>{t('students.detail.speaking.loadingTopics')}</SurfaceCard>
        ) : null}
        {studentTopics.status === 'success' && topics.length === 0 ? (
          <EmptyStateCard
            title={t('students.detail.speaking.emptyTopics')}
            description={t('students.detail.speaking.emptyTopicsDesc')}
          />
        ) : null}
        <div className={styles.topicList}>
          {topics.map((topic) => (
            <SpeakingTopicCard
              key={topic.id}
              topic={topic}
              canDelete={isStaff}
              onDelete={() => void handleDelete(topic.id)}
            />
          ))}
        </div>
      </section>

      {isStaff ? (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>{t('students.detail.speaking.recordingsTitle')}</h3>
          {studentSubmissions.status === 'loading' && submissions.length === 0 ? (
            <SurfaceCard className={styles.loading}>{t('students.detail.speaking.loadingSubmissions')}</SurfaceCard>
          ) : null}
          {studentSubmissions.status === 'success' && submissions.length === 0 ? (
            <EmptyStateCard
              title={t('students.detail.speaking.emptySubmissions')}
              description={t('students.detail.speaking.emptySubmissionsDesc')}
            />
          ) : null}
          <div className={styles.reviewList}>
            {submissions.map((submission) => (
              <SpeakingSubmissionReviewPanel key={submission.id} submission={submission} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );

  if (embedded) {
    return content;
  }

  return <SurfaceCard className={styles.card}>{content}</SurfaceCard>;
}
