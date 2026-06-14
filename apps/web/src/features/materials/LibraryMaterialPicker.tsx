'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { LibraryMaterialDto } from '@pkg/types';
import { Search, X } from 'lucide-react';
import { BodyPortal, Button, Field, SegmentedControl } from '../../components/ui';
import { useFocusTrap } from '../../hooks/use-focus-trap';
import {
  LIBRARY_KIND_FILTER_OPTIONS,
  LIBRARY_KIND_LABELS,
  type LibraryKindFilter,
} from './material-asset-presets';
import { useMaterialsStore } from '../../stores/materials-store';
import styles from './LibraryMaterialPicker.module.scss';

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (materials: LibraryMaterialDto[]) => void;
  excludeIds?: string[];
};

export function LibraryMaterialPicker({ open, onClose, onConfirm, excludeIds = [] }: Props) {
  const list = useMaterialsStore((s) => s.list);
  const fetchList = useMaterialsStore((s) => s.fetchList);
  const [kind, setKind] = useState<LibraryKindFilter>('all');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  useFocusTrap(open, modalRef);

  useEffect(() => {
    if (!open) return;
    setSelectedIds([]);
    void fetchList({ kind, search, force: true });
  }, [open, kind, search, fetchList]);

  const excluded = useMemo(() => new Set(excludeIds), [excludeIds]);
  const items = (list.data?.items ?? []).filter((item) => !excluded.has(item.id));

  const toggle = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]));
  };

  const selectedMaterials = items.filter((item) => selectedIds.includes(item.id));

  if (!open) return null;

  return (
    <BodyPortal>
      <div className={styles.overlay} role="presentation" onClick={onClose}>
        <div
          ref={modalRef}
          className={styles.modal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="library-picker-title"
          onClick={(event) => event.stopPropagation()}
        >
        <header className={styles.header}>
          <div>
            <h2 id="library-picker-title" className={styles.title}>
              Add from library
            </h2>
            <p className={styles.subtitle}>Attach reusable school materials to this lesson.</p>
          </div>
          <Button type="button" variant="ghost" onClick={onClose} aria-label="Close">
            <X size={18} aria-hidden />
          </Button>
        </header>

        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} aria-hidden />
            <Field
              id="library-material-picker-search"
              className={styles.searchField}
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search materials…"
              aria-label="Search library"
            />
          </div>
          <SegmentedControl
            ariaLabel="Material type"
            value={kind}
            onValueChange={setKind}
            options={LIBRARY_KIND_FILTER_OPTIONS.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
          />
        </div>

        <div className={styles.list}>
          {list.status === 'loading' ? <p className={styles.hint}>Loading library…</p> : null}
          {items.length === 0 && list.status !== 'loading' ? (
            <p className={styles.hint}>No matching materials in the library.</p>
          ) : null}
          {items.map((item) => {
            const checked = selectedIds.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                className={[styles.row, checked ? styles.rowSelected : ''].filter(Boolean).join(' ')}
                onClick={() => toggle(item.id)}
              >
                <span className={styles.rowTitle}>{item.title}</span>
                <span className={styles.rowMeta}>
                  {LIBRARY_KIND_LABELS[item.kind]}
                  {item.assets.length > 0 ? ` · ${item.assets.length} assets` : ''}
                </span>
              </button>
            );
          })}
        </div>

        <footer className={styles.footer}>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={selectedMaterials.length === 0}
            onClick={() => {
              onConfirm(selectedMaterials);
              onClose();
            }}
          >
            Add {selectedMaterials.length > 0 ? `(${selectedMaterials.length})` : ''}
          </Button>
        </footer>
        </div>
      </div>
    </BodyPortal>
  );
}
