'use client';

import { ExternalLink, FileUp, FolderOpen, Layers, Link2, Plus, Trash2, Upload, X } from 'lucide-react';
import Link from 'next/link';
import { Button, Field } from '../../components/ui';
import { useCampusT } from '../../lib/cms';
import uiStyles from '../../components/ui/ui.module.scss';
import {
  formatMaterialMaxFileSize,
  isMaterialFileWithinSizeLimit,
  materialFileTooLargeMessage,
} from '../../lib/material-upload-limits';
import { libraryMaterialFileHref, libraryMaterialPreviewHref } from '../../lib/material-upload';
import { openMediaViewer } from '../../stores/media-viewer-store';
import { materialViewerHref } from './material-viewer-url';
import {
  MATERIAL_COMPRESS_LEVEL_OPTIONS,
  type MaterialCompressLevel,
} from '../../lib/material-compress-level';
import {
  isMultiFileAssetRole,
  isUrlOnlyAssetRole,
  newAssetDraft,
  newAssetFileEntry,
  normalizeAssetDraftForRole,
  roleAllowsFileUpload,
  type MaterialAssetDraft,
} from './material-asset-presets';
import { fileRejectionMessage, isFileAllowedForMaterialAssetRole, materialAssetFilePolicy } from './material-asset-file-policy';
import styles from './MaterialFormModal.module.scss';

const fieldClass = uiStyles.fieldControl;

interface RoleOption { value: string; label: string; }

interface MaterialAssetsSectionProps {
  kind: string;
  assets: MaterialAssetDraft[];
  compressLevel: MaterialCompressLevel;
  compressLevelHint: string | undefined;
  isBusy: boolean;
  roleOptions: RoleOption[];
  setAssets: React.Dispatch<React.SetStateAction<MaterialAssetDraft[]>>;
  setCompressLevel: (v: MaterialCompressLevel) => void;
  setLocalError: (v: string | null) => void;
  updateAsset: (index: number, patch: Partial<MaterialAssetDraft>) => void;
}

