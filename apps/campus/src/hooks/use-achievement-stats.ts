'use client';

import { useEffect, useState } from 'react';
import {
  EMPTY_ACHIEVEMENT_STATS,
  type AchievementStatsDto,
} from '@pkg/types';
import { ACHIEVEMENT_STATS } from '../graphql/operations';
import { graphqlRequest } from '../lib/graphql-client';

type UseAchievementStatsOptions = {
  studentId?: string;
  enabled?: boolean;
};

export function useAchievementStats(options?: UseAchievementStatsOptions) {
  const studentId = options?.studentId;
  const enabled = options?.enabled ?? true;
  const [stats, setStats] = useState<AchievementStatsDto>(EMPTY_ACHIEVEMENT_STATS);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!enabled) {
      setStats(EMPTY_ACHIEVEMENT_STATS);
      setLoading(false);
      setError(null);
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);
    setError(null);

    void graphqlRequest<{ achievementStats: AchievementStatsDto }, { studentId?: string }>(
      ACHIEVEMENT_STATS,
      studentId ? { studentId } : undefined,
    )
      .then((data) => {
        if (cancelled) return;
        setStats(data.achievementStats);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setStats(EMPTY_ACHIEVEMENT_STATS);
        setError(err instanceof Error ? err.message : 'Failed to load achievements');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, studentId]);

  return { stats, loading, error };
}

