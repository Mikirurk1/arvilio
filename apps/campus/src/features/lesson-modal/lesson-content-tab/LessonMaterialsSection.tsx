'use client';

import { FileText, FolderOpen, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Button, Field } from '../../../components/ui';
import { useCampusT } from '../../../lib/cms';
import type { LessonFormState, LessonMaterialItem } from '../types';
import type { LessonModalText, MaterialKind, MaterialKindOption } from '../tabTypes';
import { lessonMaterialKindOption } from '../lesson-material-kinds';
import { LessonLibraryMaterialPanel } from '../../materials/LessonLibraryMaterialPanel';
import { LibraryMaterialPicker } from '../../materials/LibraryMaterialPicker';
import { defaultLessonLibraryMediaShare } from '../../materials/lesson-library-assets';
import { libraryKindToLessonMaterialKind } from '../../materials/material-asset-presets';
import { movePendingLessonFiles } from '../../../lib/lesson-pending-files';
import { lessonFileDisplayName, lessonFilePreviewUrl } from '../../../lib/lesson-file-links';
import { openLessonAttachment } from '../fileUtils';
import { fileChipClasses, fileChipImagePreview } from './lesson-file-chip-utils';
import { USER_ROLE, type UserRoleId } from '@pkg/types';
import styles from '../LessonModal.module.scss';

type MaterialTypeLabels = Record<string, string>;

interface Props {
  form: LessonFormState;
  onChange: (next: LessonFormState) => void;
  role: UserRoleId;
  materialKinds: MaterialKindOption[];
  materialTypeLabels: MaterialTypeLabels;
  materialDraft: { kind: MaterialKind; text: string; files: string[] };
  setMaterialDraft: React.Dispatch<React.SetStateAction<{ kind: MaterialKind; text: string; files: string[] }>>;
  materialDraftPreviews: Array<string | null>;
  setMaterialDraftPreviews: React.Dispatch<React.SetStateAction<Array<string | null>>>;
  savedMaterialPreviews: Record<string, Array<string | null>>;
  setSavedMaterialPreviews: React.Dispatch<React.SetStateAction<Record<string, Array<string | null>>>>;
  materialsFileStatus: string | null;
  canSaveMaterial: boolean;
  canEditMaterials: boolean;
  materialsFileInputRef: React.RefObject<HTMLInputElement | null>;
  getFilePlaceholder: (fileName: string) => string;
  setImagePreviewUrl: (url: string | null) => void;
  onMaterialsFilesSelected: (files: FileList | null) => void;
  libraryAssetAudience: 'student' | 'staff';
  studentBackendId: string | null;
  pathname: string;
  text: LessonModalText;
}

