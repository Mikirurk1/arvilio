import Link from 'next/link';
import type { ReactNode } from 'react';
import { LogoMarkSvg } from './LogoMarkSvg';
import styles from './BrandLogo.module.scss';

export type BrandLogoVariant = 'full' | 'mark';
export type BrandLogoSize = 'sm' | 'md' | 'lg';

export type BrandLogoProps = {
  variant?: BrandLogoVariant;
  size?: BrandLogoSize;
  /** Hide wordmark when sidebar is collapsed or on tablet (header). */
  hideTextOnCollapse?: boolean;
  /** Show product tag under the name. */
  showTag?: boolean;
  /** Navigate on click; set `null` for static brand (e.g. decorative). */
  href?: string | null;
  className?: string;
};

export function BrandLogo({
  variant = 'full',
  size = 'md',
  hideTextOnCollapse = false,
  showTag = true,
  href = '/dashboard',
  className,
}: BrandLogoProps) {
  const rootClass = [
    styles.root,
    styles[size],
    hideTextOnCollapse ? styles.hideTextOnCollapse : '',
    variant === 'mark' ? styles.markOnly : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const inner: ReactNode = (
    <>
      <div className={styles.mark}>
        <LogoMarkSvg className={styles.icon} accentClassName={styles.iconAccent} />
      </div>
      {variant === 'full' ? (
        <div className={styles.text}>
          <div className={styles.name}>Arvilio</div>
          {showTag ? <div className={styles.tag}>Campus</div> : null}
        </div>
      ) : null}
    </>
  );

  if (href === null) {
    return (
      <div className={rootClass} aria-label="Arvilio">
        {inner}
      </div>
    );
  }

  return (
    <Link href={href} className={rootClass} aria-label="Arvilio — go to dashboard">
      {inner}
    </Link>
  );
}
