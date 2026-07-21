'use client';

import type { LibraryMaterialAssetDto, LibraryMaterialDto, LibraryMaterialKindName } from '@pkg/types';
import { FileText, Link2, Play, Video, Volume2 } from 'lucide-react';
import Link from 'next/link';
import { Badge, Button, Field } from '../../components/ui';
import {
  materialAssetPrimaryName,
  materialAssetSecondaryHint,
} from './material-asset-display';
import { MaterialAssetLink } from './MaterialAssetLink';
import { materialAssetPreviewHref, materialCoverImageHref } from './material-cover';
import { libraryKindMeta } from './material-kind-meta';
import {
  effectiveSharedLibraryAssetIds,
  isAssetSharedWithStudent,
  splitLibraryAssetsForLessonViewer,
  type LessonLibraryAssetAudience,
  type LessonLibraryMediaShare,
} from './lesson-library-assets';
import styles from './LessonLibraryMaterialPanel.module.scss';

type Props = {
  material: LibraryMaterialDto;
  audience?: LessonLibraryAssetAudience;
  canManageLibrary?: boolean;
  sharedLibraryAssetIds?: string[] | null;
  libraryMediaSelectionApplied?: boolean | null;
  onSharedLibraryAssetIdsChange?: (ids: string[]) => void;
  /** Staff lesson context: review this student's annotations on student-facing books. */
  reviewStudentId?: string | null;
  returnTo?: string | null;
};

function AssetIcon({ asset }: { asset: LibraryMaterialAssetDto }) {
  if (asset.role === 'audio') return <Volume2 size={14} aria-hidden />;
  if (asset.role === 'video') return <Video size={14} aria-hidden />;
  if (asset.deliveryKind === 'url') return <Link2 size={14} aria-hidden />;
  return <FileText size={14} aria-hidden />;
}

function AssetChip({
  asset,
  muted = false,
  reviewStudentId,
  returnTo,
}: {
  asset: LibraryMaterialAssetDto;
  muted?: boolean;
  reviewStudentId?: string | null;
  returnTo?: string | null;
}) {
  const name = materialAssetPrimaryName(asset);
  const title = materialAssetSecondaryHint(asset) ?? name;
  const previewHref = materialAssetPreviewHref(asset);
  const hasHref =
    (asset.deliveryKind === 'url' && asset.url) ||
    (asset.deliveryKind === 'file' && asset.downloadPath);

  const content = (
    <>
      {previewHref ? (
        <img src={previewHref} alt="" className={styles.chipThumb} />
      ) : (
        <span className={styles.chipIcon}>
          <AssetIcon asset={asset} />
        </span>
      )}
      <span className={styles.chipLabel}>{name}</span>
    </>
  );

  const chipClass = muted ? styles.chipMuted : styles.chip;

  if (!hasHref) {
    return (
      <span className={chipClass} title={title}>
        {content}
      </span>
    );
  }

  return (
    <MaterialAssetLink
      asset={asset}
      className={chipClass}
      title={title}
      reviewStudentId={reviewStudentId}
      returnTo={returnTo}
    >
      {content}
    </MaterialAssetLink>
  );
}

function AssetGroup({
  label,
  hint,
  assets,
  muted = false,
  reviewStudentId,
  returnTo,
}: {
  label?: string;
  hint?: string;
  assets: LibraryMaterialAssetDto[];
  muted?: boolean;
  reviewStudentId?: string | null;
  returnTo?: string | null;
}) {
  if (assets.length === 0) return null;
  return (
    <div className={styles.assetGroup}>
      {label ? (
        <div className={styles.groupHead}>
          <span className={muted ? styles.groupLabelMuted : styles.groupLabel}>{label}</span>
          {hint ? <span className={styles.groupHint}>{hint}</span> : null}
        </div>
      ) : null}
      <div className={styles.assets}>
        {assets.map((asset) => (
          <AssetChip
            key={asset.id}
            asset={asset}
            muted={muted}
            reviewStudentId={reviewStudentId}
            returnTo={returnTo}
          />
        ))}
      </div>
    </div>
  );
}

function MediaPickerRow({
  asset,
  shared,
  share,
  assets,
  onSharedLibraryAssetIdsChange,
  returnTo,
}: {
  asset: LibraryMaterialAssetDto;
  shared: boolean;
  share: LessonLibraryMediaShare;
  assets: LibraryMaterialAssetDto[];
  onSharedLibraryAssetIdsChange: (ids: string[]) => void;
  returnTo?: string | null;
}) {
  const name = materialAssetPrimaryName(asset);
  const secondary = materialAssetSecondaryHint(asset);
  const canPreview =
    (asset.deliveryKind === 'file' && asset.downloadPath) || Boolean(asset.url);

  return (
    <div className={styles.mediaPickerRow}>
      <Field
        as="checkbox"
        checked={shared}
        rootClassName={styles.mediaPickerMain}
        onChange={(event) => {
          const base = effectiveSharedLibraryAssetIds(assets, share);
          const next = event.target.checked
            ? [...base, asset.id]
            : base.filter((id) => id !== asset.id);
          onSharedLibraryAssetIdsChange([...new Set(next)]);
        }}
        label={
          <span className={styles.mediaPickerTextWrap}>
            <span className={styles.mediaPickerIcon}>
              <AssetIcon asset={asset} />
            </span>
            <span className={styles.mediaPickerText}>
              <span className={styles.mediaPickerName}>{name}</span>
              {secondary ? <span className={styles.mediaPickerHint}>{secondary}</span> : null}
            </span>
          </span>
        }
      />
      <span
        className={[
          styles.mediaPickerStatus,
          shared ? styles.mediaPickerStatusOn : styles.mediaPickerStatusOff,
        ].join(' ')}
      >
        {shared ? 'Shared' : 'Hidden'}
      </span>
      {canPreview ? (
        <MaterialAssetLink
          asset={asset}
          className={styles.mediaPickerPreviewBtn}
          title={`Preview ${name}`}
          returnTo={returnTo}
        >
          <Play size={14} aria-hidden />
          <span className={styles.mediaPickerPreviewLabel}>Play</span>
        </MaterialAssetLink>
      ) : null}
    </div>
  );
}

