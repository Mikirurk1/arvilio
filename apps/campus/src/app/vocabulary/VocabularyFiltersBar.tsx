'use client';

import { Field, SegmentedControl } from '../../components/ui';
import { useCampusT } from '../../lib/cms';
import { formatPosFilterLabel } from './VocabularyWordCards';
import styles from './page.module.scss';

export function VocabularyFiltersBar({
  search,
  setSearch,
  posFilters,
  filter,
  setFilter,
  lessonFilter,
  setLessonFilter,
  lessonOptions,
}: {
  search: string;
  setSearch: (value: string) => void;
  posFilters: string[];
  filter: string;
  setFilter: (value: string) => void;
  lessonFilter: string;
  setLessonFilter: (value: string) => void;
  lessonOptions: Array<{ value: string; label: string }>;
}) {
  const t = useCampusT();
  return (
    <div className={styles.filters} data-tour-anchor="vocab-filters">
      <div className={styles.searchRow}>
        <Field
          className={styles.searchInput}
          placeholder={t('vocabulary.filter.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className={styles.filterSelectWrap}>
          <Field
            as="select"
            className={styles.lessonFilterSelect}
            value={lessonFilter}
            onChange={(event) => setLessonFilter(event.target.value)}
          >
            {lessonOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Field>
        </div>
      </div>
      <SegmentedControl
        value={filter}
        onValueChange={setFilter}
        ariaLabel={t('vocabulary.filter.posAria')}
        className={styles.catFilters}
        optionClassName={styles.catBtn}
        activeOptionClassName={styles.catActive}
        options={posFilters.map((pos) => ({
          value: pos,
          label: formatPosFilterLabel(pos, t('vocabulary.filter.all')),
        }))}
      />
    </div>
  );
}
