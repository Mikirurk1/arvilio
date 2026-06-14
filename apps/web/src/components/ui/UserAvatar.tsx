'use client';

import { useState } from 'react';
import { getAvatarFallbackInitials } from '../../lib/avatar';
import styles from './UserAvatar.module.scss';

export type UserAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type UserAvatarProps = {
  /** Image URL — shows <img> if present and loaded successfully. */
  src?: string | null;
  /** Full name used to derive 2-letter initials (e.g. "Jane Doe" → "JD"). */
  name?: string;
  /** Email used as secondary initials source when name is absent. */
  email?: string;
  size?: UserAvatarSize;
  /** Hex color for the fallback initials background (e.g. from user.displayColor). */
  color?: string | null;
  className?: string;
  'aria-label'?: string;
};

const SIZE_PX: Record<UserAvatarSize, number> = {
  xs: 28,
  sm: 36,
  md: 44,
  lg: 60,
  xl: 88,
};

function emailInitials(email: string): string {
  const local = email.split('@')[0] ?? '';
  const parts = local.split(/[._\-+]/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0]!}${parts[1]![0]!}`.toUpperCase();
  }
  return local.slice(0, 2).toUpperCase() || '?';
}

function resolveInitials(name?: string, email?: string): string {
  if (name?.trim()) return getAvatarFallbackInitials(name);
  if (email?.trim()) return emailInitials(email);
  return '?';
}

export function UserAvatar({
  src,
  name,
  email,
  size = 'md',
  color,
  className,
  'aria-label': ariaLabel,
}: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);

  const showImage = Boolean(src) && !imgError;
  const initials = resolveInitials(name, email);
  const px = SIZE_PX[size];

  const colorStyle =
    color && !showImage
      ? {
          background: `linear-gradient(140deg, ${color}, color-mix(in srgb, ${color} 68%, #000))`,
        }
      : undefined;

  return (
    <span
      className={[styles.root, styles[size], className].filter(Boolean).join(' ')}
      style={colorStyle}
      role="img"
      aria-label={ariaLabel ?? name ?? email ?? 'Avatar'}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src!}
          alt=""
          width={px}
          height={px}
          className={styles.img}
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        <span className={styles.initials} aria-hidden>
          {initials}
        </span>
      )}
    </span>
  );
}
