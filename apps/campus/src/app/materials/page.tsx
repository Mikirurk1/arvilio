'use client';

import { useCallback, useEffect, useState } from 'react';
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
import { useCampusT } from '../../lib/cms';
import { confirmDialog } from '../../features/confirm';
import { MaterialCard } from '../../features/materials/MaterialCard';
import { MaterialFormModal } from '../../features/materials/MaterialFormModal';
import type { LibraryKindFilter } from '../../features/materials/material-asset-presets';
import {
  clearMaterialPendingSave,
  readMaterialPendingSave,
  type MaterialPendingSave,
} from '../../features/materials/material-save-recovery';
import { useMaterialsStore } from '../../stores/materials-store';
import styles from './page.module.scss';

const emptyLibraryItems: LibraryMaterialDto[] = [];

export default function MaterialsPage() {
  const t = useCampusT();
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

  const onKindChange = (kind: LibraryKindFilter) => {
    setListKind(kind);
    void fetchList({ kind, force: true });
  };

  const onDelete = useCallback(
    async (material: LibraryMaterialDto) => {
      const confirmed = await confirmDialog({
        title: t('materials.delete.title'),
        message: t('materials.delete.message', { title: material.title }),
        confirmLabel: t('materials.delete.confirm'),
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
    [deleteMaterial, t],
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
        title={t('materials.title')}
        subtitle={t('materials.subtitle')}
        actions={
          <Button type="button" onClick={openCreate} data-tour-anchor="materials-create">
            <Plus size={16} aria-hidden />
            {t('materials.add')}
          </Button>
        }
      />

      {pendingRecovery ? (
        <SurfaceCard className={styles.recoveryBanner} padding="compact">
          <div className={styles.recoveryText}>
            <strong>{t('materials.recovery.title')}</strong>
            <p>{t('materials.recovery.body', { title: pendingRecovery.title })}</p>
          </div>
          <div className={styles.recoveryActions}>
            <Button type="button" onClick={() => void continuePendingSave()}>
              {t('materials.recovery.continue')}
            </Button>
            <Button type="button" variant="ghost" onClick={dismissPendingSave}>
              {t('materials.recovery.dismiss')}
            </Button>
          </div>
        </SurfaceCard>
      ) : null}

      {kindCounts ? (
        <div className={styles.statsRow}>
          {([
            { key: 'all', label: t('materials.stat.total'), count: kindCounts.all, tone: styles.statCardAll },
            { key: 'board', label: t('materials.stat.boards'), count: kindCounts.board, tone: styles.statCardBoard },
            { key: 'presentation', label: t('materials.stat.presentations'), count: kindCounts.presentation, tone: styles.statCardPresentation },
            { key: 'book', label: t('materials.stat.books'), count: kindCounts.book, tone: styles.statCardBook },
          ] as const).map(({ key, label, count, tone }) => (
            <Button
              key={key}
              variant="bare"
              type="button"
              onClick={() => onKindChange(key)}
              className={[
                styles.statCard,
                tone,
                listKind === key ? styles.statCardActive : '',
              ].join(' ')}
            >
              <span className={styles.statValue}>{count}</span>
              <span className={styles.statLabel}>{label}</span>
            </Button>
          ))}
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
              placeholder={t('materials.searchPlaceholder')}
              aria-label={t('materials.searchAria')}
            />
          </div>

          <SegmentedControl
            ariaLabel={t('materials.viewModeAria')}
            value={viewMode}
            onValueChange={setViewMode}
            options={[
              { value: 'grid', label: t('materials.view.grid'), icon: <Grid3x3 size={14} aria-hidden /> },
              { value: 'list', label: t('materials.view.list'), icon: <List size={14} aria-hidden /> },
            ]}
          />
        </div>

      </SurfaceCard>

      {isInitialLoading ? <p className={styles.loadingHint}>{t('materials.loading')}</p> : null}
      {isRefreshing ? <p className={styles.refreshingHint}>{t('materials.refreshing')}</p> : null}
      {isError ? (
        <EmptyStateCard
          title={t('materials.loadError')}
          description={list.error ?? t('materials.unknownError')}
        />
      ) : null}

      {!isInitialLoading && !isError && items.length === 0 ? (
        <EmptyStateCard
          title={t('materials.emptyTitle')}
          description={t('materials.emptyDesc')}
          action={
            <Button type="button" onClick={openCreate}>
              {t('materials.add')}
            </Button>
          }
        />
      ) : null}

      {items.length > 0 ? (
        <div
          className={viewMode === 'grid' ? styles.grid : styles.list}
          data-tour-anchor="materials-grid"
        >
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
            loadingLabel={t('materials.loadingShort')}
            onClick={() => void fetchList({ cursor: list.data?.nextCursor, append: true, force: true })}
          >
            {t('materials.loadMore')}
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
