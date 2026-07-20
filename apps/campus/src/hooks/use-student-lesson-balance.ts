'use client';

import { useCallback, useEffect, useState } from 'react';
import type { StudentLessonBalanceDto } from '@pkg/types';
import { useBillingStore } from '../stores/billing-store';

export function useStudentLessonBalance(studentBackendId: string | null | undefined) {
  const fetchStudentBalance = useBillingStore((s) => s.fetchStudentBalance);
  const [balance, setBalance] = useState<StudentLessonBalanceDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!studentBackendId) {
      setBalance(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStudentBalance(studentBackendId);
      setBalance(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load balance');
      setBalance(null);
    } finally {
      setLoading(false);
    }
  }, [fetchStudentBalance, studentBackendId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { balance, loading, error, refresh };
}
