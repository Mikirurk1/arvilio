'use client';

import type { LibraryMaterialAssetDto } from '@pkg/types';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Button } from '../../components/ui';
import { openMediaViewer } from '../../stores/media-viewer-store';
import { isAnnotatableBookAsset, isStudentFacingBookAsset } from './book-viewer-eligibility';
import { isInAppMediaAsset } from './media-viewer-eligibility';
import { materialViewerHref } from './material-viewer-url';
import { MaterialAssetOpenLink } from './MaterialAssetOpenLink';
import styles from './MaterialAssetLink.module.scss';

type Props = {
  asset: Pick<
    LibraryMaterialAssetDto,
    'role' | 'deliveryKind' | 'fileAttachmentId' | 'downloadPath' | 'url'
  >;
  className?: string;
  title?: string;
  children: ReactNode;
  /** When staff reviews a student's book annotations from a lesson. */
  reviewStudentId?: string | null;
  returnTo?: string | null;
};

export function MaterialAssetLink({
  asset,
  className,
  title,
  children,
  reviewStudentId,
  returnTo,
}: Props) {
  if (isAnnotatableBookAsset(asset) && asset.fileAttachmentId) {
    const subjectUserId =
      reviewStudentId && isStudentFacingBookAsset(asset) ? reviewStudentId : null;
    const href = materialViewerHref({
      fileAttachmentId: asset.fileAttachmentId,
      subjectUserId,
      returnTo,
    });
    return (
      <Link href={href} className={className} title={title} data-tour-anchor="materials-viewer">
        {children}
      </Link>
    );
  }

  if (isInAppMediaAsset(asset) && asset.fileAttachmentId) {
    return (
      <Button
        variant="bare"
        type="button"
        className={[styles.mediaOpenBtn, className].filter(Boolean).join(' ')}
        title={title}
        aria-label={title}
        data-tour-anchor="materials-viewer"
        onClick={() => openMediaViewer(asset.fileAttachmentId!)}
      >
        {children}
      </Button>
    );
  }

  return (
    <MaterialAssetOpenLink
      asset={asset}
      className={className}
      title={title}
      data-tour-anchor="materials-viewer"
    >
      {children}
    </MaterialAssetOpenLink>
  );
}
