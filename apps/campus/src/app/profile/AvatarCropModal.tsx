'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState, type ChangeEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { UserRound, X } from 'lucide-react';
import { Button } from '../../components/ui';
import { useCampusT } from '../../lib/cms';
import { getAvatarFallbackInitials } from '../../lib/avatar';
import styles from './page.module.scss';

const MIN_CROP_SIZE = 80;
const OUTPUT_AVATAR_SIZE = 512;
const OUTPUT_AVATAR_QUALITY = 0.82;

type CropRect = { x: number; y: number; size: number };

interface AvatarCropModalProps {
  open: boolean;
  avatarUrl: string;
  userName: string;
  onClose: () => void;
  onCropApply: (dataUrl: string) => Promise<void>;
  onRemove: () => void;
}

export function AvatarCropModal({ open, avatarUrl, userName, onClose, onCropApply, onRemove }: AvatarCropModalProps) {
  const t = useCampusT();
  const [cropSource, setCropSource] = useState<string | null>(null);
  const [cropRect, setCropRect] = useState<CropRect>({ x: 40, y: 40, size: 180 });
  const [dragMode, setDragMode] = useState<'move' | 'resize' | null>(null);
  const [isProcessingAvatar, setIsProcessingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const cropImageRef = useRef<HTMLImageElement>(null);
  const dragStartRef = useRef<{ pointerX: number; pointerY: number; rect: CropRect } | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const clampCropRect = useCallback((next: CropRect): CropRect => {
    const image = cropImageRef.current;
    if (!image) return next;
    const maxSize = Math.max(MIN_CROP_SIZE, Math.min(image.clientWidth, image.clientHeight));
    const size = Math.max(MIN_CROP_SIZE, Math.min(next.size, maxSize));
    return {
      x: Math.max(0, Math.min(next.x, image.clientWidth - size)),
      y: Math.max(0, Math.min(next.y, image.clientHeight - size)),
      size,
    };
  }, []);

  useEffect(() => {
    if (!cropSource) return;
    const image = cropImageRef.current;
    if (!image) return;
    const updateFromImageSize = () => {
      const { clientWidth: width, clientHeight: height } = image;
      if (!width || !height) return;
      const size = Math.max(MIN_CROP_SIZE, Math.floor(Math.min(width, height) * 0.62));
      setCropRect({ x: Math.max(0, Math.round((width - size) / 2)), y: Math.max(0, Math.round((height - size) / 2)), size });
    };
    if (image.complete) updateFromImageSize();
    image.addEventListener('load', updateFromImageSize);
    return () => image.removeEventListener('load', updateFromImageSize);
  }, [cropSource]);

  useEffect(() => {
    if (!dragMode) return;
    const handlePointerMove = (event: PointerEvent) => {
      const start = dragStartRef.current;
      if (!start) return;
      const dx = event.clientX - start.pointerX;
      const dy = event.clientY - start.pointerY;
      if (dragMode === 'move') {
        setCropRect(clampCropRect({ ...start.rect, x: start.rect.x + dx, y: start.rect.y + dy }));
      } else {
        setCropRect(clampCropRect({ ...start.rect, size: start.rect.size + Math.max(dx, dy) }));
      }
    };
    const stopDrag = () => { setDragMode(null); dragStartRef.current = null; };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', stopDrag);
    return () => { window.removeEventListener('pointermove', handlePointerMove); window.removeEventListener('pointerup', stopDrag); };
  }, [clampCropRect, dragMode]);

  const startDrag = useCallback((mode: 'move' | 'resize', event: ReactPointerEvent) => {
    event.preventDefault();
    dragStartRef.current = { pointerX: event.clientX, pointerY: event.clientY, rect: cropRect };
    setDragMode(mode);
  }, [cropRect]);

  const handleAvatarFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) { event.target.value = ''; return; }
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === 'string') setCropSource(reader.result); };
    reader.readAsDataURL(file);
    event.target.value = '';
  }, []);

  const applyAvatarCrop = useCallback(async () => {
    const image = cropImageRef.current;
    if (!image || !cropSource) return;
    const scaleX = image.naturalWidth / image.clientWidth;
    const scaleY = image.naturalHeight / image.clientHeight;
    const sSize = cropRect.size * Math.min(scaleX, scaleY);
    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_AVATAR_SIZE;
    canvas.height = OUTPUT_AVATAR_SIZE;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.drawImage(image, cropRect.x * scaleX, cropRect.y * scaleY, sSize, sSize, 0, 0, OUTPUT_AVATAR_SIZE, OUTPUT_AVATAR_SIZE);
    setIsProcessingAvatar(true);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', OUTPUT_AVATAR_QUALITY));
    setIsProcessingAvatar(false);
    if (!blob) return;
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => { if (typeof reader.result === 'string') resolve(reader.result); else reject(new Error('Avatar conversion failed')); };
      reader.onerror = () => reject(new Error('Avatar conversion failed'));
      reader.readAsDataURL(blob);
    });
    setCropSource(null);
    await onCropApply(dataUrl);
  }, [cropRect, cropSource, onCropApply]);

  if (!open) return null;

  return (
    <div className={styles.avatarModalBackdrop} onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="avatar-modal-title" className={styles.avatarModal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.avatarModalHead}>
          <div className={styles.avatarModalHeadText}>
            <span className={styles.avatarModalBadge}><UserRound size={14} />{t('profile.avatar.badge')}</span>
            <div id="avatar-modal-title" className={styles.avatarModalTitle}>{t('profile.avatar.title')}</div>
            <div className={styles.avatarModalText}>{t('profile.avatar.hint')}</div>
          </div>
          <Button type="button" variant="ghost" className={styles.avatarModalClose} aria-label={t('profile.avatar.closeAria')} onClick={onClose}>
            <X size={16} />
          </Button>
        </div>
        <div className={styles.avatarModalPreview}>
          {avatarUrl ? (
            <Image src={avatarUrl} alt="" width={112} height={112} className={styles.avatarModalPreviewImage} unoptimized />
          ) : (
            <span>{getAvatarFallbackInitials(userName)}</span>
          )}
        </div>
        <input ref={avatarInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className={styles.avatarFileInput} onChange={handleAvatarFileChange} />
        {cropSource ? (
          <div className={styles.cropWorkspace} aria-label={t('profile.avatar.cropAria')}>
            <Image ref={cropImageRef} src={cropSource} alt="" width={360} height={360} className={styles.cropImage} unoptimized />
            <div className={styles.cropRect} style={{ width: `${cropRect.size}px`, height: `${cropRect.size}px`, transform: `translate(${cropRect.x}px, ${cropRect.y}px)` }} onPointerDown={(event) => startDrag('move', event)}>
              <span className={styles.cropRectHint}>{t('profile.avatar.drag')}</span>
              <Button variant="bare" type="button" className={styles.cropResizeHandle} onPointerDown={(event) => startDrag('resize', event)} aria-label={t('profile.avatar.resizeAria')} />
            </div>
          </div>
        ) : null}
        <div className={styles.avatarModalActions}>
          <Button type="button" variant="primary" onClick={() => avatarInputRef.current?.click()}>{t('profile.avatar.choose')}</Button>
          {cropSource ? (
            <Button type="button" variant="primary" disabled={isProcessingAvatar} loading={isProcessingAvatar} loadingLabel={t('profile.avatar.processing')} onClick={() => void applyAvatarCrop()}>{t('profile.avatar.apply')}</Button>
          ) : null}
          {avatarUrl ? (
            <Button type="button" variant="default" onClick={onRemove}>{t('profile.avatar.remove')}</Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
