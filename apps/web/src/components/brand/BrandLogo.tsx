import styles from './BrandLogo.module.scss';

function LogoMarkIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden className={styles.icon}>
      <path
        d="M3.75 5.25 9 4.25l5.25 1v7.75L9 12 3.75 13.25V5.25Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path d="M9 4.25v7.75" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M6.75 7.25h4.5M6.75 9.25h3.25"
        className={styles.iconAccent}
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

export type BrandLogoVariant = 'full' | 'mark';
export type BrandLogoSize = 'sm' | 'md' | 'lg';

export type BrandLogoProps = {
  variant?: BrandLogoVariant;
  size?: BrandLogoSize;
  /** Hide wordmark when sidebar is collapsed or on tablet/mobile breakpoints. */
  hideTextOnCollapse?: boolean;
  className?: string;
};

export function BrandLogo({
  variant = 'full',
  size = 'md',
  hideTextOnCollapse = false,
  className,
}: BrandLogoProps) {
  const rootClass = [
    styles.root,
    styles[size],
    hideTextOnCollapse ? styles.hideTextOnCollapse : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass} aria-label="SoEnglish">
      <div className={styles.mark}>
        <LogoMarkIcon />
      </div>
      {variant === 'full' ? (
        <div className={styles.text}>
          <div className={styles.name}>SoEnglish</div>
          <div className={styles.tag}>English Platform</div>
        </div>
      ) : null}
    </div>
  );
}
