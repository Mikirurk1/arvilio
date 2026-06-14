'use client';

import { useEffect, useRef, useState } from 'react';
import type { StatisticsDashboardDto, StatisticsDashboardFocus, StatisticsStudentScope, StatsRange } from '@pkg/types';
import { STATISTICS_DASHBOARD } from '../graphql/operations';
import { graphqlRequest } from '../lib/graphql-client';

type UseStatisticsDashboardOptions = {
  range: StatsRange;
  studentId?: string;
  staffUserId?: string;
  /** Staff profile: `all` school vs `my_students` (admin/super-admin). Teachers always use my students. */
  studentScope?: StatisticsStudentScope;
  /** Staff: `operations` (lessons, roster, billing) or `learning` (quiz, vocabulary, speaking aggregates). */
  statisticsFocus?: StatisticsDashboardFocus;
  /** Required when `range === 'custom'` (YYYY-MM-DD, UTC calendar days). */
  rangeFrom?: string;
  rangeTo?: string;
  enabled?: boolean;
};

export function useStatisticsDashboard(options: UseStatisticsDashboardOptions) {
  const { range, studentId, staffUserId, studentScope, statisticsFocus, rangeFrom, rangeTo, enabled = true } =
    options;
  const [dashboard, setDashboard] = useState<StatisticsDashboardDto | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dashboardRef = useRef<StatisticsDashboardDto | null>(null);
  dashboardRef.current = dashboard;

  useEffect(() => {
    let cancelled = false;

    if (!enabled) {
      setDashboard(null);
      setLoading(false);
      setRefreshing(false);
      setError(null);
      return () => {
        cancelled = true;
      };
    }

    const hasCachedDashboard = dashboardRef.current !== null;
    if (hasCachedDashboard) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    const variables: {
      range: string;
      studentId?: string;
      staffUserId?: string;
      studentScope?: string;
      statisticsFocus?: string;
      rangeFrom?: string;
      rangeTo?: string;
    } = { range };
    if (studentId) variables.studentId = studentId;
    if (staffUserId && !studentId) variables.staffUserId = staffUserId;
    if (studentScope && !studentId && !staffUserId) variables.studentScope = studentScope;
    if (statisticsFocus && !studentId) variables.statisticsFocus = statisticsFocus;
    if (range === 'custom' && rangeFrom && rangeTo) {
      variables.rangeFrom = rangeFrom;
      variables.rangeTo = rangeTo;
    }

    void graphqlRequest<{ statisticsDashboard: StatisticsDashboardDto }, typeof variables>(
      STATISTICS_DASHBOARD,
      variables,
    )
      .then((data) => {
        if (cancelled) return;
        setDashboard(data.statisticsDashboard);
        setLoading(false);
        setRefreshing(false);
      })
      .catch((err) => {
        if (cancelled) return;
        if (!dashboardRef.current) {
          setDashboard(null);
        }
        setError(err instanceof Error ? err.message : 'Failed to load statistics');
        setLoading(false);
        setRefreshing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, range, studentId, staffUserId, studentScope, statisticsFocus, rangeFrom, rangeTo]);

  return { dashboard, loading, refreshing, error };
}