export function LessonMaterialsSection({
  form, onChange, role, materialKinds, materialTypeLabels,
  materialDraft, setMaterialDraft, materialDraftPreviews, setMaterialDraftPreviews,
  savedMaterialPreviews, setSavedMaterialPreviews,
  materialsFileStatus, canSaveMaterial, canEditMaterials, materialsFileInputRef,
  getFilePlaceholder, setImagePreviewUrl, onMaterialsFilesSelected,
  libraryAssetAudience, studentBackendId, pathname, text,
}: Props) {
  const t = useCampusT();
  const [libraryPickerOpen, setLibraryPickerOpen] = useState(false);

  const handleSaveDraft = () => {
    if (!canSaveMaterial) return;
    const newMaterialId = `mat-${Date.now()}`;
    movePendingLessonFiles('material', 'draft', 'material', newMaterialId, materialDraft.files);
    onChange({
      ...form,
      materials: [
        ...form.materials,
        { id: newMaterialId, kind: materialDraft.kind, text: materialDraft.text.trim(), files: materialDraft.files },
      ],
    });
    setSavedMaterialPreviews((prev) => ({ ...prev, [newMaterialId]: materialDraftPreviews }));
    setMaterialDraft({ kind: materialDraft.kind, text: '', files: [] });
    setMaterialDraftPreviews([]);
  };

  return (
    <div className={`${styles.fieldGroup} ${styles.fieldGroupFull} ${styles.modalSectionCard} ${styles.materialsCard}`}>
      <div className={styles.materialsHeader}>
        <div className={styles.sectionHeaderStack}>
          <label className={styles.fieldLabel}>{text.fields.materials}</label>
          <p className={styles.sectionHint}>{t('lessonModal.hint.materials')}</p>
        </div>
        {role !== USER_ROLE.student.id ? <div className={styles.materialsHint}>{text.materialsHint}</div> : null}
      </div>
      {canEditMaterials ? (
        <>
          <div className={styles.materialTypeRow}>
            {materialKinds.map((kind) => {
              const Icon = kind.icon;
              const isActive = materialDraft.kind === kind.value;
              const label = materialTypeLabels[kind.value] ?? kind.label;
              return (
                <Button
                  key={kind.value}
                  type="button"
                  className={`${styles.materialTypeBtn} ${isActive ? styles.materialTypeBtnActive : ''}`}
                  disabled={!canEditMaterials}
                  onClick={() => setMaterialDraft((prev) => ({ ...prev, kind: kind.value }))}
                >
                  <Icon size={14} />
                  <span>{label}</span>
                </Button>
              );
            })}
          </div>
          <div className={styles.materialEditorCard}>
            <Field as="textarea" className={styles.fieldInput} rows={3} placeholder={text.placeholders.addText} value={materialDraft.text} readOnly={!canEditMaterials} onChange={(e) => setMaterialDraft((prev) => ({ ...prev, text: e.target.value }))} />
            <Field type="file" multiple ref={materialsFileInputRef} style={{ display: 'none' }} disabled={!canEditMaterials} onChange={(e) => { onMaterialsFilesSelected(e.target.files); e.currentTarget.value = ''; }} />
            {materialsFileStatus ? <div className={styles.materialsFileStatus}>{materialsFileStatus}</div> : null}
            {materialDraft.files.length > 0 ? (
              <div className={styles.fileGrid}>
                {materialDraft.files.map((fileName, fileIndex) => {
                  const preview = materialDraftPreviews[fileIndex];
                  return (
                    <div key={`draft-${fileName}-${fileIndex}`} className={fileChipClasses(preview, fileName)} role={preview ? 'button' : undefined} tabIndex={preview ? 0 : -1}
                      onClick={() => openLessonAttachment(fileName, preview, setImagePreviewUrl)}
                      onKeyDown={(event) => { if (event.key !== 'Enter' && event.key !== ' ') return; openLessonAttachment(fileName, preview, setImagePreviewUrl); }}>
                      {fileChipImagePreview(preview, fileName)}
                      <Button type="button" className={styles.fileChipRemove} aria-label={text.aria.removeFile}
                        onClick={(event) => { event.stopPropagation(); setMaterialDraft((prev) => ({ ...prev, files: prev.files.filter((_, idx) => idx !== fileIndex) })); setMaterialDraftPreviews((prev) => prev.filter((_, idx) => idx !== fileIndex)); }}>
                        <X size={12} />
                      </Button>
                      <span>{fileName}</span>
                      {!preview ? <em className={styles.fileChipType}>{getFilePlaceholder(fileName)}</em> : null}
                    </div>
                  );
                })}
              </div>
            ) : null}
            <div className={styles.materialActionsRow}>
              <Button type="button" className={styles.fileButton} disabled={!canEditMaterials} onClick={() => materialsFileInputRef.current?.click()}>
                <Plus size={14} /><span>{text.actions.addFile}</span>
              </Button>
              <Button type="button" className={styles.fileButton} disabled={!canEditMaterials} onClick={() => setLibraryPickerOpen(true)}>
                <FolderOpen size={14} /><span>{t('lessonModal.action.addFromLibrary')}</span>
              </Button>
              <Button type="button" className={styles.saveMaterialBtn} disabled={!canEditMaterials || !canSaveMaterial} onClick={handleSaveDraft}>
                <span>{text.actions.saveMaterial}</span>
              </Button>
            </div>
          </div>
        </>
      ) : null}
      {form.materials.length === 0 ? (
        <div className={styles.materialsEmpty}>{text.noMaterials}</div>
      ) : (
        <div className={styles.savedMaterialsList}>
          {form.materials.map((material) => {
            const kindMeta = lessonMaterialKindOption(material.kind, materialTypeLabels);
            const KindIcon = kindMeta?.icon ?? FileText;
            return (
              <div key={material.id} className={[styles.savedMaterialItem, material.libraryMaterial ? styles.savedMaterialItemLibrary : ''].filter(Boolean).join(' ')}>
                {!material.libraryMaterial ? (
                  <div className={styles.savedMaterialMeta}>
                    <KindIcon size={14} />
                    <strong>{kindMeta?.label ?? text.fallbackMaterialLabel}</strong>
                  </div>
                ) : null}
                {canEditMaterials ? (
                  <Button type="button" aria-label={text.aria.removeMaterial} className={styles.materialRemoveBtn}
                    onClick={() => { onChange({ ...form, materials: form.materials.filter((item) => item.id !== material.id) }); setSavedMaterialPreviews((prev) => { const next = { ...prev }; delete next[material.id]; return next; }); }}>
                    <X size={14} />
                  </Button>
                ) : null}
                {material.text && !material.libraryMaterial ? <div className={styles.savedMaterialText}>{material.text}</div> : null}
                {material.libraryMaterial ? (
                  <LessonLibraryMaterialPanel
                    material={material.libraryMaterial}
                    audience={libraryAssetAudience}
                    canManageLibrary={canEditMaterials}
                    sharedLibraryAssetIds={material.sharedLibraryAssetIds}
                    libraryMediaSelectionApplied={material.libraryMediaSelectionApplied}
                    reviewStudentId={libraryAssetAudience === 'staff' ? studentBackendId : null}
                    returnTo={pathname}
                    onSharedLibraryAssetIdsChange={canEditMaterials ? (ids) => onChange({ ...form, materials: form.materials.map((row) => row.id === material.id ? { ...row, sharedLibraryAssetIds: ids, libraryMediaSelectionApplied: true } : row) }) : undefined}
                  />
                ) : null}
                {!material.libraryMaterial && material.files.length > 0 ? (
                  <div className={styles.fileGrid}>
                    {material.files.map((fileRef, fileIndex) => {
                      const displayName = lessonFileDisplayName(fileRef, material.fileLinks, fileIndex);
                      const preview = savedMaterialPreviews[material.id]?.[fileIndex] ?? lessonFilePreviewUrl(fileRef, material.fileLinks, fileIndex);
                      return (
                        <div key={`${material.id}-${fileRef}-${fileIndex}`} className={fileChipClasses(preview, displayName)} role={preview ? 'button' : undefined} tabIndex={preview ? 0 : -1}
                          onClick={() => openLessonAttachment(displayName, preview, setImagePreviewUrl)}
                          onKeyDown={(event) => { if (event.key !== 'Enter' && event.key !== ' ') return; openLessonAttachment(displayName, preview, setImagePreviewUrl); }}>
                          {fileChipImagePreview(preview, displayName)}
                          <span>{displayName}</span>
                          {!preview ? <em className={styles.fileChipType}>{getFilePlaceholder(displayName)}</em> : null}
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
      <LibraryMaterialPicker
        open={libraryPickerOpen}
        onClose={() => setLibraryPickerOpen(false)}
        excludeIds={form.materials.map((item) => item.libraryMaterialId).filter((value): value is string => Boolean(value))}
        onConfirm={(items) => {
          onChange({
            ...form,
            materials: [
              ...form.materials,
              ...items.map((item) => {
                const share = defaultLessonLibraryMediaShare(item.assets);
                return {
                  id: `mat-lib-${item.id}-${Date.now()}`,
                  kind: libraryKindToLessonMaterialKind(item.kind),
                  text: item.title,
                  files: [] as string[],
                  libraryMaterialId: item.id,
                  libraryMaterial: item,
                  sharedLibraryAssetIds: share.sharedLibraryAssetIds ?? undefined,
                  libraryMediaSelectionApplied: share.libraryMediaSelectionApplied ?? undefined,
                } satisfies LessonMaterialItem;
              }),
            ],
          });
          setLibraryPickerOpen(false);
        }}
      />
    </div>
  );
}
