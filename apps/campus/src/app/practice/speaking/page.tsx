'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { ArrowLeft, Mic } from 'lucide-react';
import { EmptyStateCard, PageHeader, SurfaceCard } from '../../../components/ui';
import { CreateSpeakingTopicCard } from '../../../features/speaking/CreateSpeakingTopicCard';
import { SpeakingSubmissionReviewPanel } from '../../../features/speaking/SpeakingSubmissionReviewPanel';
import { SpeakingTopicCard } from '../../../features/speaking/SpeakingTopicCard';
import { confirmDialog } from '../../../features/confirm';
import { useAuth } from '../../../lib/auth-context';
import { mapAuthRoleToRoleId } from '../../../lib/active-user';
import { useCampusT } from '../../../lib/cms';
import { canEdit } from '../../../lib/roles';
import { useSpeakingStore } from '../../../stores/speaking-store';
import type { SpeakingTopicCardDto } from '@pkg/types';
import styles from './page.module.scss';

export default function SpeakingPracticePage() {
  const t = useCampusT();
  const { user } = useAuth();
  const isStaff = canEdit('quiz', mapAuthRoleToRoleId(user?.role));

  const myTopics = useSpeakingStore((s) => s.myTopics);
  const fetchMyTopics = useSpeakingStore((s) => s.fetchMyTopics);
  const deleteTopic = useSpeakingStore((s) => s.deleteTopic);

  const studentSubmissions = useSpeakingStore((s) => s.studentSubmissions);
  const fetchStudentSubmissions = useSpeakingStore((s) => s.fetchStudentSubmissions);

  useEffect(() => {
    void fetchMyTopics();
    if (isStaff && user?.id) {
      void fetchStudentSubmissions(user.id);
    }
  }, [fetchMyTopics, fetchStudentSubmissions, isStaff, user?.id]);

  const topics = myTopics.data ?? [];
  const submissions = isStaff
    ? (studentSubmissions.data ?? [])
        .slice()
        .sort((a, b) => {
          if (a.status !== b.status) return a.status === 'submitted' ? -1 : 1;
          return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
        })
    : [];

  const handleDelete = async (topic: SpeakingTopicCardDto) => {
    const ok = await confirmDialog({
      title: t('speaking.delete.title'),
      message: t('speaking.delete.message'),
      confirmLabel: t('speaking.delete.confirm'),
      variant: 'danger',
    });
    if (!ok) return;
    await deleteTopic(topic.id);
  };

  return (
    <div className={`${styles.page} container container--page`}>
      <div className={styles.stack}>
        <PageHeader
          className={styles.pageHeader}
          titleClassName={styles.pageTitle}
          subtitleClassName={styles.pageSub}
          back={
            <Link href="/practice" className={styles.backLink} aria-label={t('speaking.backAria')}>
              <ArrowLeft size={18} aria-hidden />
            </Link>
          }
          title={t('speaking.title')}
          subtitle={t('speaking.subtitle')}
        />

        <CreateSpeakingTopicCard onCreated={() => void fetchMyTopics(true)} />

        <section
          className={styles.section}
          aria-labelledby="speaking-topics-heading"
          data-tour-anchor="speaking-record"
        >
          <h3 id="speaking-topics-heading" className={styles.sectionTitle}>
            {t('speaking.assignedTopics')}
          </h3>

          {myTopics.status === 'loading' && topics.length === 0 ? (
            <SurfaceCard className={styles.loadingCard}>{t('speaking.loadingTopics')}</SurfaceCard>
          ) : null}

          {myTopics.status === 'success' && topics.length === 0 ? (
            <EmptyStateCard
              icon={<Mic size={24} aria-hidden />}
              title={t('speaking.empty.title')}
              description={isStaff ? t('speaking.empty.staff') : t('speaking.empty.student')}
            />
          ) : null}

          <div className={styles.topicList}>
            {topics.map((topic) => (
              <SpeakingTopicCard
                key={topic.id}
                topic={topic}
                allowRecord={Boolean(topic.assignment)}
                canDelete={topic.ownerId === user?.id}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </section>

        {isStaff ? (
          <section className={styles.section} aria-labelledby="speaking-submissions-heading">
            <h3 id="speaking-submissions-heading" className={styles.sectionTitle}>
              {t('speaking.reviewSection')}
            </h3>

            {studentSubmissions.status === 'loading' && submissions.length === 0 ? (
              <SurfaceCard className={styles.loadingCard}>
                {t('speaking.loadingSubmissions')}
              </SurfaceCard>
            ) : null}

            {studentSubmissions.status === 'success' && submissions.length === 0 ? (
              <EmptyStateCard
                title={t('speaking.empty.submissionsTitle')}
                description={t('speaking.empty.submissionsDesc')}
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
    </div>
  );
}
