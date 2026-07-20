'use client';

import type { LibraryMaterialAssetDto } from '@pkg/types';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { libraryMaterialFileHref } from '../../lib/material-upload';

export function materialAssetHref(
  asset: Pick<LibraryMaterialAssetDto, 'deliveryKind' | 'url' | 'downloadPath'>,
): string | null {
  if (asset.deliveryKind === 'url' && asset.url) return asset.url;
  if (asset.deliveryKind === 'file' && asset.downloadPath) {
    return libraryMaterialFileHref(asset.downloadPath);
  }
  return null;
}

type Props = {
  asset: Pick<LibraryMaterialAssetDto, 'deliveryKind' | 'url' | 'downloadPath'>;
  className?: string;
  title?: string;
  children: ReactNode;
  'data-tour-anchor'?: string;
};

export function MaterialAssetOpenLink({
  asset,
  className,
  title,
  children,
  'data-tour-anchor': tourAnchor,
}: Props) {
  const href = materialAssetHref(asset);

  if (!href) {
    return (
      <span className={className} title={title} data-tour-anchor={tourAnchor}>
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      title={title}
      data-tour-anchor={tourAnchor}
    >
      {children}
    </Link>
  );
}
