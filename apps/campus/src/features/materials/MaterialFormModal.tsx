'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type {
  CreateLibraryMaterialRequestDto,
  LibraryMaterialDto,
  LibraryMaterialKindName,
} from '@pkg/types';
import { AlertCircle, Check, Pencil, Sparkles, X } from 'lucide-react';
import { BodyPortal, Button, isStorageQuotaError, UpgradePrompt } from '../../components/ui';
import { useCampusT } from '../../lib/cms';
import { useFocusTrap } from '../../hooks/use-focus-trap';
import { useNavigationLock } from '../../hooks/use-navigation-lock';
import { collectUniqueTags } from '../../lib/tag-list';
import { normalizeProficiencyLevelCode } from '../../lib/proficiency-level';
import type { MaterialCompressLevel } from '../../lib/material-compress-level';
import { MATERIAL_COMPRESS_LEVEL_OPTIONS } from '../../lib/material-compress-level';
import { useMaterialsStore } from '../../stores/materials-store';
import {
  collectPendingMaterialUploads,
  defaultAssetsForKind,
  isMultiFileAssetRole,
  LIBRARY_ASSET_ROLE_LABELS,
  newAssetFileEntry,
  type MaterialAssetDraft,
} from './material-asset-presets';
import {
  persistLibraryMaterial,
  planMaterialSaveSteps,
  validateMaterialForm,
  type MaterialSaveProgress,
} from './material-form-utils';
import { materialCoverImageHref } from './material-cover';
import { libraryKindMeta } from './material-kind-meta';
import type { MaterialKindTone } from './material-kind-meta';
import { MaterialSaveProgressPanel } from './MaterialSaveProgressPanel';
import { MaterialOverviewSection } from './MaterialOverviewSection';
import { MaterialDetailsSection } from './MaterialDetailsSection';
import { MaterialAssetsSection } from './MaterialAssetsSection';
import styles from './MaterialFormModal.module.scss';

const toneClass: Record<MaterialKindTone, string> = {
  board: styles.toneBoard,
  presentation: styles.tonePresentation,
  book: styles.toneBook,
  other: styles.toneOther,
};

const emptyLibraryMaterials: LibraryMaterialDto[] = [];

type Props = {
  open: boolean;
  initial?: LibraryMaterialDto | null;
  saving?: boolean;
  onClose: () => void;
  onSave: (body: CreateLibraryMaterialRequestDto) => Promise<LibraryMaterialDto>;
  onUpdate?: (id: string, body: CreateLibraryMaterialRequestDto) => Promise<LibraryMaterialDto>;
};

function materialToDrafts(material: LibraryMaterialDto): MaterialAssetDraft[] {
  if (material.assets.length === 0) return defaultAssetsForKind(material.kind);

  const sorted = [...material.assets].sort((a, b) => a.sortOrder - b.sortOrder);
  const drafts: MaterialAssetDraft[] = [];

  for (const asset of sorted) {
    const label = asset.label ?? '';
    if (isMultiFileAssetRole(asset.role) && asset.deliveryKind === 'file') {
      const entry = newAssetFileEntry({
        fileAttachmentId: asset.fileAttachmentId,
        fileName: asset.fileName,
        downloadPath: asset.downloadPath,
        previewDownloadPath: asset.previewDownloadPath,
      });
      const last = drafts[drafts.length - 1];
      if (last && last.role === asset.role && last.deliveryKind === 'file' && last.label === label && isMultiFileAssetRole(last.role)) {
        last.files = [...(last.files ?? []), entry];
        continue;
      }
      drafts.push({ key: asset.id, role: asset.role, deliveryKind: 'file', url: '', label, fileAttachmentId: null, pendingFile: null, fileName: null, files: [entry] });
      continue;
    }
    drafts.push({ key: asset.id, role: asset.role, deliveryKind: asset.deliveryKind, url: asset.url ?? '', label, fileAttachmentId: asset.fileAttachmentId, pendingFile: null, fileName: asset.fileName, downloadPath: asset.downloadPath, previewDownloadPath: asset.previewDownloadPath });
  }

  return drafts;
}

