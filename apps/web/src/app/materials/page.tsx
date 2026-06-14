'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { LibraryMaterialDto } from '@pkg/types';
import { Grid3x3, List, Plus, Search } from 'lucide-react';
import {
  Button,
  EmptyStateCard,
  Field,
  PageHeader,
  SegmentedControl,
  SurfaceCard,
} from '../../components/ui';
import { confirmDialog } from '../../features/confirm';
import { MaterialCard } from '../../features/materials/MaterialCard';
import { MaterialFormModal } from '../../features/materials/MaterialFormModal';
import {
  LIBRARY_KIND_FILTER_OPTIONS,
  type LibraryKindFilter,
} from '../../features/materials/material-asset-presets';
import {
  clearMaterialPendingSave,
  readMaterialPendingSave,
  type MaterialPendingSave,
} from '../../features/materials/material-save-recovery';
import { useMaterialsStore } from '../../stores/materials-store';
import styles from './page.module.scss';

const emptyLibraryItems: LibraryMaterialDto[] = [];

export default function MaterialsPage() {
  const list = useMaterialsStore((s) => s.list);
  const listKind = useMaterialsStore((s) => s.listKind);
  const listSearch = useMaterialsStore((s) => s.listSearch);
  const saving = useMaterialsStore((s) => s.saving);
  const fetchList = useMaterialsStore((s) => s.fetchList);
  const setListKind = useMaterialsStore((s) => s.setListKind);
  const setListSearch = useMaterialsStore((s) => s.setListSearch);
  const createMaterial = useMaterialsStore((s) => s.createMaterial);
  const updateMaterial = useMaterialsStore((s) => s.updateMaterial);
  const deleteMaterial = useMaterialsStore((s) => s.deleteMaterial);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchDraft, setSearchDraft] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<LibraryMaterialDto | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingRecovery, setPendingRecovery] = useState<MaterialPendingSave | null>(null);

  useEffect(() => {
    const recovery = readMaterialPendingSave();
    setPendingRecovery(recovery);
    setSearchDraft(useMaterialsStore.getState().listSearch);

    const cached = useMaterialsStore.getState().list;
    void fetchList({
      force: cached.status !== 'success' || Boolean(recovery),
    });
  }, [fetchList]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      setPendingRecovery(readMaterialPendingSave());
      void fetchList({ force: true });
    };

    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [fetchList]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchDraft !== listSearch) {
        setListSearch(searchDraft);
        void fetchList({ search: searchDraft, force: true });
      }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchDraft, listSearch, setListSearch, fetchList]);

  const hasCachedList = list.data !== null;
  const kindCounts = list.data?.kindCounts;
  const items = list.data?.items ?? emptyLibraryItems;
  const isInitialLoading = !hasCachedList && (list.status === 'loading' || list.status === 'idle');
  const isRefreshing = hasCachedList && list.status === 'loading';
  const isError = list.status === 'error';

  const filterOptions = useMemo(
    () =>
      LIBRARY_KIND_FILTER_OPTIONS.map((option) => ({
        value: option.value,
        label: (
          <>
            {option.label}
            {kindCounts ? (
              <span className={styles.count}>
                {option.value === 'all'
                  ? kindCounts.all
                  : kindCounts[option.value as keyof typeof kindCounts]}
              </span>
            ) : null}
          </>
        ),
      })),
    [kindCounts],
  );

  const onKindChange = (kind: LibraryKindFilter) => {
    setListKind(kind);
    void fetchList({ kind, force: true });
  };

  const onDelete = useCallback(
    async (material: LibraryMaterialDto) => {
      const confirmed = await confirmDialog({
        title: 'Delete material?',
        message: `“${material.title}” will be removed from the library. Lessons that already reference it keep the link until you detach it.`,
        confirmLabel: 'Delete',
        variant: 'danger',
      });
      if (!confirmed) return;
      setDeletingId(material.id);
      try {
        await deleteMaterial(material.id);
      } finally {
        setDeletingId(null);
      }
    },
    [deleteMaterial],
  );

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (material: LibraryMaterialDto) => {
    setEditing(material);
    setModalOpen(true);
  };

  const continuePendingSave = async () => {
    if (!pendingRecovery) return;
    setListKind('all');
    setListSearch('');
    setSearchDraft('');
    await fetchList({ force: true, kind: 'all', search: '' });
    const freshItems = useMaterialsStore.getState().list.data?.items ?? emptyLibraryItems;
    const material = freshItems.find((item) => item.id === pendingRecovery.materialId);
    if (material) {
      openEdit(material);
    }
    clearMaterialPendingSave();
    setPendingRecovery(null);
  };

  const dismissPendingSave = () => {
    clearMaterialPendingSave();
    setPendingRecovery(null);
  };

  return (
    <div className={`${styles.page} container container--page`}>
      <PageHeader
        className={styles.pageHeader}
        titleClassName={styles.pageTitle}
        subtitleClassName={styles.pageSub}
        title="Materials"
        subtitle="School library of boards, presentations, books, and reusable lesson resources."
        actions={
          <Button type="button" onClick={openCreate}>
            <Plus size={16} aria-hidden />
            Add material
          </Button>
        }
      />

      {pendingRecovery ? (
        <SurfaceCard className={styles.recoveryBanner} padding="compact">
          <div className={styles.recoveryText}>
            <strong>Interrupted upload</strong>
            <p>
              Saving “{pendingRecovery.title}” was not finished. Open the material and attach any
              remaining files.
            </p>
          </div>
          <div className={styles.recoveryActions}>
            <Button type="button" onClick={() => void continuePendingSave()}>
              Continue editing
            </Button>
            <Button type="button" variant="ghost" onClick={dismissPendingSave}>
              Dismiss
            </Button>
          </div>
        </SurfaceCard>
      ) : null}

      {kindCounts ? (
        <div className={styles.statsRow}>
          <SurfaceCard padding="compact" className={styles.statCard}>
            <span className={styles.statValue}>{kindCounts.all}</span>
            <span className={styles.statLabel}>Total</span>
          </SurfaceCard>
          <SurfaceCard padding="compact" className={styles.statCard}>
            <span className={styles.statValue}>{kindCounts.board}</span>
            <span className={styles.statLabel}>Boards</span>
          </SurfaceCard>
          <SurfaceCard padding="compact" className={styles.statCard}>
            <span className={styles.statValue}>{kindCounts.presentation}</span>
            <span className={styles.statLabel}>Presentations</span>
          </SurfaceCard>
          <SurfaceCard padding="compact" className={styles.statCard}>
            <span className={styles.statValue}>{kindCounts.book}</span>
            <span className={styles.statLabel}>Books</span>
          </SurfaceCard>
        </div>
      ) : null}

      <SurfaceCard className={styles.controlsCard}>
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} aria-hidden />
            <Field
              id="materials-search"
              className={styles.searchField}
              type="search"
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder="Search by title, publisher, or description…"
              aria-label="Search materials"
            />
          </div>

          <SegmentedControl
            ariaLabel="View mode"
            value={viewMode}
            onValueChange={setViewMode}
            options={[
              { value: 'grid', label: 'Grid', icon: <Grid3x3 size={14} aria-hidden /> },
              { value: 'list', label: 'List', icon: <List size={14} aria-hidden /> },
            ]}
          />
        </div>

        <SegmentedControl
          className={styles.kindFilters}
          ariaLabel="Material type"
          value={listKind}
          onValueChange={onKindChange}
          options={filterOptions}
        />
      </SurfaceCard>

      {isInitialLoading ? <p className={styles.loadingHint}>Loading materials…</p> : null}
      {isRefreshing ? <p className={styles.refreshingHint}>Refreshing library…</p> : null}
      {isError ? (
        <EmptyStateCard title="Could not load materials" description={list.error ?? 'Unknown error'} />
      ) : null}

      {!isInitialLoading && !isError && items.length === 0 ? (
        <EmptyStateCard
          title="No materials yet"
          description="Add your first board, presentation, or book to build the school library."
          action={
            <Button type="button" onClick={openCreate}>
              Add material
            </Button>
          }
        />
      ) : null}

      {items.length > 0 ? (
        <div className={viewMode === 'grid' ? styles.grid : styles.list}>
          {items.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              layout={viewMode}
              onEdit={openEdit}
              onDelete={(item) => void onDelete(item)}
              deleting={deletingId === material.id}
            />
          ))}
        </div>
      ) : null}

      {list.data?.nextCursor ? (
        <div className={styles.loadMoreWrap}>
          <Button
            type="button"
            variant="ghost"
            loading={isRefreshing}
            loadingLabel="Loading…"
            onClick={() => void fetchList({ cursor: list.data?.nextCursor, append: true, force: true })}
          >
            Load more
          </Button>
        </div>
      ) : null}

      <MaterialFormModal
        open={modalOpen}
        initial={editing}
        saving={saving}
        onClose={() => setModalOpen(false)}
        onSave={createMaterial}
        onUpdate={(id, body) => updateMaterial(id, body)}
      />
    </div>
  );
}
