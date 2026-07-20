'use client';

import { useEffect, useRef, useState } from 'react';
import type { StaffEarningsSectionDto, StatsRange } from '@pkg/types';
import { useFinanceStore } from '../stores/finance-store';

type UseStaffMemberEarningsOptions = {
  userId: string;
  range: StatsRange;
  rangeFrom?: string;
  rangeTo?: string;
  enabled?: boolean;
};

export function useStaffMemberEarnings(options: UseStaffMemberEarningsOptions) {
  const { userId, range, rangeFrom, rangeTo, enabled = true } = options;
  const fetchStaffMemberEarnings = useFinanceStore((s) => s.fetchStaffMemberEarnings);
  const [earnings, setEarnings] = useState<StaffEarningsSectionDto | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const earningsRef = useRef<StaffEarningsSectionDto | null>(null);
  earningsRef.current = earnings;

  useEffect(() => {
    let cancelled = false;

    if (!enabled || !userId) {
      setEarnings(null);
      setLoading(false);
      setRefreshing(false);
      setError(null);
      return () => {
        cancelled = true;
      };
    }

    const hasCached = earningsRef.current !== null;
    if (hasCached) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    void fetchStaffMemberEarnings({
      userId,
      range,
      rangeFrom: range === 'custom' ? rangeFrom : undefined,
      rangeTo: range === 'custom' ? rangeTo : undefined,
    })
      .then((data) => {
        if (cancelled) return;
        setEarnings(data);
        setLoading(false);
        setRefreshing(false);
      })
      .catch((err) => {
        if (cancelled) return;
        if (!earningsRef.current) {
          setEarnings(null);
        }
        setError(err instanceof Error ? err.message : 'Failed to load earnings');
        setLoading(false);
        setRefreshing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, fetchStaffMemberEarnings, range, rangeFrom, rangeTo, reloadToken, userId]);

  const refetch = () => setReloadToken((token) => token + 1);

  return { earnings, loading, refreshing, error, refetch };
}