export function MaterialFormModal({ open, initial, saving = false, onClose, onSave, onUpdate }: Props) {
  const t = useCampusT();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [kind, setKind] = useState<LibraryMaterialKindName>('board');
  const [level, setLevel] = useState('');
  const [publisher, setPublisher] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [assets, setAssets] = useState<MaterialAssetDraft[]>(defaultAssetsForKind('board'));
  const [coverAttachmentId, setCoverAttachmentId] = useState<string | null>(null);
  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [removeCover, setRemoveCover] = useState(false);
  const [compressLevel, setCompressLevel] = useState<MaterialCompressLevel>('balanced');
  const listItems = useMaterialsStore((s) => s.list.data?.items ?? emptyLibraryMaterials);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [localErrorRaw, setLocalErrorRaw] = useState<unknown>(null);
  const [saveProgress, setSaveProgress] = useState<MaterialSaveProgress | null>(null);
  const [saveSteps, setSaveSteps] = useState<ReturnType<typeof planMaterialSaveSteps>>([]);
  const [persisting, setPersisting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const isBusy = persisting || saving;

  useNavigationLock(isBusy, 'Material upload is still in progress. Leave this page and the upload will be interrupted.');
  useFocusTrap(open, modalRef);

  const kindMeta = libraryKindMeta(kind);
  const KindIcon = kindMeta.Icon;

  const tagSuggestions = useMemo(
    () => collectUniqueTags(listItems.map((item) => item.tags)),
    [listItems],
  );

  const compressLevelHint = useMemo(
    () => MATERIAL_COMPRESS_LEVEL_OPTIONS.find((option) => option.value === compressLevel)?.hint,
    [compressLevel],
  );

  const roleOptions = useMemo(
    () => Object.entries(LIBRARY_ASSET_ROLE_LABELS).map(([value, label]) => ({ value, label })),
    [],
  );

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setTitle(initial.title);
      setDescription(initial.description ?? '');
      setKind(initial.kind);
      setLevel(normalizeProficiencyLevelCode(initial.level));
      setPublisher(initial.publisher ?? '');
      setTags([...initial.tags]);
      setAssets(materialToDrafts(initial));
      setCoverAttachmentId(initial.coverAttachmentId ?? null);
      setCoverPreviewUrl(materialCoverImageHref(initial));
      setPendingCoverFile(null);
      setRemoveCover(false);
      setCompressLevel('balanced');
    } else {
      setTitle('');
      setDescription('');
      setKind('board');
      setLevel('');
      setPublisher('');
      setTags([]);
      setAssets(defaultAssetsForKind('board'));
      setCoverAttachmentId(null);
      setCoverPreviewUrl(null);
      setPendingCoverFile(null);
      setRemoveCover(false);
      setCompressLevel('balanced');
    }
    setLocalError(null);
    setLocalErrorRaw(null);
    setSaveProgress(null);
    setSaveSteps([]);
    setPersisting(false);
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isBusy) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, isBusy, onClose]);

  const onKindChange = (nextKind: LibraryMaterialKindName) => {
    setKind(nextKind);
    if (!initial) setAssets(defaultAssetsForKind(nextKind));
  };

  const updateAsset = (index: number, patch: Partial<MaterialAssetDraft>) => {
    setAssets((prev) => prev.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)));
  };

  const handleSubmit = async () => {
    if (isBusy) return;
    const baseBody: CreateLibraryMaterialRequestDto = {
      title: title.trim(),
      description: description.trim() || undefined,
      kind,
      tags,
      level: level || undefined,
      publisher: publisher.trim() || undefined,
    };
    if (!title.trim()) {
      setTitleError('Title is required');
      setTimeout(() => {
        modalRef.current?.querySelector('[data-field-error="title"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }
    setTitleError(null);
    const validationError = validateMaterialForm({ title, kind, assets });
    if (validationError) { setLocalError(validationError); return; }
    if (!onUpdate && initial) { setLocalError('Could not update material'); return; }
    setLocalError(null);
    const steps = planMaterialSaveSteps(initial?.id ?? null, assets);
    setSaveSteps(steps);
    setPersisting(true);
    try {
      await persistLibraryMaterial({
        baseBody, assets, initialId: initial?.id ?? null,
        cover: { attachmentId: coverAttachmentId, pendingFile: pendingCoverFile, remove: removeCover },
        compressLevel, onSave, onUpdate: onUpdate ?? ((_id, body) => onSave(body)),
        onProgress: setSaveProgress,
      });
      const hasUploads = collectPendingMaterialUploads(assets).length > 0;
      await new Promise((resolve) => window.setTimeout(resolve, hasUploads ? 2000 : 350));
      onClose();
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Could not save material');
      setLocalErrorRaw(error);
      setSaveProgress(null);
    } finally {
      setPersisting(false);
    }
  };

  if (!open) return null;

  return (
    <BodyPortal>
      <div className={styles.overlay} role="presentation" onClick={isBusy ? undefined : onClose}>
        <div
          ref={modalRef}
          className={[styles.modal, isBusy ? styles.modalBusy : ''].filter(Boolean).join(' ')}
          role="dialog"
          aria-modal="true"
          aria-labelledby="material-form-title"
          data-tour-anchor="materials-upload"
          onClick={(event) => event.stopPropagation()}
        >
          <header className={styles.header}>
            <div className={styles.headerMain}>
              <div className={[styles.headerIcon, toneClass[kindMeta.tone]].filter(Boolean).join(' ')}>
                <KindIcon size={22} aria-hidden />
              </div>
              <div className={styles.headerText}>
                <span className={[styles.modeBadge, initial ? styles.modeBadgeEdit : ''].filter(Boolean).join(' ')}>
                  {initial ? (
                    <><Pencil size={11} aria-hidden />Editing</>
                  ) : (
                    <><Sparkles size={11} aria-hidden />New entry</>
                  )}
                </span>
                <h2 id="material-form-title" className={styles.title}>
                  {initial ? t('materials.form.editTitle') : t('materials.form.createTitle')}
                </h2>
                <p className={styles.subtitle}>
                  Build a reusable library item — links, files, and metadata your team can attach to lessons.
                </p>
              </div>
            </div>
            <Button variant="bare" type="button" className={styles.closeBtn} onClick={onClose} disabled={isBusy} aria-label={t('materials.form.closeAria')}>
              <X size={16} aria-hidden />
            </Button>
          </header>

          <div className={styles.body}>
            <MaterialOverviewSection
              kind={kind}
              title={title}
              description={description}
              isBusy={isBusy}
              titleError={titleError ?? undefined}
              onKindChange={onKindChange}
              setTitle={(v) => { setTitleError(null); setTitle(v); }}
              setDescription={setDescription}
            />
            <MaterialDetailsSection
              level={level}
              publisher={publisher}
              coverPreviewUrl={coverPreviewUrl}
              coverAttachmentId={coverAttachmentId}
              pendingCoverFile={pendingCoverFile}
              tags={tags}
              tagSuggestions={tagSuggestions}
              isBusy={isBusy}
              setLevel={setLevel}
              setPublisher={setPublisher}
              setTags={setTags}
              setLocalError={setLocalError}
              setCoverAttachmentId={setCoverAttachmentId}
              setPendingCoverFile={setPendingCoverFile}
              setCoverPreviewUrl={setCoverPreviewUrl}
              setRemoveCover={setRemoveCover}
            />
            <MaterialAssetsSection
              kind={kind}
              assets={assets}
              compressLevel={compressLevel}
              compressLevelHint={compressLevelHint}
              isBusy={isBusy}
              roleOptions={roleOptions}
              setAssets={setAssets}
              setCompressLevel={setCompressLevel}
              setLocalError={setLocalError}
              updateAsset={updateAsset}
            />
            {localError ? (
              isStorageQuotaError(localErrorRaw) ? (
                <UpgradePrompt message={localError} />
              ) : (
                <p className={styles.error} role="alert">
                  <AlertCircle size={16} aria-hidden />
                  {localError}
                </p>
              )
            ) : null}
          </div>

          <footer className={styles.footer}>
            {isBusy && saveProgress ? (
              <MaterialSaveProgressPanel progress={saveProgress} steps={saveSteps} />
            ) : null}
            <div className={styles.footerActions}>
              <Button type="button" variant="ghost" onClick={onClose} disabled={isBusy}>
                {t('materials.form.cancel')}
              </Button>
              <Button
                type="button"
                variant="primary"
                loading={isBusy}
                loadingLabel={t('materials.form.saving')}
                disabled={isBusy}
                onClick={() => void handleSubmit()}
              >
                <Check size={16} aria-hidden />
                {initial ? t('materials.form.save') : t('materials.form.createAction')}
              </Button>
            </div>
          </footer>
        </div>
      </div>
    </BodyPortal>
  );
}