export function MaterialAssetsSection({
  kind, assets, compressLevel, compressLevelHint, isBusy, roleOptions,
  setAssets, setCompressLevel, setLocalError, updateAsset,
}: MaterialAssetsSectionProps) {
  const t = useCampusT();
  return (
    <section className={styles.assetsSection} aria-labelledby="material-assets-heading">
      <div className={styles.assetsHead}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionIcon} aria-hidden>
            <FolderOpen size={16} />
          </span>
          <div className={styles.sectionHeadText}>
            <h3 id="material-assets-heading" className={styles.sectionTitle}>
              {t('materials.form.assetsTitle')}
            </h3>
            <p className={styles.sectionHint}>
              {kind === 'book'
                ? 'Student book, teacher book, workbook, audio — add as many as you need.'
                : 'Paste an external link or upload a file.'}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="dashed"
          onClick={() => setAssets((prev) => [...prev, newAssetDraft()])}
          disabled={isBusy}
        >
          <Plus size={14} aria-hidden />
          Add asset
        </Button>
      </div>

      <div className={styles.compressLevelRow}>
        <Field
          className={fieldClass}
          label="File compression"
          as="select"
          value={compressLevel}
          disabled={isBusy}
          onChange={(event) => setCompressLevel(event.target.value as MaterialCompressLevel)}
        >
          {MATERIAL_COMPRESS_LEVEL_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Field>
        {compressLevelHint ? (
          <p className={styles.deliveryHint}>{compressLevelHint}</p>
        ) : null}
      </div>

      <div className={styles.assetRows}>
        {assets.map((asset, index) => {
          const filePolicy = materialAssetFilePolicy(asset.role);
          const urlOnly = isUrlOnlyAssetRole(asset.role);
          const multiFile = isMultiFileAssetRole(asset.role);
          const fileEntries = multiFile
            ? (asset.files ?? [])
            : asset.fileName || asset.pendingFile || asset.fileAttachmentId
              ? [{
                  clientKey: 'single',
                  fileName: asset.fileName,
                  pendingFile: asset.pendingFile,
                  fileAttachmentId: asset.fileAttachmentId,
                  downloadPath: asset.downloadPath,
                  previewDownloadPath: asset.previewDownloadPath,
                }]
              : [];

          const appendSelectedFiles = (files: FileList | null) => {
            if (!files?.length) return;
            const accepted: File[] = [];
            const rejected: string[] = [];
            Array.from(files).forEach((file) => {
              if (!isMaterialFileWithinSizeLimit(file.size)) {
                rejected.push(file.name);
                return;
              }
              if (isFileAllowedForMaterialAssetRole(file, asset.role)) {
                accepted.push(file);
              } else {
                rejected.push(file.name);
              }
            });
            if (rejected.length > 0) {
              const first = rejected[0]!;
              const probe = Array.from(files).find((file) => file.name === first);
              if (probe && !isMaterialFileWithinSizeLimit(probe.size)) {
                setLocalError(materialFileTooLargeMessage(probe.name));
              } else {
                setLocalError(fileRejectionMessage(asset.role, first));
              }
            } else {
              setLocalError(null);
            }
            if (accepted.length === 0) return;
            if (multiFile) {
              updateAsset(index, {
                deliveryKind: 'file',
                files: [
                  ...(asset.files ?? []),
                  ...accepted.map((file) => newAssetFileEntry({ pendingFile: file, fileName: file.name })),
                ],
              });
              return;
            }
            const file = accepted[0]!;
            updateAsset(index, { deliveryKind: 'file', pendingFile: file, fileName: file.name });
          };

          const removeFileEntry = (clientKey: string) => {
            if (multiFile) {
              updateAsset(index, { files: (asset.files ?? []).filter((entry) => entry.clientKey !== clientKey) });
              return;
            }
            updateAsset(index, { pendingFile: null, fileName: null, fileAttachmentId: null });
          };

          return (
            <div key={asset.key} className={styles.assetRow}>
              <div className={styles.assetRowBar}>
                <span className={styles.assetBadge}>
                  <Layers size={12} aria-hidden />
                  Asset {index + 1}
                </span>
                <Button
                  type="button"
                  variant="danger"
                  className={styles.removeAsset}
                  onClick={() => setAssets((prev) => prev.filter((_, rowIndex) => rowIndex !== index))}
                  disabled={isBusy || assets.length <= 1}
                  aria-label="Remove asset"
                >
                  <Trash2 size={14} aria-hidden />
                </Button>
              </div>

              <div className={styles.assetFields}>
                <Field
                  className={fieldClass}
                  label="Role"
                  as="select"
                  value={asset.role}
                  onChange={(event) => {
                    const role = event.target.value as MaterialAssetDraft['role'];
                    updateAsset(index, {
                      ...normalizeAssetDraftForRole(asset, role, (file) =>
                        isFileAllowedForMaterialAssetRole(file, role),
                      ),
                    });
                  }}
                  disabled={isBusy}
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Field>

                {!urlOnly ? (
                  <Field
                    className={fieldClass}
                    label="Delivery"
                    as="select"
                    value={asset.deliveryKind}
                    onChange={(event) => {
                      const deliveryKind = event.target.value as 'url' | 'file';
                      updateAsset(index, {
                        deliveryKind,
                        pendingFile: null,
                        fileName: null,
                        fileAttachmentId: null,
                        url: deliveryKind === 'url' ? asset.url : '',
                        files: multiFile && deliveryKind === 'file' ? (asset.files ?? []) : undefined,
                      });
                    }}
                    disabled={isBusy}
                  >
                    <option value="url">URL link</option>
                    {roleAllowsFileUpload(asset.role) ? (
                      <option value="file">File upload</option>
                    ) : null}
                  </Field>
                ) : (
                  <div className={styles.urlOnlyHint}>
                    <span className={styles.cellLabel}>
                      <Link2 size={13} aria-hidden />
                      Delivery
                    </span>
                    <p className={styles.deliveryHint}>URL only for Link assets</p>
                  </div>
                )}

                {urlOnly || asset.deliveryKind === 'url' ? (
                  <div>
                    <Field
                      className={fieldClass}
                      label="URL"
                      value={asset.url}
                      onChange={(event) => updateAsset(index, { url: event.target.value })}
                      placeholder="https://…"
                      disabled={isBusy}
                    />
                    <p className={styles.deliveryHint}>
                      <Link2 size={12} aria-hidden />
                      Opens in a new tab when attached to a lesson
                    </p>
                  </div>
                ) : (
                  <div className={styles.fileCell}>
                    <span className={styles.cellLabel}>
                      <Upload size={13} aria-hidden />
                      {multiFile ? 'Files' : 'File'}
                    </span>
                    <Field
                      as="file-button"
                      className={styles.fileButton}
                      buttonLabel={
                        multiFile
                          ? fileEntries.length > 0 ? 'Add more files' : 'Choose files'
                          : asset.fileName ? 'Replace file' : 'Choose file'
                      }
                      accept={filePolicy.accept}
                      multiple={filePolicy.allowMultiple}
                      disabled={isBusy}
                      onFilesSelected={appendSelectedFiles}
                    />
                    <p className={styles.deliveryHint}>
                      <Upload size={12} aria-hidden />
                      {filePolicy.hint}. Max {formatMaterialMaxFileSize()} per file.
                    </p>
                    {fileEntries.length > 0 ? (
                      <div className={styles.fileList}>
                        {fileEntries.map((entry) => {
                          const previewHref = entry.previewDownloadPath
                            ? libraryMaterialPreviewHref(entry.previewDownloadPath)
                            : null;
                          const isBook = ['student_book', 'teacher_book', 'workbook'].includes(asset.role);
                          const isMedia = ['audio', 'video'].includes(asset.role);
                          const internalId = entry.fileAttachmentId;
                          const externalHref = entry.downloadPath
                            ? libraryMaterialFileHref(entry.downloadPath)
                            : internalId
                              ? libraryMaterialFileHref(`/materials/files/${internalId}`)
                              : null;
                          return (
                            <div key={entry.clientKey} className={styles.fileChip}>
                              {previewHref ? (
                                <img src={previewHref} alt="" className={styles.fileChipPreview} />
                              ) : (
                                <FileUp size={14} className={styles.fileChipIcon} aria-hidden />
                              )}
                              <span className={styles.fileChipName}>{entry.fileName ?? 'File'}</span>
                              {internalId && isBook ? (
                                <Link
                                  href={materialViewerHref({ fileAttachmentId: internalId })}
                                  className={styles.fileChipOpen}
                                  aria-label={`Open ${entry.fileName ?? 'file'}`}
                                >
                                  <ExternalLink size={12} aria-hidden />
                                </Link>
                              ) : internalId && isMedia ? (
                                <Button
                                  variant="bare"
                                  type="button"
                                  className={styles.fileChipOpen}
                                  aria-label={`Open ${entry.fileName ?? 'file'}`}
                                  onClick={() => openMediaViewer(internalId)}
                                >
                                  <ExternalLink size={12} aria-hidden />
                                </Button>
                              ) : externalHref ? (
                                <Link
                                  href={externalHref}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.fileChipOpen}
                                  aria-label={`Open ${entry.fileName ?? 'file'}`}
                                >
                                  <ExternalLink size={12} aria-hidden />
                                </Link>
                              ) : null}
                              <Button
                                type="button"
                                variant="ghost"
                                className={styles.fileChipRemove}
                                aria-label="Remove file"
                                disabled={isBusy}
                                onClick={() => removeFileEntry(entry.clientKey)}
                              >
                                <X size={12} aria-hidden />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                )}

                <Field
                  className={fieldClass}
                  label="Label (optional)"
                  value={asset.label}
                  onChange={(event) => updateAsset(index, { label: event.target.value })}
                  disabled={isBusy}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
