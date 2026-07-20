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
import styles from './StudentSpeakingTab.module.scss';

type Props = {
  studentId: string;
  embedded?: boolean;
};

export function StudentSpeakingTab({ studentId, embedded = false }: Props) {
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
      title: 'Delete speaking topic?',
      message: 'This topic will be removed for this student.',
      confirmLabel: 'Delete',
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
        <h3 className={styles.sectionTitle}>Assigned topics</h3>
        {studentTopics.status === 'loading' && topics.length === 0 ? (
          <SurfaceCard className={styles.loading}>Loading topics…</SurfaceCard>
        ) : null}
        {studentTopics.status === 'success' && topics.length === 0 ? (
          <EmptyStateCard
            title="No speaking topics"
            description="Create a discussion topic with optional vocabulary words for this student."
          />
        ) : null}
        <div className={styles.topicList}>
          {topics.map((topic) => (
            <SpeakingTopicCard
              key={topic.id}
              topic={topic}
              canDelete={isStaff}
              onDelete={() => void handleDelete(topic.id)}
              studentIdForWords={studentId}
            />
          ))}
        </div>
      </section>

      {isStaff ? (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Recordings to review</h3>
          {studentSubmissions.status === 'loading' && submissions.length === 0 ? (
            <SurfaceCard className={styles.loading}>Loading submissions…</SurfaceCard>
          ) : null}
          {studentSubmissions.status === 'success' && submissions.length === 0 ? (
            <EmptyStateCard
              title="No submissions yet"
              description="When the student records a response, it will appear here for review."
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
