'use client';

import { useState } from 'react';
import type { StatsRange } from '@pkg/types';
import { SurfaceCard } from '../../../components/ui';
import { StatisticsDashboard } from '../../../components/statistics';
import { useStatisticsDashboard } from '../../../hooks/use-statistics-dashboard';
import styles from './page.module.scss';

export function StudentStatisticsTab({ studentId }: { studentId: string }) {
  const [range, setRange] = useState<StatsRange>('week');
  const { dashboard, loading, error } = useStatisticsDashboard({ range, studentId });

  return (
    <SurfaceCard className={styles.tabCard}>
      <StatisticsDashboard
        variant="profile"
        profileIntro="Lessons, vocabulary, practice, quizzes, speaking, and daily goals for the selected period."
        dashboard={dashboard}
        loading={loading}
        error={error}
        range={range}
        onRangeChange={setRange}
      />
    </SurfaceCard>
  );
}
