'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { StudentSummaryBackendDto } from '@pkg/types';
import type { AdvancedSelectOption } from '../components/ui';
import { partyNumericId } from '../features/lesson-modal/scheduledLessonsBackendAdapter';
import { STUDENTS_PAGE } from '../graphql/operations';
import { graphqlRequest } from '../lib/graphql-client';
import { DEFAULT_PAGE_SIZE } from '../stores/lib/paginated-slice';

export type StudentSelectValueKind = 'partyId' | 'backendId';

type UseStudentSelectOptionsParams = {
  valueKind: StudentSelectValueKind;
  filter?: (student: StudentSummaryBackendDto) => boolean;
  query: string;
  selectedValue?: string;
  fallbackLabel?: string;
  pageSize?: number;
  enabled?: boolean;
  staticStudents?: StudentSummaryBackendDto[];
};

function toOptionValue(id: string, valueKind: StudentSelectValueKind): string {
  return valueKind === 'partyId' ? String(partyNumericId(id)) : id;
}

function studentMatchesQuery(student: StudentSummaryBackendDto, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return `${student.displayName} ${student.email}`.toLowerCase().includes(normalized);
}

function mapStudentToOption(
  student: StudentSummaryBackendDto,
  valueKind: StudentSelectValueKind,
): AdvancedSelectOption {
  return {
    value: toOptionValue(student.id, valueKind),
    label: student.displayName,
    searchText: student.email,
  };
}

export function useStudentSelectOptions({
  valueKind,
  filter,
  query,
  selectedValue,
  fallbackLabel,
  pageSize = DEFAULT_PAGE_SIZE,
  enabled = true,
  staticStudents,
}: UseStudentSelectOptionsParams) {
  const [items, setItems] = useState<StudentSummaryBackendDto[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [staticVisibleCount, setStaticVisibleCount] = useState(pageSize);
  const nextCursorRef = useRef<string | null>(null);
  const isStatic = staticStudents != null;

  useEffect(() => {
    if (!isStatic) return;
    setItems(staticStudents);
    setHasMore(false);
    setStaticVisibleCount(pageSize);
  }, [isStatic, pageSize, staticStudents]);

  const fetchPage = useCallback(
    async (reset: boolean) => {
      if (!enabled || isStatic) return;
      if (reset) {
        nextCursorRef.current = null;
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      try {
        const data = await graphqlRequest<{
          studentsPage: {
            items: StudentSummaryBackendDto[];
            hasMore: boolean;
            nextCursor: string | null;
          };
        }>(STUDENTS_PAGE, {
          cursor: reset ? null : nextCursorRef.current,
          limit: pageSize,
        });
        nextCursorRef.current = data.studentsPage.nextCursor;
        setHasMore(data.studentsPage.hasMore);
        setItems((prev) =>
          reset ? data.studentsPage.items : [...prev, ...data.studentsPage.items],
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [enabled, isStatic, pageSize],
  );

  useEffect(() => {
    if (!enabled || isStatic) return;
    void fetchPage(true);
  }, [enabled, fetchPage, isStatic]);

  useEffect(() => {
    if (!isStatic) return;
    setStaticVisibleCount(pageSize);
  }, [isStatic, pageSize, query]);

  const filteredStudents = useMemo(() => {
    const scoped = filter ? items.filter(filter) : items;
    return scoped.filter((student) => studentMatchesQuery(student, query));
  }, [filter, items, query]);

  const paginatedStudents = isStatic
    ? filteredStudents.slice(0, staticVisibleCount)
    : filteredStudents;

  const staticHasMore = isStatic && staticVisibleCount < filteredStudents.length;

  const options = useMemo(() => {
    const mapped = paginatedStudents.map((student) => mapStudentToOption(student, valueKind));
    if (
      selectedValue &&
      fallbackLabel &&
      !mapped.some((option) => option.value === selectedValue) &&
      !filteredStudents.some((student) => toOptionValue(student.id, valueKind) === selectedValue)
    ) {
      return [{ value: selectedValue, label: fallbackLabel }, ...mapped];
    }
    return mapped;
  }, [fallbackLabel, filteredStudents, paginatedStudents, selectedValue, valueKind]);

  const studentByValue = useMemo(() => {
    const map = new Map<string, StudentSummaryBackendDto>();
    for (const student of items) {
      map.set(toOptionValue(student.id, valueKind), student);
    }
    return map;
  }, [items, valueKind]);

  const onLoadMore = useCallback(() => {
    if (isStatic) {
      setStaticVisibleCount((count) => count + pageSize);
      return;
    }
    void fetchPage(false);
  }, [fetchPage, isStatic, pageSize]);

  return {
    options,
    loading: !isStatic && loading && items.length === 0,
    loadingMore: isStatic ? false : loadingMore,
    hasMore: isStatic ? staticHasMore : hasMore,
    onLoadMore,
    studentByValue,
    resolveStudent: (value: string) => studentByValue.get(value) ?? null,
  };
}

export function studentSummaryToOption(
  student: StudentSummaryBackendDto,
  valueKind: StudentSelectValueKind,
): AdvancedSelectOption {
  return mapStudentToOption(student, valueKind);
}

export { toOptionValue as studentSelectOptionValue };
