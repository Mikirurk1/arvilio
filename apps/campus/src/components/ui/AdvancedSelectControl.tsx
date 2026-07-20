'use client';

import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from 'react';
import { Search } from 'lucide-react';
import { useInfiniteScrollSentinel } from '../../hooks/use-infinite-scroll-sentinel';
import {
  findSelectOption,
  optionMatchesQuery,
  parseSelectOptionChildren,
  type AdvancedSelectOption,
} from './advanced-select-options';
import uiStyles from './ui.module.scss';

export type AdvancedSelectControlProps = {
  id: string;
  describedBy?: string;
  error?: string;
  className?: string;
  value?: string;
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  name?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  options?: AdvancedSelectOption[];
  children?: ReactNode;
  onSearch?: (query: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  searchDebounceMs?: number;
};

function emitSelectChange(
  onChange: AdvancedSelectControlProps['onChange'],
  value: string,
) {
  onChange?.({
    target: { value },
    currentTarget: { value },
  } as ChangeEvent<HTMLSelectElement>);
}

export const AdvancedSelectControl = forwardRef<HTMLSelectElement, AdvancedSelectControlProps>(
  function AdvancedSelectControl(
    {
      id,
      describedBy,
      error,
      className,
      value,
      onChange,
      disabled,
      name,
      placeholder = '—',
      searchPlaceholder = 'Search…',
      options: optionsProp,
      children,
      onSearch,
      onLoadMore,
      hasMore = false,
      loadingMore = false,
      loading = false,
      emptyMessage = 'No options found',
      searchDebounceMs = 250,
    },
    ref,
  ) {
    const listboxId = useId();
    const searchInputId = `${id}-search`;
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const listScrollRef = useRef<HTMLDivElement | null>(null);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedLabelCache, setSelectedLabelCache] = useState<ReactNode | null>(null);

    const options = useMemo(() => {
      if (optionsProp && optionsProp.length > 0) return optionsProp;
      return parseSelectOptionChildren(children);
    }, [children, optionsProp]);

    const selectedValue = String(value ?? '');
    const selectedOption = findSelectOption(options, selectedValue);
    const displayLabel = selectedOption?.label ?? selectedLabelCache ?? placeholder;

    const visibleOptions = useMemo(() => {
      if (onSearch) return options;
      return options.filter((option) => optionMatchesQuery(option, query));
    }, [onSearch, options, query]);

    const { sentinelRef } = useInfiniteScrollSentinel({
      scrollRef: listScrollRef,
      hasMore: Boolean(onLoadMore && hasMore),
      loadingMore: Boolean(loadingMore),
      onLoadMore: onLoadMore ?? (() => undefined),
      disabled: !open || !onLoadMore,
    });

    useEffect(() => {
      if (!open) return;
      const onPointerDown = (event: MouseEvent) => {
        if (!wrapperRef.current?.contains(event.target as Node)) {
          setOpen(false);
        }
      };
      document.addEventListener('mousedown', onPointerDown);
      return () => document.removeEventListener('mousedown', onPointerDown);
    }, [open]);

    useEffect(() => {
      if (!open) {
        setQuery('');
        return;
      }
      const timer = window.setTimeout(() => {
        document.getElementById(searchInputId)?.focus();
      }, 0);
      return () => window.clearTimeout(timer);
    }, [open, searchInputId]);

    useEffect(() => {
      if (!onSearch) return;
      const timer = window.setTimeout(() => onSearch(query), searchDebounceMs);
      return () => window.clearTimeout(timer);
    }, [onSearch, query, searchDebounceMs]);

    useEffect(() => {
      if (selectedOption?.label != null) {
        setSelectedLabelCache(selectedOption.label);
      }
    }, [selectedOption?.label]);

    const showEmpty = !loading && visibleOptions.length === 0;

    return (
      <>
        <div
          ref={wrapperRef}
          className={[uiStyles.adaptiveSelectWrap, open ? uiStyles.adaptiveSelectWrapOpen : '']
            .filter(Boolean)
            .join(' ')}
        >
          <button
            type="button"
            className={[
              className,
              uiStyles.adaptiveSelectTrigger,
              open ? uiStyles.adaptiveSelectTriggerOpen : '',
            ]
              .filter(Boolean)
              .join(' ')}
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listboxId}
            id={id}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            onClick={() => setOpen((current) => !current)}
          >
            <span className={uiStyles.adaptiveSelectValue}>{displayLabel}</span>
            <span className={uiStyles.adaptiveSelectChevron} aria-hidden>
              <svg viewBox="0 0 20 20" width="14" height="14" fill="none">
                <path
                  d="M5 7.5L10 12.5L15 7.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>

          {open ? (
            <div className={uiStyles.advancedSelectMenu}>
              <div className={uiStyles.advancedSelectSearch}>
                <Search size={14} aria-hidden className={uiStyles.advancedSelectSearchIcon} />
                <input
                  id={searchInputId}
                  type="search"
                  className={uiStyles.advancedSelectSearchInput}
                  value={query}
                  placeholder={searchPlaceholder}
                  aria-controls={listboxId}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                      event.preventDefault();
                      setOpen(false);
                    }
                  }}
                />
              </div>

              <div
                id={listboxId}
                ref={listScrollRef}
                role="listbox"
                aria-labelledby={id}
                className={uiStyles.advancedSelectList}
              >
                {loading && visibleOptions.length === 0 ? (
                  <div className={uiStyles.advancedSelectStatus}>Loading…</div>
                ) : null}

                {visibleOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={option.value === selectedValue}
                    disabled={option.disabled}
                    className={[
                      uiStyles.adaptiveSelectItem,
                      option.value === selectedValue ? uiStyles.adaptiveSelectItemActive : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => {
                      if (option.disabled) return;
                      emitSelectChange(onChange, option.value);
                      setSelectedLabelCache(option.label);
                      setOpen(false);
                    }}
                  >
                    {option.label}
                  </button>
                ))}

                {showEmpty ? (
                  <div className={uiStyles.advancedSelectStatus}>{emptyMessage}</div>
                ) : null}

                {loadingMore ? (
                  <div className={uiStyles.advancedSelectStatus}>Loading more…</div>
                ) : null}

                {onLoadMore ? <div ref={sentinelRef} className={uiStyles.advancedSelectSentinel} /> : null}
              </div>
            </div>
          ) : null}

          <select
            ref={ref}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            tabIndex={-1}
            aria-hidden
            style={{ display: 'none' }}
          >
            {selectedValue ? (
              <option value={selectedValue}>{String(displayLabel ?? selectedValue)}</option>
            ) : null}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {typeof option.label === 'string' || typeof option.label === 'number'
                  ? option.label
                  : option.value}
              </option>
            ))}
          </select>
        </div>
      </>
    );
  },
);

AdvancedSelectControl.displayName = 'AdvancedSelectControl';
