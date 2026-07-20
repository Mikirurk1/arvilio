'use client';

import type { LibraryMaterialAssetDto } from '@pkg/types';
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
};

export function MaterialAssetOpenLink({ asset, className, title, children }: Props) {
  const href = materialAssetHref(asset);

  if (!href) {
    return (
      <span className={className} title={title}>
        {children}
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      title={title}
    >
      {children}
    </a>
  );
}
