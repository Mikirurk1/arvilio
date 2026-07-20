'use client';

import { useMemo, useState } from 'react';
import type { StudentSummaryBackendDto } from '@pkg/types';
import { Field } from '../ui';
import { useStudentSelectOptions, type StudentSelectValueKind } from '../../hooks/use-student-select-options';

export type StudentSelectFieldProps = {
  id?: string;
  value: string;
  onValueChange: (value: string, student: StudentSummaryBackendDto | null) => void;
  valueKind?: StudentSelectValueKind;
  readOnly?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  filter?: (student: StudentSummaryBackendDto) => boolean;
  /** When set, uses this list instead of paginated `studentsPage`. */
  staticStudents?: StudentSummaryBackendDto[];
  fallbackLabel?: string;
  enabled?: boolean;
};

export function StudentSelectField({
  id,
  value,
  onValueChange,
  valueKind = 'backendId',
  readOnly = false,
  disabled = false,
  className,
  placeholder = 'Select student',
  searchPlaceholder = 'Search students…',
  filter,
  staticStudents,
  fallbackLabel,
  enabled = true,
}: StudentSelectFieldProps) {
  const [query, setQuery] = useState('');
  const { options, loading, loadingMore, hasMore, onLoadMore, resolveStudent } =
    useStudentSelectOptions({
      valueKind,
      filter,
      query,
      selectedValue: value,
      fallbackLabel,
      enabled,
      staticStudents,
    });

  const selectedLabel = useMemo(() => {
    const selected = options.find((option) => option.value === value);
    if (selected && typeof selected.label === 'string') return selected.label;
    return fallbackLabel ?? value;
  }, [fallbackLabel, options, value]);

  if (readOnly) {
    return (
      <Field
        id={id}
        className={className}
        readOnly
        value={value}
        formatValue={() => selectedLabel || '—'}
        onChange={() => {}}
      />
    );
  }

  return (
    <Field
      id={id}
      as="advancedSelect"
      className={className}
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      options={options}
      loading={loading}
      loadingMore={loadingMore}
      hasMore={hasMore}
      onSearch={setQuery}
      onLoadMore={onLoadMore}
      onChange={(event) => {
        const nextValue = event.target.value;
        onValueChange(nextValue, resolveStudent(nextValue));
      }}
    />
  );
}