function OptionalMediaPicker({
  assets,
  share,
  onSharedLibraryAssetIdsChange,
  returnTo,
}: {
  assets: LibraryMaterialAssetDto[];
  share: LessonLibraryMediaShare;
  onSharedLibraryAssetIdsChange: (ids: string[]) => void;
  returnTo?: string | null;
}) {
  if (assets.length === 0) return null;

  const audioAssets = assets.filter((asset) => asset.role === 'audio');
  const videoAssets = assets.filter((asset) => asset.role === 'video');
  const effectiveSharedIds = effectiveSharedLibraryAssetIds(assets, share);
  const allAssetIds = assets.map((asset) => asset.id);
  const allSelected =
    allAssetIds.length > 0 && allAssetIds.every((id) => effectiveSharedIds.includes(id));

  const renderSection = (label: string, sectionAssets: LibraryMaterialAssetDto[]) => {
    if (sectionAssets.length === 0) return null;
    return (
      <div className={styles.mediaPickerSection}>
        <span className={styles.mediaSectionLabel}>{label}</span>
        <div className={styles.mediaPickerList}>
          {sectionAssets.map((asset) => (
            <MediaPickerRow
              key={asset.id}
              asset={asset}
              shared={effectiveSharedIds.includes(asset.id)}
              share={share}
              assets={assets}
              onSharedLibraryAssetIdsChange={onSharedLibraryAssetIdsChange}
              returnTo={returnTo}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.assetGroup}>
      <div className={styles.groupHead}>
        <div className={styles.groupHeadMain}>
          <span className={styles.groupLabel}>Audio & video for student</span>
          <span className={styles.groupHint}>Share with student · Play to preview</span>
        </div>
        <Button
          type="button"
          variant="ghost"
          className={styles.mediaPickerActionBtn}
          onClick={() => onSharedLibraryAssetIdsChange(allSelected ? [] : allAssetIds)}
        >
          {allSelected ? 'Clear all' : 'Share all'}
        </Button>
      </div>
      {renderSection('Audio', audioAssets)}
      {renderSection('Video', videoAssets)}
    </div>
  );
}

export function LessonLibraryMaterialPanel({
  material,
  audience = 'student',
  canManageLibrary = false,
  sharedLibraryAssetIds,
  libraryMediaSelectionApplied,
  onSharedLibraryAssetIdsChange,
  reviewStudentId,
  returnTo,
}: Props) {
  const share: LessonLibraryMediaShare = {
    sharedLibraryAssetIds,
    libraryMediaSelectionApplied,
  };
  const meta = libraryKindMeta(material.kind);
  const { Icon } = meta;
  const toneClass: Record<LibraryMaterialKindName, string> = {
    board: styles.toneBoard,
    presentation: styles.tonePresentation,
    book: styles.toneBook,
    other: styles.toneOther,
  };
  const coverHref = materialCoverImageHref(material);
  const { coreAssets, optionalMediaAssets, teacherAssets } = splitLibraryAssetsForLessonViewer(
    material.assets,
    audience,
    share,
  );
  const badgeVariant =
    material.kind === 'board'
      ? 'blue'
      : material.kind === 'presentation'
        ? 'amber'
        : material.kind === 'book'
          ? 'green'
          : 'neutral';

  const studentOptionalMedia =
    audience === 'student'
      ? optionalMediaAssets.filter((asset) => isAssetSharedWithStudent(asset, share))
      : optionalMediaAssets;

  return (
    <div className={[styles.panel, toneClass[material.kind]].filter(Boolean).join(' ')}>
      <div className={styles.head}>
        {coverHref ? (
          <div className={styles.coverWrap}>
                        <img src={coverHref} alt="" className={styles.coverImage} />
          </div>
        ) : (
          <div className={styles.iconWrap}>
            <Icon size={18} aria-hidden />
          </div>
        )}
        <div className={styles.headText}>
          <div className={styles.titleRow}>
            <strong className={styles.title}>{material.title}</strong>
            <Badge variant={badgeVariant} size="sm">
              {meta.label}
            </Badge>
          </div>
          {material.description ? (
            <p className={styles.description}>{material.description}</p>
          ) : null}
        </div>
        {canManageLibrary ? (
          <Link href="/materials" className={styles.libraryLink}>
            Library
          </Link>
        ) : null}
      </div>
      <AssetGroup assets={coreAssets} reviewStudentId={reviewStudentId} returnTo={returnTo} />
      {canManageLibrary && onSharedLibraryAssetIdsChange ? (
        <OptionalMediaPicker
          assets={optionalMediaAssets}
          share={share}
          onSharedLibraryAssetIdsChange={onSharedLibraryAssetIdsChange}
          returnTo={returnTo}
        />
      ) : (
        <AssetGroup label="Audio & video" assets={studentOptionalMedia} reviewStudentId={reviewStudentId} returnTo={returnTo} />
      )}
      <AssetGroup label="Teacher only" assets={teacherAssets} muted reviewStudentId={reviewStudentId} returnTo={returnTo} />
    </div>
  );
}
